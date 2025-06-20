from datetime import datetime
from typing import List, Optional
import uuid
from sqlmodel import SQLModel, Field, Column, JSON


def get_random_uuid() -> str:
    return str(uuid.uuid4())


class PresentationSqlModel(SQLModel, table=True):
    id: str = Field(default_factory=get_random_uuid, primary_key=True)
    created_at: datetime = Field(default=datetime.now())
    prompt: Optional[str] = None
    n_slides: int
    theme: Optional[dict] = Field(sa_column=Column(JSON, nullable=True), default=None)
    file: Optional[str] = None
    title: Optional[str] = None
    structure: Optional[dict] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )
    notes: Optional[List[str]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )
    outlines: Optional[List[dict]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )
    language: Optional[str] = None
    summary: Optional[str] = None
    thumbnail: Optional[str] = None
    data: Optional[dict] = Field(sa_column=Column(JSON, nullable=True), default=None)


class SlideSqlModel(SQLModel, table=True):
    id: str = Field(default_factory=get_random_uuid, primary_key=True)
    index: int = Field(index=True)
    type: int
    design_index: Optional[int] = None
    images: Optional[List[str]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )
    icons: Optional[List[str]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )
    presentation: str
    content: dict = Field(sa_column=Column(JSON, nullable=False), default=None)
    properties: Optional[dict] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )


class KeyValueSqlModel(SQLModel, table=True):
    id: str = Field(default_factory=get_random_uuid, primary_key=True)
    key: str = Field(index=True)
    value: dict = Field(sa_column=Column(JSON, nullable=True), default=None)


class PreferencesSqlModel(SQLModel, table=True):
    id: int = Field(default=0, primary_key=True)
    theme: Optional[dict] = Field(sa_column=Column(JSON, nullable=True), default=None)
