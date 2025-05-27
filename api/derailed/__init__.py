# Licensed under AGPL-3.0. Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

from dotenv import load_dotenv

load_dotenv()

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import accounts, messages, relationships
from .utils import is_debug

app = FastAPI()

if is_debug():
    app.debug = True

app.include_router(relationships.router)
app.include_router(accounts.router)
app.include_router(messages.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOW_ORIGINS", "").split(","),
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)
