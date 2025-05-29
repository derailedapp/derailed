# Licensed under AGPL-3.0. Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from .db import Pool, get_current_session, get_database, get_profile, snow
from .models import Profile, Session
from .utils import dispatch_user

router = APIRouter()


class FollowResult(BaseModel):
    user: Profile
    relationship_type: int


@router.post("/users/{username}/follow", status_code=201)
async def follow_user(
    ses: Annotated[Session, Depends(get_current_session)],
    mentioned_user: Annotated[Profile, Depends(get_profile)],
    db: Annotated[Pool, Depends(get_database)],
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
        async with db.acquire() as conn:
            async with conn.transaction():
                await conn.executemany(
                    "UPDATE relationships SET type = 2 WHERE user_id = $1 AND target_user_id = $2;",
                    [
                        (ses["account_id"], mentioned_user["user_id"]),
                        (mentioned_user["user_id"], ses["account_id"]),
                    ],
                )

                channel = await conn.fetchrow(
                    "SELECT * FROM channels WHERE id IN (SELECT channel_id FROM channel_members WHERE user_id = $1 UNION SELECT channel_id FROM channel_members WHERE user_id = $2) AND type = 0;",
                    ses["account_id"],
                    mentioned_user["user_id"],
                )

                if channel is None:
                    channel_id = next(snow)
                    new_channel = await conn.execute(
                        "INSERT INTO channels (id, type) VALUES ($1, 0) RETURNING *;",
                        channel_id,
                    )
                    await conn.executemany(
                        "INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2);",
                        [
                            (channel_id, ses["account_id"]),
                            (channel_id, mentioned_user["user_id"]),
                        ],
                    )
                else:
                    new_channel = None

        profile = await get_profile(ses["account_id"], db)

        await dispatch_user(
            ses["account_id"],
            "RELATIONSHIP_UPDATE",
            {"user": mentioned_user, "type": 2},
        )
        await dispatch_user(
            mentioned_user["user_id"],
            "RELATIONSHIP_UPDATE",
            {"user": profile, "type": 2},
        )

        if new_channel:
            await dispatch_user(
                ses["account_id"], "PRIVATE_CHANNEL_CREATE", new_channel
            )
            await dispatch_user(
                mentioned_user["user_id"], "PRIVATE_CHANNEL_CREATE", new_channel
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

        profile = await get_profile(ses["account_id"], db)
        await dispatch_user(
            ses["account_id"],
            "RELATIONSHIP_UPDATE",
            {"user": mentioned_user, "type": 0},
        )
        await dispatch_user(
            mentioned_user["user_id"],
            "RELATIONSHIP_UPDATE",
            {"user": profile, "type": 1},
        )

    return FollowResult(relationship_type=0, user=mentioned_user)


@router.post("/users/{user_id}/relationship")
async def get_user_relationship(
    ses: Annotated[Session, Depends(get_current_session)],
    mentioned_user: Annotated[Profile, Depends(get_profile)],
    db: Annotated[Pool, Depends(get_database)],
) -> FollowResult:
    relationship_type = await db.fetchval(
        "SELECT type FROM relationships WHERE user_id = $1 AND target_user_id = $2;",
        ses["account_id"],
        mentioned_user["user_id"],
    )

    if relationship_type is None:
        raise HTTPException(404, "Relationship does not exist")

    return FollowResult(user=mentioned_user, relationship_type=relationship_type)
