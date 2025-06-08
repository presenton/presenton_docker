from typing import List, Optional
from pydantic import BaseModel, Field


class SlideMarkdownModel(BaseModel):
    title: str = Field(description="Title of the slide in about 3 to 5 words")
    body: str = Field(description="Content of the slide in markdown format")


class PresentationMarkdownModel(BaseModel):
    title: str = Field(description="Title of the presentation in about 3 to 8 words")
    notes: Optional[List[str]] = Field(description="Notes for the presentation")
    slides: List[SlideMarkdownModel] = Field(description="List of slides")
