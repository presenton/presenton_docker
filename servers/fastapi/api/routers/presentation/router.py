from typing import Annotated, List, Optional
import uuid
from fastapi import APIRouter, BackgroundTasks, Body, File, Form, UploadFile

from api.models import SessionModel
from api.request_utils import RequestUtils
from api.routers.presentation.handlers.decompose_documents import (
    DecomposeDocumentsHandler,
)
from api.routers.presentation.handlers.delete_presentation import (
    DeletePresentationHandler,
)
from api.routers.presentation.handlers.delete_slide import DeleteSlideHandler
from api.routers.presentation.handlers.edit import PresentationEditHandler
from api.routers.presentation.handlers.export_as_pptx import ExportAsPptxHandler
from api.routers.presentation.handlers.generate_data import (
    PresentationGenerateDataHandler,
)
from api.routers.presentation.handlers.generate_image import GenerateImageHandler
from api.routers.presentation.handlers.generate_presentation import (
    GeneratePresentationHandler,
)
from api.routers.presentation.handlers.generate_presentation_requirements import (
    GeneratePresentationRequirementsHandler,
)
from api.routers.presentation.handlers.generate_research_report import (
    GenerateResearchReportHandler,
)
from api.routers.presentation.handlers.generate_stream import (
    PresentationGenerateStreamHandler,
)
from api.routers.presentation.handlers.generate_outlines import (
    PresentationOutlinesGenerateHandler,
)
from api.routers.presentation.handlers.get_presentation import GetPresentationHandler
from api.routers.presentation.handlers.get_presentations import GetPresentationsHandler
from api.routers.presentation.handlers.list_ollama_pulled_models import (
    ListPulledOllamaModelsHandler,
)
from api.routers.presentation.handlers.list_supported_ollama_models import (
    ListSupportedOllamaModelsHandler,
)
from api.routers.presentation.handlers.pull_ollama_model import PullOllamaModelHandler
from api.routers.presentation.handlers.search_icon import SearchIconHandler
from api.routers.presentation.handlers.search_image import SearchImageHandler
from api.routers.presentation.handlers.update_parsed_document import (
    UpdateParsedDocumentHandler,
)
from api.routers.presentation.handlers.update_presentation_theme import (
    UpdatePresentationThemeHandler,
)
from api.routers.presentation.handlers.update_slide_models import (
    UpdateSlideModelsHandler,
)
from api.routers.presentation.handlers.upload_files import UploadFilesHandler
from api.routers.presentation.handlers.upload_presentation_thumbnail import (
    UploadPresentationThumbnailHandler,
)
from api.routers.presentation.models import (
    DecomposeDocumentsRequest,
    DecomposeDocumentsResponse,
    DocumentsAndImagesPath,
    EditPresentationSlideRequest,
    ExportAsRequest,
    GenerateImageRequest,
    GeneratePresentationRequest,
    GeneratePresentationRequirementsRequest,
    GenerateResearchReportRequest,
    OllamaModelStatusResponse,
    OllamaSupportedModelsResponse,
    PresentationAndPath,
    PresentationAndPaths,
    PresentationAndSlides,
    GenerateOutlinesRequest,
    PresentationAndUrls,
    PresentationGenerateRequest,
    PresentationPathAndEditPath,
    SearchIconRequest,
    SearchImageRequest,
    UpdatePresentationThemeRequest,
    PresentationUpdateRequest,
)
from api.sql_models import PresentationSqlModel
from api.utils import handle_errors
from ppt_generator.models.slide_model import SlideModel

route_prefix = "/api/v1/ppt"
presentation_router = APIRouter(prefix=route_prefix)


@presentation_router.get(
    "/user_presentations", response_model=List[PresentationSqlModel]
)
async def get_user_presentations():
    request_utils = RequestUtils(f"{route_prefix}/user_presentations")
    logging_service, log_metadata = await request_utils.initialize_logger()
    return await handle_errors(
        GetPresentationsHandler().get, logging_service, log_metadata
    )


@presentation_router.get("/presentation", response_model=PresentationAndSlides)
async def get_presentation_from_id(presentation_id: str):
    request_utils = RequestUtils(f"{route_prefix}/presentation")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        GetPresentationHandler(presentation_id).get, logging_service, log_metadata
    )


