import asyncio
from typing import List
import uuid
from api.models import LogMetadata
from api.routers.presentation.models import (
    DecomposeDocumentsRequest,
    DecomposeDocumentsResponse,
)
from api.services.instances import TEMP_FILE_SERVICE
from api.services.logging import LoggingService
from document_processor.loader import DocumentsLoader


class DecomposeDocumentsHandler:

    def __init__(self, data: DecomposeDocumentsRequest):
        self.data = data
        self.documents = list(
            filter(lambda doc: not doc.endswith(".csv"), self.data.documents or [])
        )

        self.session = str(uuid.uuid4())
        self.temp_dir = TEMP_FILE_SERVICE.create_temp_dir(self.session)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        documents_loader = DocumentsLoader(self.documents)
        await documents_loader.load_documents(self.temp_dir)
        parsed_documents = documents_loader.documents

        document_paths = []
        for parsed_doc in parsed_documents:
            file_path = TEMP_FILE_SERVICE.create_temp_file_path(
                f"{str(uuid.uuid4())}.txt", self.temp_dir
            )
            parsed_doc = parsed_doc.page_content.replace("<br>", "\n")
            with open(file_path, "w") as text_file:
                text_file.write(parsed_doc)
            document_paths.append(file_path)

        documents = {}
        for index, each in enumerate(self.documents):
            documents[each] = document_paths[index]

        response = DecomposeDocumentsResponse(
            documents=documents,
        )

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response
