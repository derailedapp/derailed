# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

import os
from typing import Any

import grpc.aio as grpc

from .gateway import GatewayStub, Interchange


def is_debug() -> bool:
    if os.environ["DEBUG"].lower() == "true":
        return True
    return False


async def dispatch_user(user_id: int, type: str, data: Any) -> None:
    grpc_target = os.getenv("GRPC_TARGET")
    if grpc_target is None:
        return

    async with grpc.insecure_channel(grpc_target) as channel:
        stub = GatewayStub(channel)
        await stub.dispatch_user(Interchange(t=type, id=user_id, d=data))  # type: ignore


async def dispatch_channel(channel_id: int, type: str, data: Any) -> None:
    grpc_target = os.getenv("GRPC_TARGET")
    if grpc_target is None:
        return

    async with grpc.insecure_channel(grpc_target) as channel:
        stub = GatewayStub(channel)
        await stub.dispatch_channel(Interchange(t=type, id=channel_id, d=data))  # type: ignore
