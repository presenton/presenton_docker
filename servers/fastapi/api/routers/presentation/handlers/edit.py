import asyncio
from typing import Literal
import uuid

from sqlalchemy import update
from sqlmodel import select
from api.models import LogMetadata
from api.routers.presentation.models import (
    EditPresentationSlideRequest,
)
from api.services.instances import temp_file_service
from api.services.logging import LoggingService
from api.utils import get_presentation_dir, get_presentation_images_dir
from image_processor.icons_vectorstore_utils import get_icons_vectorstore
from image_processor.images_finder import generate_image
from image_processor.icons_finder import get_icon
from ppt_generator.models.other_models import SlideType
from ppt_generator.models.query_and_prompt_models import (
    IconQueryCollectionWithData,
    ImagePromptWithThemeAndAspectRatio,
)
from ppt_generator.models.slide_model import SlideModel
from ppt_generator.slide_generator import (
    get_edited_slide_content_model,
    get_slide_type_from_prompt,
)
from ppt_generator.slide_model_utils import SlideModelUtils
from api.sql_models import PresentationSqlModel, SlideSqlModel
from api.services.database import get_sql_session


class PresentationEditHandler:
    def __init__(self, data: EditPresentationSlideRequest):
        self.data = data
        self.presentation_id = data.presentation_id

        self.slide_index = data.index
        self.prompt = data.prompt

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

        self.presentation_dir = get_presentation_dir(self.presentation_id)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        with get_sql_session() as sql_session:
            presentation = sql_session.get(PresentationSqlModel, self.presentation_id)
            slide_to_edit_sql = sql_session.exec(
                select(SlideSqlModel).where(
                    SlideSqlModel.index == self.slide_index,
                    SlideSqlModel.presentation == self.presentation_id,
                )
            ).first()

        slide_to_edit = SlideModel.from_dict(slide_to_edit_sql.model_dump(mode="json"))
        new_slide_type = SlideType(
            (await get_slide_type_from_prompt(self.prompt, slide_to_edit)).slide_type
        )

        edited_content = await get_edited_slide_content_model(
            self.prompt,
            new_slide_type,
            slide_to_edit,
            presentation.theme,
            presentation.language,
        )

        new_slide_model = SlideModel(
            id=slide_to_edit.id,
            index=slide_to_edit.index,
            type=new_slide_type,
            design_index=slide_to_edit.design_index,
            images=None,
            icons=None,
            presentation=slide_to_edit.presentation,
            properties=slide_to_edit.properties,
            content=edited_content,
        )

        new_slide_images_count = new_slide_model.images_count
        new_slide_icons_count = new_slide_model.icons_count

        slide_model_utils = SlideModelUtils(presentation.theme, new_slide_model)

        new_slide_images: dict[int, str | ImagePromptWithThemeAndAspectRatio] = {}
        new_slide_icons: dict[int, str | IconQueryCollectionWithData] = {}

        # ? Checks if image prompts have changed
        # ? If they have, it will search if it is same as the old one but used at a different index
        # ? If it is, it will use the old image
        # ? If it is not, it will generate a new image
        if new_slide_images_count:
            new_image_prompts = slide_model_utils.get_image_prompts()
            old_image_prompts = (
                slide_to_edit.content.image_prompts
                if slide_to_edit.images_count
                else []
            )
            for index in range(new_slide_images_count):
                new_prompt = new_slide_model.content.image_prompts[index]
                for old_prompt in old_image_prompts:
                    if old_prompt != new_prompt:
                        continue
                    if index < len(slide_to_edit.images or []):
                        new_slide_images[index] = slide_to_edit.images[index]
                        break
                if not new_slide_images.get(index):
                    new_slide_images[index] = new_image_prompts[index]

        # ? Checks if icon queries have changed
        # ? If they have, it will search if it is same as the old one but used at a different index
        # ? If it is, it will use the old icon
        # ? If it is not, it will generate a new icon
        if new_slide_icons_count:
            new_icon_queries = slide_model_utils.get_icon_queries()
            old_icon_queries = (
                slide_to_edit.content.icon_queries if slide_to_edit.icons_count else []
            )
            for index in range(new_slide_icons_count):
                new_query = new_slide_model.content.icon_queries[index]
                for old_query in old_icon_queries:
                    if old_query != new_query:
                        continue
                    if index < len(slide_to_edit.icons or []):
                        new_slide_icons[index] = slide_to_edit.icons[index]
                        break
                if not new_slide_icons.get(index):
                    new_slide_icons[index] = new_icon_queries[index]

        images_to_generate = []
        for each in new_slide_images.values():
            if isinstance(each, ImagePromptWithThemeAndAspectRatio):
                images_to_generate.append(each)

        icons_to_generate = []
        for each in new_slide_icons.values():
            if isinstance(each, IconQueryCollectionWithData):
                icons_to_generate.append(each)

        images_directory = get_presentation_images_dir(self.presentation_id)
        if icons_to_generate:
            icons_vectorstore = get_icons_vectorstore()

        coroutines = [
            generate_image(each_prompt, images_directory)
            for each_prompt in images_to_generate
        ] + [
            get_icon(icons_vectorstore, each_query) for each_query in icons_to_generate
        ]
        generated_assets = await asyncio.gather(*coroutines)
        generated_image_count = len(images_to_generate)
        generate_images = generated_assets[:generated_image_count]
        generate_icons = generated_assets[generated_image_count:]

        for each in new_slide_images:
            if isinstance(new_slide_images[each], ImagePromptWithThemeAndAspectRatio):
                new_slide_images[each] = generate_images.pop(0)

        for each in new_slide_icons:
            if isinstance(new_slide_icons[each], IconQueryCollectionWithData):
                new_slide_icons[each] = generate_icons.pop(0)

        with get_sql_session() as sql_session:
            sql_session.exec(
                update(SlideSqlModel)
                .where(SlideSqlModel.id == slide_to_edit.id)
                .values(
                    type=new_slide_type.value,
                    images=list(new_slide_images.values()),
                    icons=list(new_slide_icons.values()),
                    content=new_slide_model.content.model_dump(mode="json"),
                )
            )
            sql_session.commit()
            slide_to_edit_sql = sql_session.exec(
                select(SlideSqlModel).where(SlideSqlModel.id == slide_to_edit.id)
            ).first()

        logging_service.logger.info(
            logging_service.message(slide_to_edit_sql.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )
        return slide_to_edit_sql
