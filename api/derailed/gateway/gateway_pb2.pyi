from typing import ClassVar as _ClassVar
from typing import Optional as _Optional

from google.protobuf import descriptor as _descriptor
from google.protobuf import empty_pb2 as _empty_pb2
from google.protobuf import message as _message

DESCRIPTOR: _descriptor.FileDescriptor

class Interchange(_message.Message):
    __slots__ = ("t", "id", "d")
    T_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    D_FIELD_NUMBER: _ClassVar[int]
    t: str
    id: str
    d: str
    def __init__(
        self, t: _Optional[str] = ..., id: _Optional[str] = ..., d: _Optional[str] = ...
    ) -> None: ...

class GuildInfo(_message.Message):
    __slots__ = ("id",)
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class GuildMetadata(_message.Message):
    __slots__ = ("available", "presences")
    AVAILABLE_FIELD_NUMBER: _ClassVar[int]
    PRESENCES_FIELD_NUMBER: _ClassVar[int]
    available: bool
    presences: int
    def __init__(
        self, available: bool = ..., presences: _Optional[int] = ...
    ) -> None: ...
