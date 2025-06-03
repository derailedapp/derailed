# Licensed under AGPL-3.0. Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

from typing import NotRequired, TypedDict
from ulid import ULID

class Account(TypedDict):
    id: ULID
    email: str
    password: NotRequired[str]
    flags: int


class Profile(TypedDict):
    user_id: ULID
    username: str
    display_name: str | None
    avatar: str | None
    banner: str | None
    flags: int


class Session(TypedDict):
    id: int
    account_id: ULID
    expires_at: int
    browser: str | None
    operating_system: str | None
    location: str | None
    last_usage: int


class Channel(TypedDict):
    id: ULID
    type: int
    name: str | None
    owner_id: ULID | None


class GuildChannel(TypedDict):
    channel_id: ULID
    guild_id: ULID
    position: int
    parent_id: ULID | None


class Message(TypedDict):
    id: ULID
    author_id: ULID
    content: str
    channel_id: ULID
    created_at: int
    last_modified_at: int


class ReadState(TypedDict):
    channel_id: ULID
    user_id: ULID
    mentions: int
    last_message_id: ULID
