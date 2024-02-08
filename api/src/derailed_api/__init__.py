import sys

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.concurrency import asynccontextmanager
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from derailed_api.error import Error

load_dotenv()

from .meta import meta
from .routers import messages, users


@asynccontextmanager
async def lifespan(_: FastAPI):
    print("Start: sequence start", file=sys.stderr)
    await meta.start()
    print("Start: sequence complete", file=sys.stderr)
    yield
    print("Shutdown: sequence start", file=sys.stderr)
    await meta.db.close()
    await meta.redis.close()
    print("Shutdown: sequence complete", file=sys.stderr)


app = FastAPI(openapi_url=None, docs_url=None, redoc_url=None, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(users)
app.include_router(messages)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_req: Request, exc: RequestValidationError):
    return JSONResponse(
        {
            "code": 0,
            "message": "Invalid data",
            "_errors": jsonable_encoder(exc.errors()),
        },
        400,
    )


@app.exception_handler(Error)
async def default_error_exception_handler(_req: Request, exc: Error):
    return JSONResponse(exc.to_json(), exc.status_code)


@app.exception_handler(500)
async def internal_error_exception_handler(_req: Request, _exc: Exception):
    return JSONResponse({"code": 0, "message": "Internal server error"}, 500)


@app.exception_handler(404)
async def not_found_handler(_req: Request, _exc: Exception):
    return JSONResponse({"code": 0, "message": "Not Found"}, 404)
