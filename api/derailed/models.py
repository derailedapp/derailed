# Licensed under AGPL-3.0. Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

from typing import NotRequired, TypedDict

class Account(TypedDict):
    id: str
    email: str
    password: NotRequired[str]
    flags: int


class Profile(TypedDict):
    user_id: str
    username: str
    display_name: str | None
    avatar: str | None
    banner: str | None
    flags: int


class Session(TypedDict):
    id: int
    account_id: str
    expires_at: int
    browser: str | None
    operating_system: str | None
    location: str | None
    last_usage: int


class Channel(TypedDict):
    id: str
    type: int
    name: str | None
    owner_id: str | None


class GuildChannel(TypedDict):
    channel_id: str
    guild_id: str
    position: int
    parent_id: str | None


class Message(TypedDict):
    id: str
    author_id: str
    content: str
    channel_id: str
    created_at: int
    last_modified_at: int


class ReadState(TypedDict):
    channel_id: str
    user_id: str
    mentions: int
    last_message_id: str
