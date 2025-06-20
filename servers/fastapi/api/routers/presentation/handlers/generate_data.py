import os
import uuid

from fastapi import HTTPException
from api.models import LogMetadata, SessionModel
from api.routers.presentation.models import PresentationGenerateRequest
from api.services.logging import LoggingService
from api.sql_models import KeyValueSqlModel, PresentationSqlModel
from api.services.database import get_sql_session
from api.utils import is_ollama_selected
from ppt_config_generator.models import PresentationMarkdownModel
from ppt_config_generator.structure_generator import generate_presentation_structure


class PresentationGenerateDataHandler:

    def __init__(self, data: PresentationGenerateRequest):
        self.data = data
        self.session = str(uuid.uuid4())

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump()),
            extra=log_metadata.model_dump(),
        )

        if not self.data.outlines:
            raise HTTPException(400, "Outlines can not be empty")

        key_value_model = KeyValueSqlModel(
            id=self.session,
            key=self.session,
            value=self.data.model_dump(mode="json"),
        )

        if is_ollama_selected():
            with get_sql_session() as sql_session:
                presentation = sql_session.get(
                    PresentationSqlModel, self.data.presentation_id
                )
                presentation_structure = await generate_presentation_structure(
                    PresentationMarkdownModel(
                        **{
                            "title": presentation.title,
                            "slides": presentation.outlines,
                            "notes": presentation.notes,
                        }
                    )
                )
                presentation.structure = presentation_structure.model_dump(mode="json")
                sql_session.commit()
                sql_session.refresh(presentation)

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
