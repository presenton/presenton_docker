from typing import List, Optional
from pydantic import BaseModel

from ppt_generator.models.pptx_models import PptxPresentationModel
from ppt_generator.models.query_and_prompt_models import (
    IconCategoryEnum,
    ImagePromptWithThemeAndAspectRatio,
)
from ppt_generator.models.slide_model import SlideModel
from api.sql_models import PresentationSqlModel, SlideSqlModel


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


class GenerateTitleRequest(BaseModel):
    presentation_id: str


class PresentationGenerateRequest(BaseModel):
    presentation_id: str
    theme: Optional[dict] = None
    images: Optional[List[str]] = None
    watermark: bool = True
    titles: List[str]


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


class UpdatePresentationTitlesRequest(BaseModel):
    presentation_id: str
    titles: List[str]
