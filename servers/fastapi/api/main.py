import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from contextlib import asynccontextmanager

from api.routers.presentation.router import presentation_router
from api.services.database import sql_engine
from api.utils import update_env_with_user_config


@asynccontextmanager
async def lifespan(_: FastAPI):
    os.makedirs(os.getenv("APP_DATA_DIRECTORY"), exist_ok=True)
    SQLModel.metadata.create_all(sql_engine)
    yield


app = FastAPI(lifespan=lifespan)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def update_env_middleware(request: Request, call_next):
    update_env_with_user_config()
    return await call_next(request)


app.include_router(presentation_router)
