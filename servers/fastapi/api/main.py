import os
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import ollama
from sqlmodel import SQLModel
from contextlib import asynccontextmanager

from api.routers.presentation.handlers.list_supported_ollama_models import (
    SUPPORTED_OLLAMA_MODELS,
)
from api.routers.presentation.router import presentation_router
from api.services.database import sql_engine
from api.utils import is_ollama_selected, update_env_with_user_config

can_change_keys = os.getenv("CAN_CHANGE_KEYS") != "false"

# Ollama model download
if not can_change_keys and is_ollama_selected():
    ollama_model = os.getenv("OLLAMA_MODEL")
    pexels_api_key = os.getenv("PEXELS_API_KEY")
    if not (ollama_model or pexels_api_key):
        raise Exception("OLLAMA_MODEL and PEXELS_API_KEY must be provided")

    if ollama_model not in SUPPORTED_OLLAMA_MODELS:
        raise Exception(f"Model {ollama_model} is not supported")

    print("-" * 50)
    print("Pulling model: ", ollama_model)
    for event in ollama.pull(ollama_model, stream=True):
        print(event)
    print("Pulled model: ", ollama_model)
    print("-" * 50)


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
    if can_change_keys:
        update_env_with_user_config()
    return await call_next(request)


app.include_router(presentation_router)
