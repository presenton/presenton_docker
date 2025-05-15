import os
import uuid
from fastapi import UploadFile

from api.models import LogMetadata
from api.routers.presentation.models import PresentationAndPath
from api.services.logging import LoggingService
from api.services.instances import temp_file_service
from api.sql_models import PresentationSqlModel
from api.services.database import get_sql_session
from api.utils import get_presentation_dir


class UploadPresentationThumbnailHandler:

    def __init__(self, presentation_id: str, thumbnail: UploadFile):
        self.presentation_id = presentation_id
        self.thumbnail = thumbnail

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

        self.presentation_dir = get_presentation_dir(self.presentation_id)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(
                {
                    "presentation_id": self.presentation_id,
                    "thumbnail": self.thumbnail,
                }
            ),
            extra=log_metadata.model_dump(),
        )

        with get_sql_session() as sql_session:
            presentation = sql_session.get(PresentationSqlModel, self.presentation_id)

            with open(os.path.join(self.presentation_dir, "thumbnail.jpg"), "wb") as f:
                f.write(await self.thumbnail.read())

            presentation.thumbnail = os.path.join(
                self.presentation_dir, "thumbnail.jpg"
            )
            sql_session.commit()
            sql_session.refresh(presentation)

        response = PresentationAndPath(
            presentation_id=self.presentation_id, path=presentation.thumbnail
        )
        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response
