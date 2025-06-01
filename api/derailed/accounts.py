# Licensed under AGPL-3.0. Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

import asyncio
import secrets
from asyncio import to_thread
from base64 import b32encode
from hashlib import sha256
from random import randint
from time import time
from typing import Annotated, cast

import asyncpg
from aiocache import SimpleMemoryCache  # type: ignore
from argon2 import PasswordHasher
from argon2 import exceptions as argon_exceptions
from datauri import DataURI
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, EmailStr, Field
from pyvips import Error, Image

from .db import (
    Pool,
    delete_file,
    get_current_session,
    get_database,
    get_profile,
    snow,
    upload_file,
)
from .emails import send_verification_email
from .missing import MISSING, Maybe
from .models import Account, Profile, Session
from .utils import dispatch_channel

router = APIRouter()
hasher = PasswordHasher()
cache = SimpleMemoryCache()


class EmailVerification(BaseModel):
    email: EmailStr


@router.post("/verify-email", status_code=201)
async def send_email_verification(model: EmailVerification) -> str:
    code1, code2 = randint(100, 999), randint(100, 999)
    await send_verification_email(code1, code2, model.email)

    await cache.set(model.email, f"{code1}{code2}", ttl=1_800)  # type: ignore

    return ""


class SessionDetail(BaseModel):
    operating_system: Annotated[str, Field(min_length=1, max_length=32)]
    browser: Annotated[str, Field(min_length=1, max_length=32)]
    location: Annotated[str, Field(min_length=1, max_length=32)]


class Register(BaseModel):
    email: EmailStr
    username: Annotated[str, Field(min_length=4, max_length=32)]
    password: str
    session_detail: SessionDetail
    code: Annotated[str, Field(min_length=6, max_length=6)]


class TokenData(BaseModel):
    token: str


@router.post("/register", status_code=201)
async def register_account(
    model: Register, db: Annotated[Pool, Depends(get_database)]
) -> TokenData:
    username_used = await db.fetchrow(
        "SELECT user_id FROM profiles WHERE lower(username) = $1 OR user_id IN (SELECT id FROM accounts WHERE email = $2);",
        model.username.lower(),
        model.email.lower(),
    )

    if username_used is not None:
        raise HTTPException(400, "Username or email already used")

    code = cast(str | None, await cache.get(model.email))  # type: ignore
    if code != model.code:
        raise HTTPException(400, "Incorrect or non-present email verification code")

    user_id = cast(int, next(snow))
    password_hash = hasher.hash(model.password)
    token = b32encode(secrets.token_bytes(32))

    async with db.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                "INSERT INTO accounts (id, email, password, flags) VALUES ($1, $2, $3, 0)",
                user_id,
                model.email.lower(),
                password_hash,
            )
            await conn.execute(
                "INSERT INTO profiles (user_id, username, flags) VALUES ($1, $2, 0)",
                user_id,
                model.username,
            )
            current_time = int(time())
            session_id = sha256(token).hexdigest()
            await conn.execute(
                """INSERT INTO sessions (id, account_id, expires_at, browser, operating_system, location, last_usage)
                VALUES ($1, $2, $3, $4, $5, $6, $7)""",
                session_id,
                user_id,
                current_time + 1_814_400,  # 3 weeks
                model.session_detail.browser,
                model.session_detail.operating_system,
                model.session_detail.location,
                current_time,
            )

    return TokenData(token=token.decode())


class Login(BaseModel):
    email: EmailStr
    password: str
    session_detail: SessionDetail


@router.post("/login", status_code=201)
async def login(model: Login, db: Annotated[Pool, Depends(get_database)]) -> TokenData:
    account = await db.fetchrow(
        "SELECT id, password FROM accounts WHERE email = $1", model.email.lower()
    )

    if account is None:
        raise HTTPException(400, "Email or password incorrect")

    try:
        hasher.verify(account["password"], model.password)
    except argon_exceptions.VerificationError as exc:
        raise HTTPException(400, "Email or password incorrect") from exc

    token = b32encode(secrets.token_bytes(32))

    current_time = int(time())
    session_id = sha256(token).hexdigest()
    await db.execute(
        """INSERT INTO sessions (id, account_id, expires_at, browser, operating_system, location, last_usage)
        VALUES ($1, $2, $3, $4, $5, $6, $7)""",
        session_id,
        account["id"],
        current_time + 1_814_400,  # 3 weeks
        model.session_detail.browser,
        model.session_detail.operating_system,
        model.session_detail.location,
        current_time,
    )

    return TokenData(token=token.decode())


