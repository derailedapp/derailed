# Licensed under AGPL-3.0. Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

from __future__ import annotations

import io
import os
from hashlib import sha256
from typing import TYPE_CHECKING, Annotated, cast

import aioboto3
import asyncpg
from fastapi import Depends, Header, HTTPException, Path
from ulid import ULID

from .models import Account, Channel, GuildChannel, Profile, Session  # type: ignore

db: Pool | None = None
boto3_session: aioboto3.Session | None = None

if TYPE_CHECKING:
    type Pool = asyncpg.Pool[asyncpg.Record]
else:
    type Pool = asyncpg.Pool


async def upload_file(bucket: str, key: str, file: bytes) -> None:
    global boto3_session
    endpoint = os.getenv("S3_ENDPOINT")
    if endpoint is None:
        return

    if boto3_session is None:
        boto3_session = aioboto3.Session()

    async with boto3_session.client(
        "s3",
        region_name="us-east-1",
        aws_access_key_id=os.environ["S3_ACCESS_KEY"],
        aws_secret_access_key=os.environ["S3_SECRET_KEY"],
        endpoint_url=endpoint,
        use_ssl=False,
    ) as s3:
        try:
            await s3.create_bucket(Bucket=bucket)
        except s3.exceptions.BucketAlreadyOwnedByYou:
            pass

        await s3.upload_fileobj(Fileobj=io.BytesIO(file), Bucket=bucket, Key=key)


async def delete_file(
    bucket: str,
    key: str,
) -> None:
    global boto3_session
    endpoint = os.getenv("S3_ENDPOINT")
    if endpoint is None:
        return

    if boto3_session is None:
        boto3_session = aioboto3.Session()

    async with boto3_session.client(
        "s3",
        region_name="us-east-1",
        aws_access_key_id=os.environ["S3_ACCESS_KEY"],
        aws_secret_access_key=os.environ["S3_SECRET_KEY"],
        endpoint_url=endpoint,
        use_ssl=False,
    ) as s3:
        await s3.delete_object(Bucket=bucket, Key=key)


async def get_database() -> Pool:
    global db

    if db is None:
        db = await asyncpg.create_pool(os.environ["DATABASE_URL"])

    return db


async def get_current_session_optional(
    db: Annotated[Pool, Depends(get_database)],
    token: Annotated[str, Header(alias="authorization")] = "",
) -> Session | None:
    session_id = sha256(token.encode()).hexdigest()
    res = await db.fetchrow("SELECT * FROM sessions WHERE id = $1;", session_id)
    if res is None:
        return None
    else:
        return cast(Session, dict(res))


async def get_current_session(
    session: Annotated[Session | None, Depends(get_current_session_optional)],
) -> Session:
    if session is None:
        raise HTTPException(401, "Invalid or null token")

    return session


async def get_mentioned_user(
    user_id: Annotated[int, Path()],
    db: Annotated[Pool, Depends(get_database)],
) -> Account:
    account = await db.fetchrow("SELECT * FROM accounts WHERE id = $1;", user_id)

    if account is None:
        raise HTTPException(404, "User not found")
    return cast(Account, dict(account))


async def get_profile(
    user_id: Annotated[str, Path(alias="username")],
    db: Annotated[Pool, Depends(get_database)],
) -> Profile:
    try: 
        ULID.parse(user_id)
        profile = await db.fetchrow(
            "SELECT * FROM profiles WHERE user_id = $1;", user_id
        )
    except:
        profile = await db.fetchrow(
            "SELECT * FROM profiles WHERE username = $1;", user_id
        )

    if profile is None:
        raise HTTPException(404, "User not found")
    return cast(Profile, dict(profile))


async def get_channel(
    channel_id: Annotated[int, Path()],
    db: Annotated[Pool, Depends(get_database)],
) -> Channel:
    channel = await db.fetchrow("SELECT * FROM channels WHERE id = $1;", channel_id)

    if channel is None:
        raise HTTPException(404, "Channel not found")

    return cast(Channel, dict(channel))


async def get_guild_channel(
    channel: Annotated[Channel, Depends(get_channel)],
    db: Annotated[Pool, Depends(get_database)],
) -> GuildChannel:
    guild_channel = await db.fetchrow(
        "SELECT * FROM guild_channels WHERE channel_id = $1;", channel["id"]
    )

    if guild_channel is None:
        raise HTTPException(403, "Channel is not a guild channel")
    return cast(GuildChannel, dict(guild_channel))


async def assure_channel_membership(
    channel: Annotated[Channel, Depends(get_channel)],
    ses: Annotated[Session, Depends(get_current_session)],
    db: Annotated[Pool, Depends(get_database)],
) -> None:
    member = await db.fetchval(
        "SELECT 1 FROM channel_members WHERE user_id = $1 AND channel_id = $2;",
        ses["account_id"],
        channel["id"],
    )

    if member is None:
        raise HTTPException(403, "You do not have access to this channel")


def to_list_dict[T](li: list[asyncpg.Record]) -> list[T]:  # type: ignore
    return cast(list[T], [dict(i) for i in li])
