# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

from enum import Enum, auto
from typing import Literal


class _MissingEnum(Enum):
    MISSING = auto()

    def __bool__(self) -> Literal[False]:
        return False


MISSING: Literal[_MissingEnum.MISSING] = _MissingEnum.MISSING
type Maybe[T] = T | _MissingEnum
