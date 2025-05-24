# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

import secrets
from base64 import b32encode
from hashlib import sha256
from random import randint
from time import time
from typing import Annotated, cast

import asyncpg
from aiocache import SimpleMemoryCache  # type: ignore
from argon2 import PasswordHasher
from argon2 import exceptions as argon_exceptions
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

from .db import get_current_session, get_database, snow
from .emails import send_verification_email
from .missing import MISSING, Maybe
from .models import Account, Profile, Session

router = APIRouter()
hasher = PasswordHasher()
cache = SimpleMemoryCache()


class EmailVerification(BaseModel):
    email: EmailStr


@router.post("/verify-email", status_code=201)
async def send_email_verification(model: EmailVerification) -> str:
    code1, code2 = randint(100, 999), randint(100, 999)
    await send_verification_email(code1, code2, model.email)

    await cache.set(model.email, f"{code1}-{code2}", ttl=1_800)  # type: ignore

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
    model: Register, db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)]
) -> TokenData:
    username_used = await db.fetchrow(
        "SELECT id FROM profiles WHERE lower(username) = $1 OR email = $2;",
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
                model.session_detail.location,
                current_time,
            )

    return TokenData(token=str(token))


class Login(BaseModel):
    email: EmailStr
    password: str
    session_detail: SessionDetail


@router.post("/login", status_code=201)
async def login(
    model: Login, db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)]
) -> TokenData:
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
        model.session_detail.location,
        current_time,
    )

    return TokenData(token=str(token))


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
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
) -> User:
    async with db.acquire() as conn:
        async with conn.transaction():
            if model.username:
                username_used = await conn.fetchrow(
                    "SELECT id FROM profiles WHERE lower(username) = $1",
                    model.username.lower(),
                )

                if username_used is not None:
                    raise HTTPException(400, "Username or email already used")
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

        return User(account=account, profile=profile)
