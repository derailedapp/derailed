import base64
from typing import Annotated

import argon2
import asyncpg.exceptions
import itsdangerous
import pydantic
from fastapi import APIRouter, Request

from ..error import Error
from ..factors.user_factors import get_user_from_token
from ..meta import meta
from ..missing import MISSING, Maybe

router = APIRouter()
pwhasher = argon2.PasswordHasher()


class Login(pydantic.BaseModel):
    username: Annotated[str, pydantic.Field(min_length=3, max_length=32)]
    password: Annotated[str, pydantic.Field(min_length=8, max_length=128)]


@router.post("/login")
async def login(model: Login):
    async with meta.db.acquire() as session:
        user = await session.fetchrow(
            "SELECT * FROM users WHERE username = $1;", model.username.lower()
        )

        if user is None:
            raise Error(1005, "Invalid username")

        user = dict(user)

        pw = user.pop("password")

        try:
            pwhasher.verify(pw, model.password)
        except argon2.exceptions.VerifyMismatchError:
            raise Error(1006, "Invalid password")

        signer = itsdangerous.TimestampSigner(pw)

        user["_token"] = signer.sign(base64.b64encode(str(user["id"]).encode()))

        return user


class PatchUser(pydantic.BaseModel):
    username: Annotated[
        Maybe[str], pydantic.Field(MISSING, min_length=3, max_length=32)
    ]
    password: Annotated[
        Maybe[str], pydantic.Field(MISSING, min_length=8, max_length=128)
    ]


@router.patch("/users/@me")
async def modify_user(request: Request, model: PatchUser):
    async with meta.db.acquire() as session:
        user = await get_user_from_token(request, session)

        async with session.transaction():
            if model.username:
                if model.username != user["username"]:
                    user["username"] = model.username.lower()
                    try:
                        await session.execute(
                            "UPDATE users SET username = $1 WHERE id = $2",
                            model.username.lower(),
                            user["id"],
                        )
                    except asyncpg.UniqueViolationError:
                        raise Error(1000, "username must be unique")
            if model.password:
                await session.execute(
                    "UPDATE users SET password = $1 WHERE id = $2",
                    pwhasher.hash(model.password),
                    user["id"],
                )

        await meta.publish_user("USER_UPDATE", user["id"], user)

        return user


## TODO: user following status api routes
