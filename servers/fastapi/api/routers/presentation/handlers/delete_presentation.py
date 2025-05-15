from api.models import LogMetadata
from api.services.logging import LoggingService
from api.sql_models import PresentationSqlModel
from api.services.database import get_sql_session


class DeletePresentationHandler:

    def __init__(self, id):
        self.id = id

    async def delete(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message({"presentation": self.id}),
            extra=log_metadata.model_dump(),
        )

        with get_sql_session() as sql_session:
            presentation = sql_session.get(PresentationSqlModel, self.id)
            sql_session.delete(presentation)
            sql_session.commit()
