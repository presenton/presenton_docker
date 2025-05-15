import uuid
from api.models import LogMetadata
from api.routers.presentation.models import (
    PresentationAndPaths,
    SearchIconRequest,
)
from api.services.logging import LoggingService
from image_processor.icons_finder import get_icons
from api.services.instances import temp_file_service
from image_processor.icons_vectorstore_utils import get_icons_vectorstore


class SearchIconHandler:

    def __init__(self, data: SearchIconRequest):
        self.data = data

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):

        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        vector_store = get_icons_vectorstore()

        icon_paths = await get_icons(
            vector_store,
            self.data.query or "",
            self.data.page,
            self.data.limit,
            self.data.category,
            self.temp_dir,
        )

        response = PresentationAndPaths(
            presentation_id=self.data.presentation_id, paths=icon_paths
        )

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response
