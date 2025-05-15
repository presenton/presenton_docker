import uuid
from api.models import LogMetadata
from api.routers.presentation.models import PresentationAndUrls, SearchImageRequest
from api.services.logging import LoggingService


class SearchImageHandler:

    def __init__(self, data: SearchImageRequest):
        self.data = data

        self.session = str(uuid.uuid4())

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):

        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        response = PresentationAndUrls(
            presentation_id=self.data.presentation_id, urls=[]
        )

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response