class ModifySelf(BaseModel):
    username: Maybe[str] = Field(MISSING, min_length=4, max_length=32)
    email: Maybe[EmailStr] = Field(MISSING)
    password: Maybe[str] = Field(MISSING)
    old_password: Maybe[str] = Field(MISSING)
    display_name: Maybe[str | None] = Field(MISSING, min_length=1, max_length=32)


class User(BaseModel):
    account: Account
    profile: Profile


@router.patch("/users/@me")
async def modify_self(
    model: ModifySelf,
    ses: Annotated[Session, Depends(get_current_session)],
    db: Annotated[Pool, Depends(get_database)],
) -> User:
    async with db.acquire() as conn:
        async with conn.transaction():
            if model.username:
                profile = await get_profile(ses["account_id"], db)
                if model.username.lower() != profile["username"].lower():
                    username_used = await conn.fetchrow(
                        "SELECT id FROM profiles WHERE lower(username) = $1",
                        model.username.lower(),
                    )

                    if username_used is not None:
                        raise HTTPException(400, "Username already used")
                await conn.execute(
                    "UPDATE profiles SET username = $1 WHERE user_id = $2",
                    model.username,
                    ses["account_id"],
                )

            if model.display_name:
                await conn.execute(
                    "UPDATE profiles SET display_name = $1 WHERE user_id = $2",
                    model.display_name,
                    ses["account_id"],
                )

            if model.email:
                if not model.old_password:
                    raise HTTPException(403, "Password required for changing email")

                password = cast(
                    str,
                    await conn.fetchval(
                        "SELECT password FROM accounts WHERE id = $1", ses["account_id"]
                    ),
                )

                try:
                    hasher.verify(password, model.old_password)
                except argon_exceptions.VerificationError as exc:
                    raise HTTPException(400, "Password incorrect") from exc

                await conn.execute(
                    "UPDATE accounts SET email = $1 WHERE id = $2",
                    model.email,
                    ses["account_id"],
                )

            if model.password:
                if not model.old_password:
                    raise HTTPException(403, "Password required for changing password")

                password = cast(
                    str,
                    await conn.fetchval(
                        "SELECT password FROM accounts WHERE id = $1", ses["account_id"]
                    ),
                )

                try:
                    hasher.verify(password, model.old_password)
                except argon_exceptions.VerificationError as exc:
                    raise HTTPException(400, "Password incorrect") from exc

                password_hash = hasher.hash(model.password)

                await conn.execute(
                    "UPDATE accounts SET password = $1 WHERE id = $2",
                    password_hash,
                    ses["account_id"],
                )

        account = cast(
            Account,
            dict(
                cast(
                    asyncpg.Record,
                    await conn.fetchrow(
                        "SELECT * FROM accounts WHERE id = $1;", ses["account_id"]
                    ),
                )
            ),
        )
        account.pop("password")
        profile = cast(
            Profile,
            dict(
                cast(
                    asyncpg.Record,
                    await conn.fetchrow(
                        "SELECT * FROM profiles WHERE user_id = $1;", ses["account_id"]
                    ),
                )
            ),
        )

        channels = await conn.fetch(
            "SELECT id FROM channels WHERE id IN (SELECT channel_id FROM channel_members WHERE user_id = $1);",
            ses["account_id"],
        )

        for channel in channels:
            await dispatch_channel(channel["id"], "USER_UPDATE", profile)

        return User(account=account, profile=profile)


class ModifyAssets(BaseModel):
    avatar: Maybe[DataURI | None] = Field(MISSING)
    banner: Maybe[DataURI | None] = Field(MISSING)


