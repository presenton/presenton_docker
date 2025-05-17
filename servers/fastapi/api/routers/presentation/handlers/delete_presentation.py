import os
import shutil
from api.models import LogMetadata
from api.services.logging import LoggingService
from api.sql_models import PresentationSqlModel
from api.services.database import get_sql_session
from api.utils import get_presentation_dir


class DeletePresentationHandler:

    def __init__(self, id):
        self.id = id

        self.presentation_dir = get_presentation_dir(self.id)

    async def delete(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message({"presentation": self.id}),
            extra=log_metadata.model_dump(),
        )

        with get_sql_session() as sql_session:
            presentation = sql_session.get(PresentationSqlModel, self.id)
            sql_session.delete(presentation)
            sql_session.commit()

        if os.path.exists(self.presentation_dir):
            shutil.rmtree(self.presentation_dir)
