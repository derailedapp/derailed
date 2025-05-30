#!/bin/sh

sqlx migrate run
uv run fastapi run ./derailed/__init__.py