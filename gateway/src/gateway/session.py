import asyncio
import base64
import binascii
from random import randint
from typing import Any

import msgspec
import pydantic
import websockets.server as websockets
from itsdangerous import TimestampSigner
from pydantic import BaseModel

from .meta import meta


async def authorize(auth: str) -> dict[str, Any] | None:
    try:
        fragmented = auth.split(".")
        enc_id = fragmented[0]
        user_id = int(base64.b64decode(enc_id.encode()).decode())
    except (IndexError, binascii.Error, UnicodeDecodeError, ValueError):
        return None

    async with meta.db.acquire() as session:
        user: dict[str, Any] = dict(await session.fetchrow("SELECT * FROM users WHERE id = $1", user_id))  # type: ignore

    if user is None:
        return None

    signer = TimestampSigner(user.pop("password"))

    if not signer.validate(auth):
        return None

    return dict(user)


class Identify(BaseModel):
    token: str


class Session:
    # WS Codes
    PAYLOAD_INVALID = 4000
    INVALID_AUTHORIZATION = 4001
    ALREADY_AUTHORIZED = 4002
    HEARTBEAT_MISSED = 4003
    HEARTBEAT_ALREADY_RECEIVED = 4004

    # Op Codes
    EVENT = 0
    HELLO = 1
    IDENTIFY = 2
    HEARTBEAT = 3
    ACK = 4

    def __init__(self, ws: websockets.WebSocketServerProtocol) -> None:
        self.ws = ws
        self.user = {}
        self.user_id: int = 0
        self.identified = False
        self.hb_received = False
        self.hb_interval = randint(43_000, 46_000)
        # add an extra buffer in case of connection issues
        self.actual_hb_interval = (self.hb_interval / 1000) + 1_000
        self.sequence = 0
        self._recv_fut = None
        self._hb_fut = None
        self._future = asyncio.Future()

    async def send(self, data: dict[str, Any]) -> None:
        self.sequence += 1
        data["s"] = self.sequence
        await self.ws.send(msgspec.json.encode(data).decode())

    async def stop(self, code: int, reason: str) -> None:
        await self.ws.close(code, reason)
        self._future.set_result(None)

    async def _recv(self) -> None:
        async for msg in self.ws:
            try:
                data = msgspec.json.decode(msg)
            except msgspec.DecodeError:
                await self.stop(self.PAYLOAD_INVALID, "Payload is invalid")
                break

            if "op" not in data:
                await self.stop(
                    self.PAYLOAD_INVALID, "Payload is invalid (Op Code not present)"
                )
                break

            if data["op"] == self.IDENTIFY:
                if self.identified:
                    await self.stop(
                        self.ALREADY_AUTHORIZED, "Connection is already authorized"
                    )
                    break

                try:
                    identify = Identify.model_validate(data["d"])
                except pydantic.ValidationError as err:
                    await self.stop(
                        self.PAYLOAD_INVALID,
                        err.json(indent=None, include_url=False, include_context=False),
                    )
                    break

                token = identify.token

                user = await authorize(token)

                if user is None:
                    await self.stop(
                        self.INVALID_AUTHORIZATION, "Authorization is invalid"
                    )
                    break

                self.user_id = user["id"]
                self.user = user

                # collect ready data
                async with meta.db.acquire() as session:
                    relationships_rec = await session.fetch(
                        "SELECT relation, target_user_id FROM relationships WHERE origin_user_id = $1;",
                        user["id"],
                    )
                    relationships = []
                    for r in relationships_rec:
                        relationships.append(dict(r))

                    row_channels = await session.fetch(
                        "SELECT * FROM channels WHERE id IN (SELECT channel_id FROM channel_members WHERE user_id = $1);",
                        user["id"],
                    )

                    channels = []

                    for c in row_channels:
                        channels.append(dict(c))

                    for channel in channels:
                        rows_members = await session.fetch(
                            "SELECT * FROM channel_members WHERE channel_id = $1",
                            channel["id"],
                        )

                        members: list[dict[str, Any]] = []

                        for m in rows_members:
                            members.append(dict(m)["user_id"])

                        channel["recipients"] = members

                    settings_row = await session.fetchrow(
                        "SELECT * FROM user_settings WHERE user_id = $1;", user["id"]
                    )

                    assert settings_row is not None

                await self.send(
                    {
                        "op": 0,
                        "t": "READY",
                        "d": {
                            "user": user,
                            "relationships": relationships,
                            "channels": channels,
                            "settings": dict(settings_row),
                        },
                    }
                )
            # NOTE: once we move to Elixir, force users to provide a sequence either 10 above or under the actual sequence (to avoid disconnection due to network issues)
            elif data["op"] == self.HEARTBEAT:
                if self.hb_received:
                    await self.stop(
                        self.HEARTBEAT_ALREADY_RECEIVED, "Heartbeat Already Received"
                    )
                    break

                self.hb_received = True
            else:
                await self.stop(self.PAYLOAD_INVALID, "Invalid Op Code provided")
                break

    async def hb_wait(self) -> None:
        await asyncio.sleep(self.actual_hb_interval)
        if not self.hb_received:
            await self.stop(self.HEARTBEAT_MISSED, "Heartbeat was missed")

        await self.send({"op": self.ACK, "d": None})

        self._hb_fut = asyncio.create_task(self.hb_wait())

    async def run(self) -> None:
        self._recv_fut = asyncio.create_task(self._recv())
        await self.send(
            {"op": self.HELLO, "d": {"heartbeat_interval": self.hb_interval}}
        )
        self._hb_fut = asyncio.create_task(self.hb_wait())
        await self._future
        self._hb_fut.cancel()
        self._recv_fut.cancel()
