# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

import os
from hashlib import sha256
from typing import Annotated, cast

import asyncpg
from fastapi import Depends, Header, HTTPException, Path
from snowflake import SnowflakeGenerator  # type: ignore

from .models import (Account, Channel, GuildChannel, Profile,  # type: ignore
                     Session)

db: asyncpg.Pool[asyncpg.Record] | None = None
snow = SnowflakeGenerator(int(os.getenv("NODE_ID", "1")), epoch=1649325271415)


async def get_database() -> asyncpg.Pool[asyncpg.Record]:
    global db

    if db is None:
        db = await asyncpg.create_pool(os.environ["DATABASE_URL"])

    return db


async def get_current_session_optional(
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
    token: Annotated[str, Header("", alias="authorization")],
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
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
) -> Account:
    account = await db.fetchrow("SELECT * FROM accounts WHERE id = $1;", user_id)

    if account is None:
        raise HTTPException(404, "User not found")
    return cast(Account, dict(account))


async def get_profile(
    user_id: Annotated[int, Path()],
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
) -> Profile:
    profile = await db.fetchrow("SELECT * FROM profiles WHERE user_id = $1;", user_id)

    if profile is None:
        raise HTTPException(404, "User not found")
    return cast(Profile, dict(profile))


async def get_channel(
    channel_id: Annotated[int, Path()],
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
) -> Channel:
    channel = await db.fetchrow("SELECT * FROM channels WHERE id = $1;", channel_id)

    if channel is None:
        raise HTTPException(404, "Channel not found")

    return cast(Channel, dict(channel))


async def get_guild_channel(
    channel: Annotated[Channel, Depends(get_channel)],
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
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
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
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
