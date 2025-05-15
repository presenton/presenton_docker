import asyncio
import json
import os
from typing import List
import uuid

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import delete, select

from api.models import LogMetadata, SSEResponse

from api.routers.presentation.models import (
    PresentationAndSlides,
    PresentationGenerateRequest,
)
from api.services.database import get_sql_session
from api.services.logging import LoggingService
from api.sql_models import KeyValueSqlModel, PresentationSqlModel, SlideSqlModel
from api.utils import get_presentation_dir
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
            slide_content = slide_model.content
            has_images = hasattr(slide_content, "image_prompts")
            has_icons = hasattr(slide_content, "icon_queries")

            if has_images:
                slide_model.images = [
                    os.path.join(
                        self.presentation_dir,
                        "images",
                        f"{str(uuid.uuid4())}.jpg",
                    )
                    for _ in range(len(slide_content.image_prompts))
                ]

            if has_icons:
                slide_model.icons = [
                    os.path.join(
                        self.presentation_dir,
                        "icons",
                        f"{str(uuid.uuid4())}.png",
                    )
                    for _ in range(len(slide_content.icon_queries))
                ]

            slide_models.append(slide_model)

        yield SSEResponse(
            event="response",
            data=json.dumps({"type": "status", "status": "Fetching slide assets"}),
        ).to_string()

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

        yield SSEResponse(
            event="response",
            data=json.dumps({"type": "status", "status": "Packing slide data"}),
        ).to_string()

        response = PresentationAndSlides(
            presentation=presentation, slides=slide_sql_models
        ).to_response_dict()

        yield SSEResponse(
            event="response",
            data=json.dumps({"type": "complete", "presentation": response}),
        ).to_string()
        yield SSEResponse(
            event="response",
            data=json.dumps({"type": "closing", "content": "First Warning"}),
        ).to_string()
        await asyncio.sleep(3)
        yield SSEResponse(
            event="response",
            data=json.dumps({"type": "closing", "content": "Final Warning"}),
        ).to_string()

    async def fetch_slide_assets(self, slide_models: List[SlideModel]):
        image_prompts = []
        icon_queries = []

        image_paths = []
        icon_paths = []

        for each_slide_model in slide_models:
            slide_model_utils = SlideModelUtils(self.theme, each_slide_model)

            if each_slide_model.images:
                prompts = slide_model_utils.get_image_prompts()
                image_prompts.extend(prompts)
                image_paths.extend(each_slide_model.images)
            if each_slide_model.icons:
                icon_queries.extend(slide_model_utils.get_icon_queries())
                icon_paths.extend(each_slide_model.icons)

        if icon_paths:
            icon_vector_store = get_icons_vectorstore()

        coroutines = [
            generate_image(
                each,
                image_path,
            )
            for each, image_path in zip(image_prompts, image_paths)
        ] + [
            get_icon(icon_vector_store, each, icon_path)
            for each, icon_path in zip(icon_queries, icon_paths)
        ]

        assets_future = asyncio.gather(*coroutines)

        while not assets_future.done():
            status = SSEResponse(
                event="response",
                data=json.dumps({"status": "Fetching slide assets..."}),
            ).to_string()
            yield status
            await asyncio.sleep(5)

        await assets_future

        yield SSEResponse(
            event="response", data=json.dumps({"status": "Slide assets fetched"})
        ).to_string()
