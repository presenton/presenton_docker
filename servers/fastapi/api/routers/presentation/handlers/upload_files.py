from typing import List, Optional
import uuid
from fastapi import UploadFile
from api.models import LogMetadata
from api.routers.presentation.models import DocumentsAndImagesPath
from api.services.logging import LoggingService
from api.validators import validate_files
from document_processor.loader import UPLOAD_ACCEPTED_DOCUMENTS
from api.services.instances import TEMP_FILE_SERVICE


class UploadFilesHandler:

    def __init__(
        self,
        documents: Optional[List[UploadFile]],
        images: Optional[List[UploadFile]],
    ):
        self.documents = documents
        self.images = images

        self.session = str(uuid.uuid4())
        self.temp_dir = TEMP_FILE_SERVICE.create_temp_dir(self.session)
        print("Upload Temp Dir: " + self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(
                {
                    "documents": self.documents,
                    "images": self.images,
                }
            ),
            extra=log_metadata.model_dump(),
        )

        validate_files(self.documents, True, True, 50, UPLOAD_ACCEPTED_DOCUMENTS)
        validate_files(
            self.images, True, True, 10, ["image/jpeg", "image/png", "image/webp"]
        )

        self.documents = self.documents or []
        self.images = self.images or []

        temp_documents: List[str] = []
        if self.documents or self.images:
            all_documents = self.documents + self.images
            for doc in all_documents:
                temp_path = TEMP_FILE_SERVICE.create_temp_file_path(
                    doc.filename, self.temp_dir
                )
                with open(temp_path, "wb") as f:
                    content = await doc.read()
                    f.write(content)

                temp_documents.append(temp_path)

        documents_count = len(temp_documents)
        response = DocumentsAndImagesPath(
            documents=temp_documents[:documents_count],
            images=temp_documents[documents_count:],
        )

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response
