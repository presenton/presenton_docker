import ollama
from api.models import LogMetadata
from api.routers.presentation.models import OllamaModelStatusResponse
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

        return [
            OllamaModelStatusResponse(
                name=model.model,
                size=model.size,
                status="pulled",
                downloaded=model.size,
                done=True,
            )
            for model in response.models
        ]
