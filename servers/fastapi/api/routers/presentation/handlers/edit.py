import asyncio
import os
from typing import List, Tuple
import uuid

from sqlmodel import select
from api.models import LogMetadata
from api.routers.presentation.models import (
    EditPresentationSlideRequest,
)
from api.services.instances import temp_file_service
from api.services.logging import LoggingService
from api.utils import get_presentation_dir
from image_processor.images_finder import generate_image
from image_processor.icons_finder import get_icon
from ppt_generator.models.slide_model import SlideModel
from ppt_generator.slide_generator import (
    get_edited_slide_content_model,
    get_slide_type_from_prompt,
)
from ppt_generator.slide_model_utils import SlideModelUtils
from api.sql_models import PresentationSqlModel, SlideSqlModel
from api.services.database import get_sql_session
from ppt_generator.models.other_models import SlideType


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
                select(SlideSqlModel).where(SlideSqlModel.index == self.slide_index)
            ).first()

            slide_to_edit = SlideModel.from_dict(slide_to_edit_sql.model_dump(mode="json"))

            new_slide_type = await get_slide_type_from_prompt(
                self.prompt, slide_to_edit
            )


            edited_content = await get_edited_slide_content_model(
                self.prompt,
                SlideType(new_slide_type.slide_type),
                slide_to_edit,
                presentation.theme,
                presentation.language,
            )

            new_slide_model = SlideModel(
                id=slide_to_edit.id,
                index=slide_to_edit.index,
                type=SlideType(new_slide_type.slide_type),
                design_index=slide_to_edit.design_index,
                images=None,
                icons=None,
                presentation=slide_to_edit.presentation,
                content=edited_content,
            )

            # Images to delete - is list of cloud paths
            # Images to generate - is list of index of images to generate
            images_to_delete, images_to_generate, icons_to_delete, icons_to_generate = (
                self.get_all_assets_to_generate_and_delete(
                    slide_to_edit,
                    new_slide_model,
                )
            )
            new_image_paths = slide_to_edit.images or []
            new_icon_paths = slide_to_edit.icons or []
            images_count = len(new_image_paths)
            icons_count = len(new_icon_paths)
            for index in images_to_generate:
                file_key = f"{self.presentation_dir}/images/{str(uuid.uuid4())}.jpg"
                if index < images_count:
                    new_image_paths.pop(index)
                    new_image_paths.insert(index, file_key)
                else:
                    new_image_paths.append(file_key)
            for index in icons_to_generate:
                file_key = f"{self.presentation_dir}/icons/{str(uuid.uuid4())}.png"
                if index < icons_count:
                    new_icon_paths.pop(index)
                    new_icon_paths.insert(index, file_key)
                else:
                    new_icon_paths.append(file_key)

            if new_image_paths:
                new_slide_model.images = new_image_paths
            if new_icon_paths:
                new_slide_model.icons = new_icon_paths

            # Generate and Delete Images and Icons
            objects_to_delete = [*images_to_delete, *icons_to_delete]
            if objects_to_delete:
                for each in objects_to_delete:
                    os.remove(each)

            new_image_prompts = {}
            new_icon_queries = {}
            if images_to_generate:
                slide_model_utils = SlideModelUtils(presentation.theme, new_slide_model)
                image_prompts = slide_model_utils.get_image_prompts()
                for image_index in images_to_generate:
                    new_image_prompts[new_slide_model.images[image_index]] = (
                        image_prompts[image_index]
                    )

            if icons_to_generate:
                slide_model_utils = SlideModelUtils(presentation.theme, new_slide_model)
                icon_queries = slide_model_utils.get_icon_queries()
                for icon_index in icons_to_generate:
                    new_icon_queries[new_slide_model.icons[icon_index]] = icon_queries[
                        icon_index
                    ]

            coroutines = [
                generate_image(value, key) for key, value in new_image_prompts.items()
            ] + [get_icon(value, key) for key, value in new_icon_queries.items()]

            await asyncio.gather(*coroutines)

            slide_to_edit.images = new_slide_model.images
            slide_to_edit.icons = new_slide_model.icons
            slide_to_edit.content = new_slide_model.content
            slide_to_edit.type = SlideType(new_slide_type.slide_type)
            
            slide_to_edit_sql.index = slide_to_edit.index
            slide_to_edit_sql.type = slide_to_edit.type.value
            slide_to_edit_sql.design_index = slide_to_edit.design_index
            slide_to_edit_sql.images = slide_to_edit.images
            slide_to_edit_sql.icons = slide_to_edit.icons
            slide_to_edit_sql.content = slide_to_edit.content.model_dump(mode="json")
            slide_to_edit_sql.properties = slide_to_edit.properties
            slide_to_edit_sql.presentation = slide_to_edit.presentation
            sql_session.commit()
            sql_session.refresh(slide_to_edit_sql)

        logging_service.logger.info(
            logging_service.message(slide_to_edit.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )
        return slide_to_edit

    def get_all_assets_to_generate_and_delete(
        self,
        old_slide_model: SlideModel,
        new_slide_model: SlideModel,
    ) -> Tuple[List[str], List[str], List[str], List[str]]:

        images_to_delete, images_to_generate = self.get_assets_to_generate_and_delete(
            old_slide_model,
            new_slide_model,
            "image_prompts",
            "images",
        )

        icons_to_delete, icons_to_generate = self.get_assets_to_generate_and_delete(
            old_slide_model,
            new_slide_model,
            "icon_queries",
            "icons",
        )

        return images_to_delete, images_to_generate, icons_to_delete, icons_to_generate

    def get_assets_to_generate_and_delete(
        self,
        old_slide_model: SlideModel,
        new_slide_model: SlideModel,
        content_attr: str,
        slide_model_attr: str,
    ) -> Tuple[List[str], List[str]]:

        items_to_delete = []
        items_to_generate = []

        existing_paths = getattr(old_slide_model, slide_model_attr, [])
        new_content_items = getattr(new_slide_model.content, content_attr, [])
        old_content_items = getattr(old_slide_model.content, content_attr, [])

        # Case 1: No new items but slide has existing items - delete all
        if not new_content_items and existing_paths:
            items_to_delete.extend(existing_paths)
            return items_to_delete, items_to_generate

        # Case 2: New items but slide has no existing items - generate all
        if new_content_items and not existing_paths:
            items_to_generate = [idx for idx in range(len(new_content_items))]
            return items_to_delete, items_to_generate

        # Case 3: Both new and existing items - compare and update
        if new_content_items and existing_paths:
            new_count = len(new_content_items)
            old_count = len(existing_paths)

            generate_idx = []
            for idx in range(max(new_count, old_count)):
                # Generate additional new items
                if idx >= old_count:
                    generate_idx.append(idx)
                # Delete excess old items
                elif idx >= new_count:
                    items_to_delete.append(existing_paths[idx])
                # Compare and update changed items
                else:
                    old_value = old_content_items[idx]
                    new_value = new_content_items[idx]
                    if old_value != new_value:
                        items_to_delete.append(existing_paths[idx])
                        generate_idx.append(idx)

            if generate_idx:
                items_to_generate = generate_idx

        filtered_items_to_delete = []
        for each in items_to_delete:
            if not each:
                continue
            filtered_items_to_delete.append(each)

        return filtered_items_to_delete, items_to_generate
