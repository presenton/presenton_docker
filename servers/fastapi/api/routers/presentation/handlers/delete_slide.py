from api.models import LogMetadata
from api.services.logging import LoggingService
from api.services.database import get_sql_session
from api.sql_models import SlideSqlModel


class DeleteSlideHandler:

    def __init__(self, id):
        self.id = id

    async def delete(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message({"slide": self.id}),
            extra=log_metadata.model_dump(),
        )

        with get_sql_session() as sql_session:
            slide = sql_session.get(SlideSqlModel, self.id)
            sql_session.delete(slide)
            sql_session.commit()
