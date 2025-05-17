import asyncio
import json
from typing import List

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import delete

from api.models import LogMetadata, SSECompleteResponse, SSEResponse, SSEStatusResponse

from api.routers.presentation.models import (
    PresentationAndSlides,
    PresentationGenerateRequest,
)
from api.services.database import get_sql_session
from api.services.logging import LoggingService
from api.sql_models import KeyValueSqlModel, PresentationSqlModel, SlideSqlModel
from api.utils import get_presentation_dir, get_presentation_images_dir
from image_processor.icons_vectorstore_utils import get_icons_vectorstore
from image_processor.images_finder import generate_image
from image_processor.icons_finder import get_icon
from ppt_generator.generator import generate_presentation_stream
from ppt_generator.models.llm_models import LLMPresentationModel
from ppt_generator.models.slide_model import SlideModel
from ppt_generator.slide_model_utils import SlideModelUtils
from api.services.instances import temp_file_service
from langchain_core.output_parsers import JsonOutputParser

output_parser = JsonOutputParser(pydantic_object=LLMPresentationModel)


class PresentationGenerateStreamHandler:

    def __init__(self, presentation_id: str, session: str):
        self.session = session
        self.presentation_id = presentation_id

        self.temp_dir = temp_file_service.create_temp_dir(self.session)
        self.presentation_dir = get_presentation_dir(self.presentation_id)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def get(self, *args, **kwargs):
        with get_sql_session() as sql_session:
            key_value_model = sql_session.get(KeyValueSqlModel, self.session)

        if not key_value_model.value:
            raise HTTPException(400, "Data not found for provided session")

        self.data = PresentationGenerateRequest(**key_value_model.value)

        self.presentation_id = self.data.presentation_id
        self.theme = self.data.theme
        self.images = self.data.images
        self.titles = self.data.titles
        self.watermark = self.data.watermark

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

        if not self.titles:
            raise HTTPException(400, "Titles can not be empty")

        with get_sql_session() as sql_session:
            presentation = sql_session.get(PresentationSqlModel, self.presentation_id)
            presentation.n_slides = len(self.titles)
            presentation.titles = self.titles
            presentation.theme = self.theme
            sql_session.exec(
                delete(SlideSqlModel).where(
                    SlideSqlModel.presentation == self.presentation_id
                )
            )
            sql_session.commit()
            sql_session.refresh(presentation)

        yield SSEResponse(
            event="response", data=json.dumps({"status": "Analyzing information 📊"})
        ).to_string()

        presentation_text = ""
        async for chunk in generate_presentation_stream(
            self.titles,
            presentation.prompt or "create presentation",
            presentation.n_slides,
            presentation.language,
            presentation.summary,
        ):
            presentation_text += chunk.content
            yield SSEResponse(
                event="response",
                data=json.dumps({"type": "chunk", "chunk": chunk.content}),
            ).to_string()

        print("-" * 40)
        print(presentation_text)
        print("-" * 40)

        presentation_json = output_parser.parse(presentation_text)

        print("-" * 40)
        print(presentation_json)
        print("-" * 40)

        slide_models: List[SlideModel] = []
        for i, content in enumerate(presentation_json["slides"]):
            content["index"] = i
            content["presentation"] = presentation.id
            slide_model = SlideModel(**content)
            slide_models.append(slide_model)

        async for result in self.fetch_slide_assets(slide_models):
            yield result

        print("-" * 40)
        print(slide_models)
        print("-" * 40)

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
            presentation=presentation, slides=slide_sql_models
        ).to_response_dict()

        yield SSECompleteResponse(key="presentation", value=response).to_string()

    async def fetch_slide_assets(self, slide_models: List[SlideModel]):
        image_prompts = []
        icon_queries = []

        for each_slide_model in slide_models:
            slide_model_utils = SlideModelUtils(self.theme, each_slide_model)
            image_prompts.extend(slide_model_utils.get_image_prompts())
            icon_queries.extend(slide_model_utils.get_icon_queries())

        if icon_queries:
            icon_vector_store = get_icons_vectorstore()

        images_directory = get_presentation_images_dir(self.presentation_id)

        coroutines = [
            generate_image(
                each,
                images_directory,
            )
            for each in image_prompts
        ] + [get_icon(icon_vector_store, each) for each in icon_queries]

        assets_future = asyncio.gather(*coroutines)

        while not assets_future.done():
            status = SSEStatusResponse(status="Fetching slide assets").to_string()
            yield status
            await asyncio.sleep(5)

        assets = await assets_future

        image_prompts_len = len(image_prompts)

        images = assets[:image_prompts_len]
        icons = assets[image_prompts_len:]

        for each_slide_model in slide_models:
            each_slide_model.images = images[: each_slide_model.images_count]
            images = images[each_slide_model.images_count :]

            each_slide_model.icons = icons[: each_slide_model.icons_count]
            icons = icons[each_slide_model.icons_count :]

        yield SSEStatusResponse(status="Slide assets fetched").to_string()
