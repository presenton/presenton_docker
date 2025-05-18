from sqlmodel import select, exists
from api.models import LogMetadata
from api.services.logging import LoggingService
from api.sql_models import PresentationSqlModel, SlideSqlModel
from api.services.database import get_sql_session


class GetPresentationsHandler:

    async def get(self, logging_service: LoggingService, log_metadata: LogMetadata):

        with get_sql_session() as sql_session:
            # Get presentations that have at least one slide
            presentations = sql_session.exec(
                select(PresentationSqlModel).where(
                    exists().where(
                        SlideSqlModel.presentation == PresentationSqlModel.id
                    )
                )
            ).all()

        presentations.sort(key=lambda x: x.created_at, reverse=True)

        logging_service.logger.info(
            logging_service.message(
                [each.model_dump(mode="json") for each in presentations]
            ),
            extra=log_metadata.model_dump(),
        )
        return presentations
