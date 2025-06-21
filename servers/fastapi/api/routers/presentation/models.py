from datetime import datetime
from enum import Enum
from typing import List, Literal, Optional
from fastapi import UploadFile
from pydantic import BaseModel, Field

from api.models import OllamaModelMetadata
from ppt_config_generator.models import SlideMarkdownModel
from ppt_generator.models.pptx_models import PptxPresentationModel
from ppt_generator.models.query_and_prompt_models import (
    IconCategoryEnum,
    ImagePromptWithThemeAndAspectRatio,
)
from ppt_generator.models.slide_model import SlideModel
from api.sql_models import PresentationSqlModel, SlideSqlModel
from ollama._types import ModelDetails


class ThemeEnum(Enum):
    DARK = "dark"
    LIGHT = "light"
    ROYAL_BLUE = "royal_blue"
    CREAM = "cream"
    LIGHT_RED = "light_red"
    DARK_PINK = "dark_pink"
    FAINT_YELLOW = "faint_yellow"


class DocumentsAndImagesPath(BaseModel):
    documents: Optional[List[str]] = None
    images: Optional[List[str]] = None


class GenerateResearchReportRequest(BaseModel):
    language: Optional[str] = None
    query: str


class DecomposeDocumentsRequest(DocumentsAndImagesPath):
    pass


class GeneratePresentationRequirementsRequest(BaseModel):
    prompt: Optional[str] = None
    n_slides: int
    language: str
    documents: Optional[List[str]] = None
    research_reports: Optional[List[str]] = None
    images: Optional[List[str]] = None


class GenerateOutlinesRequest(BaseModel):
    presentation_id: str


class PresentationGenerateRequest(BaseModel):
    presentation_id: str
    theme: Optional[dict] = None
    images: Optional[List[str]] = None
    outlines: List[SlideMarkdownModel]
    title: Optional[str] = None


class GenerateImageRequest(BaseModel):
    presentation_id: str
    prompt: ImagePromptWithThemeAndAspectRatio


class SearchImageRequest(BaseModel):
    presentation_id: str
    query: Optional[str] = None
    page: int = 1
    limit: int = 10


class SearchIconRequest(BaseModel):
    presentation_id: str
    query: Optional[str] = None
    category: Optional[IconCategoryEnum] = None
    page: int = 1
    limit: int = 10


class SlideEditRequest(BaseModel):
    index: int
    prompt: str


class EditPresentationRequest(BaseModel):
    presentation_id: str
    watermark: bool = True
    changes: List[SlideEditRequest]


class EditPresentationSlideRequest(BaseModel):
    presentation_id: str
    index: int
    prompt: str


class UpdatePresentationThemeRequest(BaseModel):
    presentation_id: str
    theme: Optional[dict] = None


class ExportAsRequest(BaseModel):
    presentation_id: str
    pptx_model: PptxPresentationModel


class DecomposeDocumentsResponse(BaseModel):
    documents: dict


class PresentationAndSlides(BaseModel):
    presentation: PresentationSqlModel
    slides: List[SlideSqlModel]

    def to_response_dict(self):
        presentation = self.presentation.model_dump(mode="json")
        return {
            "presentation": presentation,
            "slides": [each.model_dump(mode="json") for each in self.slides],
        }


class PresentationUpdateRequest(BaseModel):
    presentation_id: str
    slides: List[SlideModel]


class PresentationAndUrl(BaseModel):
    presentation_id: str
    url: str


class PresentationAndUrls(BaseModel):
    presentation_id: str
    urls: List[str]


class PresentationAndPath(BaseModel):
    presentation_id: str
    path: str


class PresentationAndPaths(BaseModel):
    presentation_id: str
    paths: List[str]


class PresentationPathAndEditPath(PresentationAndPath):
    edit_path: str


class UpdatePresentationTitlesRequest(BaseModel):
    presentation_id: str
    titles: List[str]


class GeneratePresentationRequest(BaseModel):
    prompt: str
    n_slides: int = Field(default=8, ge=5, le=15)
    language: str = Field(default="English")
    theme: ThemeEnum = Field(default=ThemeEnum.LIGHT)
    documents: Optional[List[UploadFile]] = None
    export_as: Literal["pptx", "pdf"] = Field(default="pptx")


class OllamaModelStatusResponse(BaseModel):
    name: str
    size: Optional[int] = None
    downloaded: Optional[int] = None
    status: str
    done: bool


class OllamaSupportedModelsResponse(BaseModel):
    models: List[OllamaModelMetadata]
