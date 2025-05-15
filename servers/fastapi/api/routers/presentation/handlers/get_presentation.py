import asyncio

from sqlmodel import select
from api.models import LogMetadata
from api.routers.presentation.models import PresentationAndSlides
from api.services.logging import LoggingService
from api.sql_models import PresentationSqlModel, SlideSqlModel
from api.services.database import get_sql_session


class GetPresentationHandler:

    def __init__(self, id: str):
        self.id = id

    async def get(self, logging_service: LoggingService, log_metadata: LogMetadata):

        logging_service.logger.info(
            logging_service.message({"presentation": self.id}),
            extra=log_metadata.model_dump(),
        )

        with get_sql_session() as sql_session:
            presentation = sql_session.get(PresentationSqlModel, self.id)
            slide_models = sql_session.exec(
                select(SlideSqlModel).where(SlideSqlModel.presentation == self.id)
            ).all()

        response = PresentationAndSlides(
            presentation=presentation, slides=slide_models
        ).to_response_dict()

        logging_service.logger.info(
            logging_service.message(response),
            extra=log_metadata.model_dump(),
        )
        return response
