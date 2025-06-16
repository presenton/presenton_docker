import os
from typing import List
from urllib.parse import unquote, urlparse
import uuid

from sqlmodel import delete
from api.models import LogMetadata
from api.routers.presentation.models import (
    PresentationUpdateRequest,
    PresentationAndSlides,
)
from api.services.logging import LoggingService
from api.sql_models import PresentationSqlModel, SlideSqlModel
from api.utils import download_files, get_presentation_dir, replace_file_name
from api.services.database import get_sql_session
from api.services.instances import TEMP_FILE_SERVICE


class UpdateSlideModelsHandler:

    def __init__(self, data: PresentationUpdateRequest):
        self.data = data
        self.presentation_id = data.presentation_id
        self.session = str(uuid.uuid4())
        self.temp_dir = TEMP_FILE_SERVICE.create_temp_dir()

        self.presentation_dir = get_presentation_dir(self.presentation_id)

    def __del__(self):
        TEMP_FILE_SERVICE.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        presentation_id = self.data.presentation_id
        new_slides = self.data.slides

        # Handle images
        images_local_paths = []
        images_download_links = []
        for new_slide in new_slides:
            new_images = new_slide.images or []
            for i, image in enumerate(new_images):
                if image.startswith("http"):
                    parsed_url = unquote(urlparse(image).path)
                    image_name = replace_file_name(
                        os.path.basename(parsed_url), str(uuid.uuid4())
                    )
                    image_path = f"{self.presentation_dir}/images/{image_name}"
                    images_local_paths.append(image_path)
                    images_download_links.append(image)
                    new_slide.images[i] = image_path

        if images_download_links:
            await download_files(images_download_links, images_local_paths)

        with get_sql_session() as sql_session:
            slide_sql_models = [
                SlideSqlModel(**each.model_dump(mode="json")) for each in new_slides
            ]
            to_update_slides_ids = [each.id for each in slide_sql_models]
            sql_session.exec(
                delete(SlideSqlModel).where(SlideSqlModel.id.in_(to_update_slides_ids))
            )
            sql_session.add_all(slide_sql_models)
            sql_session.commit()
            for each in slide_sql_models:
                sql_session.refresh(each)
            presentation = sql_session.get(PresentationSqlModel, presentation_id)

        response = PresentationAndSlides(
            presentation=presentation, slides=slide_sql_models
        )
        response = response.to_response_dict()

        logging_service.logger.info(
            logging_service.message(response),
            extra=log_metadata.model_dump(),
        )
        return response
