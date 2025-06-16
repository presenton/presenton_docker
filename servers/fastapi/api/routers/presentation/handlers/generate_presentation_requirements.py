import uuid
from api.models import LogMetadata
from api.routers.presentation.models import GeneratePresentationRequirementsRequest
from api.services.logging import LoggingService
from api.services.database import get_sql_session
from api.services.instances import TEMP_FILE_SERVICE
from api.sql_models import PresentationSqlModel
from document_processor.loader import DocumentsLoader
from ppt_config_generator.document_summary_generator import generate_document_summary


class GeneratePresentationRequirementsHandler:
    def __init__(
        self,
        presentation_id: str,
        data: GeneratePresentationRequirementsRequest,
    ):
        self.data = data
        self.presentation_id = presentation_id
        self.prompt = data.prompt
        self.n_slides = data.n_slides
        self.documents = data.documents or []
        self.language = data.language

        self.session = str(uuid.uuid4())
        self.temp_dir = TEMP_FILE_SERVICE.create_temp_dir(self.session)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        all_document_paths = [*self.documents]

        documents_loader = DocumentsLoader(all_document_paths)
        await documents_loader.load_documents(self.temp_dir)

        summary = await generate_document_summary(documents_loader.documents)

        presentation = PresentationSqlModel(
            id=self.presentation_id,
            prompt=self.prompt,
            n_slides=self.n_slides,
            language=self.language,
            summary=summary,
        )

        with get_sql_session() as sql_session:
            sql_session.add(presentation)
            sql_session.commit()
            sql_session.refresh(presentation)

        logging_service.logger.info(
            logging_service.message(presentation.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return presentation
