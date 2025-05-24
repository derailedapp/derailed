# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

import os
from hashlib import sha256
from typing import Annotated, cast

import asyncpg
from fastapi import Depends, Header, HTTPException
from snowflake import SnowflakeGenerator  # type: ignore

from .models import Session  # type: ignore

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
