from typing import List
import uuid, aiohttp
from api.models import LogMetadata
from api.routers.presentation.handlers.export_as_pptx import ExportAsPptxHandler
from api.routers.presentation.handlers.upload_files import UploadFilesHandler
from api.routers.presentation.mixins.fetch_assets_on_generation import (
    FetchAssetsOnPresentationGenerationMixin,
)
from api.routers.presentation.models import (
    ExportAsRequest,
    GeneratePresentationRequest,
    PresentationAndPath,
)
from api.services.database import get_sql_session
from api.services.instances import temp_file_service
from api.services.logging import LoggingService
from api.sql_models import PresentationSqlModel, SlideSqlModel
from api.utils import get_presentation_dir
from document_processor.loader import DocumentsLoader
from ppt_config_generator.document_summary_generator import generate_document_summary
from ppt_config_generator.ppt_outlines_generator import generate_ppt_content
from ppt_generator.generator import generate_presentation
from ppt_generator.models.llm_models import LLMPresentationModel
from langchain_core.output_parsers import JsonOutputParser

from ppt_generator.models.slide_model import SlideModel

output_parser = JsonOutputParser(pydantic_object=LLMPresentationModel)


class GeneratePresentationHandler(FetchAssetsOnPresentationGenerationMixin):

    def __init__(self, presentation_id: str, data: GeneratePresentationRequest):
        self.session = str(uuid.uuid4())
        self.presentation_id = presentation_id
        self.data = data

        self.temp_dir = temp_file_service.create_temp_dir()
        self.presentation_dir = get_presentation_dir(self.presentation_id)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):

        documents_and_images_path = await UploadFilesHandler(
            documents=self.data.documents,
            images=None,
        ).post(logging_service, log_metadata)

        summary = None
        if documents_and_images_path.documents:
            documents_loader = DocumentsLoader(documents_and_images_path.documents)
            await documents_loader.load_documents(self.temp_dir)

            print("-" * 40)
            print("Generating Document Summary")
            summary = await generate_document_summary(documents_loader.documents)

        print("-" * 40)
        print("Generating PPT Outline")
        presentation_content = await generate_ppt_content(
            self.data.prompt,
            self.data.n_slides,
            self.data.language,
            summary,
        )

        print("-" * 40)
        print("Generating Presentation")
        presentation_text = (
            await generate_presentation(
                presentation_content.title,
                presentation_content.notes,
                presentation_content.slides,
            )
        ).content

        print("-" * 40)
        print("Parsing Presentation")
        presentation_json = output_parser.parse(presentation_text)

        slide_models: List[SlideModel] = []
        for i, content in enumerate(presentation_json["slides"]):
            content["index"] = i
            content["presentation"] = self.presentation_id
            slide_model = SlideModel(**content)
            slide_models.append(slide_model)

        print("-" * 40)
        print("Fetching Theme Colors")
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"http://localhost/api/get-theme-from-name?theme={self.data.theme.value}",
            ) as response:
                self.theme = await response.json()

        print("-" * 40)
        print("Fetching Slide Assets")
        async for result in self.fetch_slide_assets(slide_models):
            print(result)

        slide_sql_models = [
            SlideSqlModel(**each.model_dump(mode="json")) for each in slide_models
        ]

        presentation = PresentationSqlModel(
            id=self.presentation_id,
            prompt=self.data.prompt,
            n_slides=self.data.n_slides,
            language=self.data.language,
            summary=summary,
            theme=self.theme,
            title=presentation_content.title,
            outlines=[each.model_dump() for each in presentation_content.slides],
            notes=presentation_content.notes,
        )

        with get_sql_session() as sql_session:
            sql_session.add(presentation)
            sql_session.add_all(slide_sql_models)
            sql_session.commit()
            for each in slide_sql_models:
                sql_session.refresh(each)

        if self.data.export_as == "pptx":
            print("-" * 40)
            print("Fetching Slide Metadata for Export")
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"http://localhost/api/slide-metadata",
                    json={
                        "url": f"http://localhost/presentation?id={self.presentation_id}",
                        "theme": self.theme["name"],
                        "customColors": self.theme["colors"],
                    },
                ) as response:
                    export_request_body = await response.json()

            print("-" * 40)
            print("Exporting Presentation")
            export_request_body["presentation_id"] = self.presentation_id
            export_request = ExportAsRequest(**export_request_body)

            export_response = await ExportAsPptxHandler(export_request).post(
                logging_service, log_metadata
            )
            export_response.path = export_response.path.replace("app", "static")

            return export_response

        else:
            print("-" * 40)
            print("Exporting Presentation as PDF")

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"http://localhost/api/export-as-pdf",
                    json={
                        "url": f"http://localhost/pdf-maker?id={self.presentation_id}",
                        "title": presentation_content.title,
                    },
                ) as response:
                    response_json = await response.json()

            return PresentationAndPath(
                presentation_id=self.presentation_id,
                path=response_json["path"].replace("app", "static"),
            )
