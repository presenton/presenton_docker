import ollama
from api.models import LogMetadata
from api.services.logging import LoggingService


class ListPulledOllamaModelsHandler:

    async def get(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message("Listing Ollama models"),
            extra=log_metadata.model_dump(),
        )

        response = ollama.list()

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response.models
