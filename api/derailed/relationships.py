# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

from typing import Annotated

import asyncpg
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from .db import get_current_session, get_database, get_profile, snow
from .models import Profile, Session

router = APIRouter()


class FollowResult(BaseModel):
    user: Profile
    relationship_type: int


@router.post("/users/{user_id}/follow", status_code=201)
async def follow_user(
    ses: Annotated[Session, Depends(get_current_session)],
    mentioned_user: Annotated[Profile, Depends(get_profile)],
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
) -> FollowResult:
    if mentioned_user["user_id"] == ses["account_id"]:
        raise HTTPException(400, "Cannot follow yourself")

    relationship = await db.fetchrow(
        "SELECT * FROM relationships WHERE user_id = $1 AND target_user_id = $2;",
        ses["account_id"],
        mentioned_user["user_id"],
    )

    if relationship is not None and relationship["type"] in [0, 2]:
        raise HTTPException(400, "User is already followed")
    elif relationship is not None and relationship["type"] in [3, 4]:
        raise HTTPException(400, "User is blocked or has blocked you")
    elif relationship is not None and relationship["type"] == 1:
        await db.executemany(
            "UPDATE relationships SET type = 2 WHERE user_id = $1 AND target_user_id = $2;",
            [
                (ses["account_id"], mentioned_user["user_id"]),
                (mentioned_user["user_id"], ses["account_id"]),
            ],
        )

        return FollowResult(relationship_type=2, user=mentioned_user)

    async with db.acquire() as conn:
        async with conn.transaction():
            await conn.executemany(
                "INSERT INTO relationships (user_id, target_user_id, type) VALUES ($1, $2, $3);",
                [
                    (ses["account_id"], mentioned_user["user_id"], 0),
                    (mentioned_user["user_id"], ses["account_id"], 1),
                ],
            )
            channel_id = next(snow)
            await conn.execute(
                "INSERT INTO channels (id, type) VALUES ($1, 0)", channel_id
            )
            await conn.executemany(
                "INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2);",
                [
                    (channel_id, ses["account_id"]),
                    (channel_id, mentioned_user["user_id"]),
                ],
            )

    return FollowResult(relationship_type=0, user=mentioned_user)


@router.post("/users/{user_id}/relationship")
async def get_user_relationship(
    ses: Annotated[Session, Depends(get_current_session)],
    mentioned_user: Annotated[Profile, Depends(get_profile)],
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
) -> FollowResult:
    relationship_type = await db.fetchval(
        "SELECT type FROM relationships WHERE user_id = $1 AND target_user_id = $2;",
        ses["account_id"],
        mentioned_user["user_id"],
    )

    if relationship_type is None:
        raise HTTPException(404, "Relationship does not exist")

    return FollowResult(user=mentioned_user, relationship_type=relationship_type)
