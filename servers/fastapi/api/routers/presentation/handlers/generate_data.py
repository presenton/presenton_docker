import uuid

from fastapi import HTTPException
from api.models import LogMetadata, SessionModel
from api.routers.presentation.models import PresentationGenerateRequest
from api.services.logging import LoggingService
from api.sql_models import KeyValueSqlModel
from api.services.database import get_sql_session


class PresentationGenerateDataHandler:

    def __init__(self, data: PresentationGenerateRequest):
        self.data = data
        self.session = str(uuid.uuid4())

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump()),
            extra=log_metadata.model_dump(),
        )

        if not self.data.titles:
            raise HTTPException(400, "Titles can not be empty")

        key_value_model = KeyValueSqlModel(
            id=self.session,
            key=self.session,
            value=self.data.model_dump(mode="json"),
        )

        with get_sql_session() as sql_session:
            sql_session.add(key_value_model)
            sql_session.commit()
            sql_session.refresh(key_value_model)

        response = SessionModel(session=self.session)
        logging_service.logger.info(
            logging_service.message(response),
            extra=log_metadata.model_dump(),
        )

        return response
