from fastapi import UploadFile

from api.models import LogMetadata
from api.services.logging import LoggingService


class UpdateParsedDocumentHandler:

    def __init__(self, file_path: str, file: UploadFile):
        self.file_path = file_path
        self.file = file

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message({"path": self.file_path, "file": self.file}),
            extra=log_metadata.model_dump(),
        )

        with open(self.file_path, "wb") as f:
            f.write(await self.file.read())

        return {"message": "File saved successfully"}
