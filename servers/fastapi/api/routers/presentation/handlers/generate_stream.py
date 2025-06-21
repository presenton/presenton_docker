import json
from typing import List

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import delete

from api.models import LogMetadata, SSECompleteResponse, SSEResponse, SSEStatusResponse

from api.routers.presentation.mixins.fetch_assets_on_generation import (
    FetchAssetsOnPresentationGenerationMixin,
)
from api.routers.presentation.models import (
    PresentationAndSlides,
    PresentationGenerateRequest,
)
from api.services.database import get_sql_session
from api.services.logging import LoggingService
from api.sql_models import KeyValueSqlModel, PresentationSqlModel, SlideSqlModel
from api.utils import get_presentation_dir, is_ollama_selected
from ppt_config_generator.models import (
    PresentationMarkdownModel,
    PresentationStructureModel,
)
from ppt_generator.generator import generate_presentation_stream
from ppt_generator.models.content_type_models import CONTENT_TYPE_MAPPING
from ppt_generator.models.llm_models import (
    LLM_CONTENT_TYPE_MAPPING,
    LLMPresentationModel,
    LLMSlideModel,
)
from ppt_generator.models.slide_model import SlideModel
from api.services.instances import TEMP_FILE_SERVICE
from langchain_core.output_parsers import JsonOutputParser

from ppt_generator.slide_generator import get_slide_content_from_type_and_outline

output_parser = JsonOutputParser(pydantic_object=LLMPresentationModel)


class PresentationGenerateStreamHandler(FetchAssetsOnPresentationGenerationMixin):

    def __init__(self, presentation_id: str, session: str):
        self.session = session
        self.presentation_id = presentation_id

        self.temp_dir = TEMP_FILE_SERVICE.create_temp_dir(self.session)
        self.presentation_dir = get_presentation_dir(self.presentation_id)

    def __del__(self):
        TEMP_FILE_SERVICE.cleanup_temp_dir(self.temp_dir)

    async def get(self, *args, **kwargs):
        with get_sql_session() as sql_session:
            key_value_model = sql_session.get(KeyValueSqlModel, self.session)

        if not key_value_model.value:
            raise HTTPException(400, "Data not found for provided session")

        self.data = PresentationGenerateRequest(**key_value_model.value)

        self.presentation_id = self.data.presentation_id
        self.theme = self.data.theme
        self.images = self.data.images
        self.title = self.data.title
        self.outlines = self.data.outlines

        return StreamingResponse(
            self.get_stream(*args, **kwargs), media_type="text/event-stream"
        )

    async def get_stream(
        self, logging_service: LoggingService, log_metadata: LogMetadata
    ):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        if not self.outlines:
            raise HTTPException(400, "Outlines can not be empty")

        with get_sql_session() as sql_session:
            presentation = sql_session.get(PresentationSqlModel, self.presentation_id)
            presentation.outlines = [each.model_dump() for each in self.outlines]
            presentation.title = self.title or presentation.title
            presentation.theme = self.theme
            sql_session.exec(
                delete(SlideSqlModel).where(
                    SlideSqlModel.presentation == self.presentation_id
                )
            )
            sql_session.commit()
            sql_session.refresh(presentation)

        self.presentation = presentation

        yield SSEResponse(
            event="response", data=json.dumps({"status": "Analyzing information 📊"})
        ).to_string()

        self.presentation_json = None

        # self.presentation_json will be mutated by the generator
        if is_ollama_selected():
            async for result in self.generate_presentation_ollama():
                yield result
        else:
            async for result in self.generate_presentation_openai_google():
                yield result

        slide_models: List[SlideModel] = []
        for i, slide in enumerate(self.presentation_json["slides"]):
            slide["index"] = i
            slide["presentation"] = self.presentation.id
            slide["content"] = (
                LLM_CONTENT_TYPE_MAPPING[slide["type"]](**slide["content"])
                .to_content()
                .model_dump(mode="json")
            )
            slide_model = SlideModel(**slide)
            slide_models.append(slide_model)

        async for result in self.fetch_slide_assets(slide_models):
            yield result

        slide_sql_models = [
            SlideSqlModel(**each.model_dump(mode="json")) for each in slide_models
        ]

        with get_sql_session() as sql_session:
            sql_session.add_all(slide_sql_models)
            sql_session.commit()
            for each in slide_sql_models:
                sql_session.refresh(each)

        yield SSEStatusResponse(status="Packing slide data").to_string()

        response = PresentationAndSlides(
            presentation=self.presentation, slides=slide_sql_models
        ).to_response_dict()

        yield SSECompleteResponse(key="presentation", value=response).to_string()

    async def generate_presentation_openai_google(self):
        presentation_text = ""
        async for chunk in generate_presentation_stream(
            PresentationMarkdownModel(
                title=self.title,
                slides=self.outlines,
                notes=self.presentation.notes,
            )
        ):
            presentation_text += chunk.content
            yield SSEResponse(
                event="response",
                data=json.dumps({"type": "chunk", "chunk": chunk.content}),
            ).to_string()

        self.presentation_json = output_parser.parse(presentation_text)

    async def generate_presentation_ollama(self):
        presentation_structure = PresentationStructureModel(
            **self.presentation.structure
        )
        slide_models = []
        yield SSEResponse(
            event="response",
            data=json.dumps({"type": "chunk", "chunk": '{ "slides": [ '}),
        ).to_string()
        n_slides = len(presentation_structure.slides)
        for i, slide_structure in enumerate(presentation_structure.slides):
            # Informing about the start of the slide
            # This is to make sure that the client renders slide n
            # when it receives start chunk of slide n + 1
            yield SSEResponse(
                event="response",
                data=json.dumps({"type": "chunk", "chunk": "{"}),
            ).to_string()

            slide_content = await get_slide_content_from_type_and_outline(
                slide_structure.type, self.outlines[i]
            )
            slide_model = LLMSlideModel(
                type=slide_structure.type,
                content=slide_content.model_dump(mode="json"),
            )
            slide_models.append(slide_model)
            chunk = json.dumps(slide_model.model_dump(mode="json"))

            if i < n_slides - 1:
                chunk += ","
            yield SSEResponse(
                event="response",
                data=json.dumps({"type": "chunk", "chunk": chunk[1:]}),
            ).to_string()
        yield SSEResponse(
            event="response",
            data=json.dumps({"type": "chunk", "chunk": " ] }"}),
        ).to_string()

        self.presentation_json = LLMPresentationModel(
            slides=slide_models,
        ).model_dump(mode="json")