def avatar_to_webp(image: Image) -> bytes:
    scale = max(400 / image.width, 400 / image.height)  # type: ignore
    resized = image.resize(scale)  # type: ignore

    # Crop center to 400x400
    left = (resized.width - 400) // 2  # type: ignore
    top = (resized.height - 400) // 2  # type: ignore
    cropped = resized.crop(left, top, 400, 400)  # type: ignore

    return cropped.webpsave_buffer(Q=40, lossless=False, near_lossless=True, strip=True)


def banner_to_webp(image: Image) -> bytes:
    scale = max(980 / image.width, 400 / image.height)  # type: ignore
    resized = image.resize(scale)  # type: ignore

    # Crop center to 980x350
    left = (resized.width - 980) // 2  # type: ignore
    top = (resized.height - 400) // 2  # type: ignore
    cropped = resized.crop(left, top, 980, 400)  # type: ignore

    return cropped.webpsave_buffer(Q=40, lossless=False, near_lossless=True, strip=True)


@router.patch("/users/@me/assets")
async def modify_assets(
    model: ModifyAssets,
    ses: Annotated[Session, Depends(get_current_session)],
    db: Annotated[Pool, Depends(get_database)],
) -> Profile:
    async with db.acquire() as conn:
        profile = await get_profile(ses["account_id"], db)
        async with conn.transaction():
            if model.avatar is None:
                await db.execute(
                    "UPDATE profiles SET avatar = $1 WHERE user_id = $2;",
                    None,
                    ses["account_id"],
                )
                profile["avatar"] = None

            if model.avatar:
                print(model.avatar.mimetype)
                if model.avatar.mimetype in [
                    "image/png",
                    "image/webp",
                    "image/gif",
                    "image/jpeg",
                ]:
                    try:
                        image: Image = cast(
                            Image,
                            Image.new_from_buffer(
                                model.avatar.data, "", fail=True, access="sequential"
                            ),
                        )
                    except Error:
                        raise HTTPException(400, "Invalid image")

                    avatar = await to_thread(avatar_to_webp, image=image)
                    avatar_id = str(next(snow))
                    if profile["avatar"] is not None:
                        await delete_file("avatars", profile["avatar"])
                    await upload_file("avatars", avatar_id, avatar)
                    await conn.execute(
                        "UPDATE profiles SET avatar = $1 WHERE user_id = $2;",
                        avatar_id,
                        ses["account_id"],
                    )
                else:
                    raise HTTPException(400, "Mimetype not supported")

            if model.banner is None:
                await db.execute(
                    "UPDATE profiles SET banner = $1 WHERE user_id = $2;",
                    None,
                    ses["account_id"],
                )
                profile["banner"] = None

            if model.banner:
                print(model.banner.mimetype)
                if model.banner.mimetype in [
                    "image/png",
                    "image/webp",
                    "image/gif",
                    "image/jpeg",
                ]:
                    try:
                        image: Image = cast(
                            Image,
                            Image.new_from_buffer(
                                model.banner.data, "", fail=True, access="sequential"
                            ),
                        )
                    except Error:
                        raise HTTPException(400, "Invalid image")

                    banner = await to_thread(banner_to_webp, image=image)
                    banner_id = str(next(snow))
                    if profile["banner"] is not None:
                        await delete_file("banners", profile["banner"])
                    await upload_file("banners", banner_id, banner)
                    await conn.execute(
                        "UPDATE profiles SET banner = $1 WHERE user_id = $2;",
                        banner_id,
                        ses["account_id"],
                    )
                else:
                    raise HTTPException(400, "Mimetype not supported")

        channel_ids = await conn.fetch(
            "SELECT id FROM channels WHERE id IN (SELECT channel_id FROM channel_members WHERE user_id = $1);",
            ses["account_id"],
        )

    await asyncio.gather(
        *[dispatch_channel(c["id"], "USER_UPDATE", profile) for c in channel_ids]
    )

    return cast(Profile, dict(cast(asyncpg.Record, profile)))

@router.post("/logout", status_code=204)
async def logout(
    _: Annotated[Session, Depends(get_current_session)],
    token: Annotated[str, Header(alias="authorization")],
    db: Annotated[Pool, Depends(get_database)],
):
    session_id = sha256(token.encode()).hexdigest()

    async with db.acquire() as conn:
        await conn.execute("DELETE FROM sessions WHERE id = $1;", session_id)