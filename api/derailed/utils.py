# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

import os


def is_debug() -> bool:
    if os.environ["DEBUG"].lower() == "true":
        return True
    return False
