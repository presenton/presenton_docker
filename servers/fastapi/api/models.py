from typing import Optional
from pydantic import BaseModel

from api.sql_models import PresentationSqlModel


class LogMetadata(BaseModel):
    presentation: Optional[str] = None
    title: Optional[str] = None
    endpoint: Optional[str] = None
    status_code: Optional[int] = None

    @classmethod
    def from_presentation(
        cls, presentation: PresentationSqlModel, endpoint: Optional[str] = None
    ):
        return cls(
            presentation=presentation.id,
            title=presentation.title,
            endpoint=endpoint,
        )

    @property
    def stream_name(self):
        return f"Endpoint - {self.endpoint}, Presentation - {self.presentation}"


class SessionModel(BaseModel):
    session: str


class SSEResponse(BaseModel):
    event: str
    data: str

    def to_string(self):
        return f"event: {self.event}\ndata: {self.data}\n\n"


class UserConfig(BaseModel):
    LLM: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
