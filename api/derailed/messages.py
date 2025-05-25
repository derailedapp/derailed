# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

import re
from time import time
from typing import Annotated, cast

import asyncpg
from fastapi import APIRouter, Depends, HTTPException
from fastapi.params import Query
from pydantic import BaseModel, Field

from .db import (assure_channel_membership, get_channel, get_current_session,
                 get_database, get_guild_channel, snow, to_list_dict)
from .models import Channel, Message, Session

router = APIRouter()


@router.get("/channels/{channel_id}/message")
async def get_channel_messages(
    limit: Annotated[int, Query(50, ge=1, le=100)],
    before: Annotated[int | None, Query(None)],
    after: Annotated[int | None, Query(None)],
    around: Annotated[int | None, Query(None)],
    ses: Annotated[Session, Depends(get_current_session)],
    channel: Annotated[Channel, Depends(get_channel)],
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
) -> list[Message]:
    try:
        await get_guild_channel(channel, db)
    except HTTPException:
        pass
    else:
        raise HTTPException(400, "Guild channels not yet supported")

    await assure_channel_membership(channel, ses, db)

    if before and after or after and around or before and around:
        raise HTTPException(400, "Only one query parameter may be used")

    if before:
        messages = await db.fetch(
            "SELECT * FROM messages WHERE id < $1 AND channel_id = $3 ORDER BY DESC LIMIT $2;",
            before,
            limit,
            channel["id"],
        )
    elif after:
        messages = await db.fetch(
            "SELECT * FROM messages WHERE id > $1 AND channel_id = $3 ORDER BY DESC LIMIT $2;",
            before,
            limit,
            channel["id"],
        )
    elif around:
        pieces = round(limit / 2)
        messages = await db.fetch(
            "SELECT * FROM messages WHERE id < $1 AND channel_id = $3 ORDER BY DESC LIMIT $2 UNION SELECT * FROM messages WHERE id > $1 AND channel_id = $3 ORDER BY DESC LIMIT $2",
            around,
            pieces,
            channel["id"],
        )
    else:
        messages = await db.fetch(
            "SELECT * FROM messages WHERE channel_id = $1 ORDER BY DESC LIMIT $2;",
            channel["id"],
            limit,
        )

    return to_list_dict(messages)


class CreateMessage(BaseModel):
    content: str


MENTION_RE = re.compile(r"<@(\d+)>")


@router.post("/channels/{channel_id}/messages", status_code=201)
async def create_message(
    model: CreateMessage,
    ses: Annotated[Session, Depends(get_current_session)],
    channel: Annotated[Channel, Depends(get_channel)],
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
) -> Message:
    if model.content.strip() == "":
        raise HTTPException(400, "Message content empty")

    try:
        await get_guild_channel(channel, db)
    except HTTPException:
        pass
    else:
        raise HTTPException(400, "Guild channels not yet supported")

    await assure_channel_membership(channel, ses, db)

    created_at = int(time())
    async with db.acquire() as conn:
        async with conn.transaction():
            message = await db.fetchrow(
                "INSERT INTO messages (id, author_id, content, channel_id, created_at, last_modified_at) VALUES ($1, $2, $3, $4, $5, $5) RETURNING *;",
                next(snow),
                ses["account_id"],
                model.content,
                channel["id"],
                created_at,
            )
            mentions = MENTION_RE.findall(model.content)

            user_ids: list[int] = []

            for mention in mentions:
                if mention in user_ids:
                    continue
                else:
                    user_ids.append(mention)
                try:
                    await db.execute(
                        "INSERT INTO message_mentions (channel_id, user_id) VALUES ($1, $2);",
                        channel["id"],
                        int(mention),
                    )
                except (ValueError, asyncpg.exceptions.ForeignKeyViolationError):
                    # ignore it
                    continue

            del user_ids

    return cast(Message, dict(cast(asyncpg.Record, message)))


class UpdateMessage(BaseModel):
    content: Annotated[str | None, Field(None)]


@router.patch("/channels/{channel_id}/messages/{message_id}")
async def update_message(
    model: UpdateMessage,
    message_id: int,
    ses: Annotated[Session, Depends(get_current_session)],
    channel: Annotated[Channel, Depends(get_channel)],
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
) -> Message:
    if model.content and model.content.strip() == "":
        raise HTTPException(400, "Message content empty")

    await assure_channel_membership(channel, ses, db)

    message = await db.fetchrow(
        "SELECT * FROM messages WHERE id = $1 AND channel_id = $2 AND author_id = $3;",
        message_id,
        channel["id"],
        ses["account_id"],
    )

    if message is None:
        raise HTTPException(404, "Message not found")

    message = cast(Message, dict(message))

    if model.content is not None:
        message["content"] = model.content
        await db.execute(
            "UPDATE messages SET content = $1 WHERE id = $2;",
            model.content,
            message["id"],
        )

    return message


@router.delete("/channels/{channel_id}/messages/{message_id}", status_code=204)
async def delete_message(
    model: UpdateMessage,
    message_id: int,
    ses: Annotated[Session, Depends(get_current_session)],
    channel: Annotated[Channel, Depends(get_channel)],
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
) -> str:
    try:
        await get_guild_channel(channel, db)
    except HTTPException:
        pass
    else:
        raise HTTPException(400, "Guild channels not yet supported")

    await assure_channel_membership(channel, ses, db)

    message = await db.fetchrow(
        "DELETE FROM messages WHERE id = $1 AND channel_id = $2 AND author_id = $3 RETURNING *;",
        message_id,
        channel["id"],
        ses["account_id"],
    )

    if message is None:
        raise HTTPException(404, "Message not found")

    return ""


@router.post("/channels/{channel_id}/messages/{message_id}/read", status_code=204)
async def message_read(
    model: UpdateMessage,
    message_id: int,
    ses: Annotated[Session, Depends(get_current_session)],
    channel: Annotated[Channel, Depends(get_channel)],
    db: Annotated[asyncpg.Pool[asyncpg.Record], Depends(get_database)],
) -> str:
    if model.content and model.content.strip() == "":
        raise HTTPException(400, "Message content empty")

    await assure_channel_membership(channel, ses, db)

    message = await db.fetchrow(
        "SELECT * FROM messages WHERE id = $1 AND channel_id = $2 AND author_id = $3;",
        message_id,
        channel["id"],
        ses["account_id"],
    )

    if message is None:
        raise HTTPException(404, "Message not found")

    mentions: int = await db.fetchval(
        "SELECT count(message_id) FROM message_mentions WHERE channel_id = $1 AND message_id > $2 AND user_id = $3;",
        channel["id"],
        message_id,
        ses["account_id"],
    )

    await db.execute(
        "UPDATE read_states SET last_message_id = $3, mentions = $4 WHERE user_id = $1 AND channel_id = $2;",
        ses["account_id"],
        channel["id"],
        message_id,
        mentions,
    )

    return ""