@presentation_router.post("/files/upload", response_model=DocumentsAndImagesPath)
async def upload_files(
    documents: Annotated[Optional[List[UploadFile]], File()] = None,
    images: Annotated[Optional[List[UploadFile]], File()] = None,
):
    request_utils = RequestUtils(f"{route_prefix}/files/upload")
    logging_service, log_metadata = await request_utils.initialize_logger()
    return await handle_errors(
        UploadFilesHandler(documents, images).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/report/generate", response_model=str)
async def generate_research_report(
    data: GenerateResearchReportRequest,
):
    request_utils = RequestUtils(f"{route_prefix}/report/generate")
    logging_service, log_metadata = await request_utils.initialize_logger()
    return await handle_errors(
        GenerateResearchReportHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/files/decompose", response_model=DecomposeDocumentsResponse)
async def decompose_documents(data: DecomposeDocumentsRequest):
    request_utils = RequestUtils(f"{route_prefix}/files/decompose")
    logging_service, log_metadata = await request_utils.initialize_logger()
    return await handle_errors(
        DecomposeDocumentsHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/document/update")
async def update_document(
    path: Annotated[str, Body()],
    file: Annotated[UploadFile, File()],
):
    request_utils = RequestUtils(f"{route_prefix}/document/update")
    logging_service, log_metadata = await request_utils.initialize_logger()
    return await handle_errors(
        UpdateParsedDocumentHandler(path, file).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/create", response_model=PresentationSqlModel)
async def create_presentation(
    data: GeneratePresentationRequirementsRequest,
):
    request_utils = RequestUtils(f"{route_prefix}/create")
    presentation_id = str(uuid.uuid4())
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        GeneratePresentationRequirementsHandler(presentation_id, data).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/outlines/generate", response_model=PresentationSqlModel)
async def generate_outlines(data: GenerateOutlinesRequest):
    request_utils = RequestUtils(f"{route_prefix}/outlines/generate")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        PresentationOutlinesGenerateHandler(data).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/generate/data", response_model=SessionModel)
async def submit_presentation_generation_data(
    data: PresentationGenerateRequest,
):
    request_utils = RequestUtils(f"{route_prefix}/generate/data")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        PresentationGenerateDataHandler(data).post, logging_service, log_metadata
    )


@presentation_router.get("/generate/stream")
async def presentation_generation_stream(presentation_id: str, session: str):
    request_utils = RequestUtils(f"{route_prefix}/generate/stream")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        PresentationGenerateStreamHandler(presentation_id, session).get,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/presentation/thumbnail", response_model=PresentationAndPath)
async def update_presentation(
    presentation_id: Annotated[str, Body()],
    thumbnail: Annotated[UploadFile, File()],
):
    request_utils = RequestUtils(f"{route_prefix}/presentation/thumbnail")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        UploadPresentationThumbnailHandler(presentation_id, thumbnail).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/presentation/theme")
async def update_presentation(
    data: UpdatePresentationThemeRequest,
):
    request_utils = RequestUtils(f"{route_prefix}/presentation/theme")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        UpdatePresentationThemeHandler(data).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/edit", response_model=SlideModel)
async def update_presentation(
    data: EditPresentationSlideRequest,
):
    request_utils = RequestUtils(f"{route_prefix}/edit")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id
    )
    return await handle_errors(
        PresentationEditHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/slides/update", response_model=PresentationAndSlides)
async def update_slide_models(data: PresentationUpdateRequest):
    request_utils = RequestUtils(f"{route_prefix}/slides/update")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        UpdateSlideModelsHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/image/generate", response_model=PresentationAndPaths)
async def generate_image(data: GenerateImageRequest):
    request_utils = RequestUtils(f"{route_prefix}/image/generate")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        GenerateImageHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/image/search", response_model=PresentationAndUrls)
async def search_image(data: SearchImageRequest):
    request_utils = RequestUtils(f"{route_prefix}/image/search")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        SearchImageHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/icon/search", response_model=PresentationAndPaths)
async def search_icon(data: SearchIconRequest):
    request_utils = RequestUtils(f"{route_prefix}/icon/search")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        SearchIconHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post(
    "/presentation/export_as_pptx", response_model=PresentationAndPath
)
async def export_as_pptx(data: ExportAsRequest):
    request_utils = RequestUtils(f"{route_prefix}/presentation/export_as_pptx")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        ExportAsPptxHandler(data).post, logging_service, log_metadata
    )


@presentation_router.delete("/delete", status_code=204)
async def delete_presentation(presentation_id: str):
    request_utils = RequestUtils(f"{route_prefix}/delete")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        DeletePresentationHandler(presentation_id).delete, logging_service, log_metadata
    )


@presentation_router.delete("/slide/delete", status_code=204)
async def delete_slide(slide_id: str, presentation_id: str):
    request_utils = RequestUtils(f"{route_prefix}/slide/delete")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        DeleteSlideHandler(slide_id).delete, logging_service, log_metadata
    )


@presentation_router.post(
    "/generate/presentation", response_model=PresentationPathAndEditPath
)
async def generate_presentation(data: Annotated[GeneratePresentationRequest, Form()]):
    presentation_id = str(uuid.uuid4())

    request_utils = RequestUtils(f"{route_prefix}/generate/presentation")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
    )
    return await handle_errors(
        GeneratePresentationHandler(presentation_id, data).post,
        logging_service,
        log_metadata,
    )


# Ollama Support
@presentation_router.get(
    "/ollama/list-supported-models", response_model=OllamaSupportedModelsResponse
)
async def list_supported_ollama_models():
    request_utils = RequestUtils(f"{route_prefix}/ollama/list-supported-models")
    logging_service, log_metadata = await request_utils.initialize_logger()
    return await handle_errors(
        ListSupportedOllamaModelsHandler().get, logging_service, log_metadata
    )


@presentation_router.get(
    "/ollama/list-pulled-models", response_model=List[OllamaModelStatusResponse]
)
async def list_pulled_ollama_models():
    request_utils = RequestUtils(f"{route_prefix}/ollama/list-pulled-models")
    logging_service, log_metadata = await request_utils.initialize_logger()
    return await handle_errors(
        ListPulledOllamaModelsHandler().get, logging_service, log_metadata
    )


@presentation_router.get("/ollama/pull-model", response_model=OllamaModelStatusResponse)
async def pull_ollama_model(name: str, background_tasks: BackgroundTasks):
    request_utils = RequestUtils(f"{route_prefix}/ollama/pull-model")
    logging_service, log_metadata = await request_utils.initialize_logger()
    return await handle_errors(
        PullOllamaModelHandler(name).get,
        logging_service,
        log_metadata,
        background_tasks=background_tasks,
    )
