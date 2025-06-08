import uuid
import re

from api.models import LogMetadata
from api.routers.presentation.models import GenerateOutlinesRequest
from api.services.instances import temp_file_service
from api.services.logging import LoggingService
from api.sql_models import PresentationSqlModel
from ppt_config_generator.ppt_outlines_generator import generate_ppt_content
from api.services.database import get_sql_session


class PresentationOutlinesGenerateHandler:
    def __init__(self, data: GenerateOutlinesRequest):
        self.data = data

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):

        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        with get_sql_session() as sql_session:
            presentation = sql_session.get(
                PresentationSqlModel, self.data.presentation_id
            )

            presentation_content = await generate_ppt_content(
                presentation.prompt,
                presentation.n_slides,
                presentation.language,
                presentation.summary,
            )

            presentation.title = presentation_content.title
            presentation.outlines = [
                each.model_dump() for each in presentation_content.slides
            ]
            presentation.notes = presentation_content.notes

            sql_session.commit()
            sql_session.refresh(presentation)

        logging_service.logger.info(
            logging_service.message(presentation.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return presentation
