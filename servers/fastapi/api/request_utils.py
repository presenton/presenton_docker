from typing import Optional

from api.models import LogMetadata
from api.services.logging import LoggingService


class RequestUtils:
    def __init__(self, endpoint: str):
        self.endpoint = endpoint

    async def initialize_logger(
        self,
        presentation_id: Optional[str] = None,
    ):
        metadata = LogMetadata(presentation=presentation_id, endpoint=self.endpoint)
        logging_service = LoggingService(metadata.stream_name)

        return logging_service, metadata
