# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

from typing import TypedDict


class Account(TypedDict):
    id: int
    email: str
    password: str
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
