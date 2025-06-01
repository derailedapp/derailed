# Licensed under AGPL-3.0. Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

from typing import NotRequired, TypedDict


class Account(TypedDict):
    id: int
    email: str
    password: NotRequired[str]
    flags: int


class Profile(TypedDict):
    user_id: int
    username: str
    display_name: str | None
    avatar: str | None
    banner: str | None
    flags: int


class Session(TypedDict):
    id: str
    account_id: int
    expires_at: int
    browser: str | None
    operating_system: str | None
    location: str | None
    last_usage: int


class Channel(TypedDict):
    id: int
    type: int
    name: str | None
    owner_id: int | None


class GuildChannel(TypedDict):
    channel_id: int
    guild_id: int
    position: int
    parent_id: int | None


class Message(TypedDict):
    id: int
    author_id: int
    content: str
    channel_id: int
    created_at: int
    last_modified_at: int


class ReadState(TypedDict):
    channel_id: int
    user_id: int
    mentions: int
    last_message_id: int
