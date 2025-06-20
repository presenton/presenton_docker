from api.models import LogMetadata
from api.routers.presentation.models import OllamaSupportedModelsResponse
from api.services.logging import LoggingService


SUPPORTED_OLLAMA_MODELS = [
    "llama3.1:8b",
]


class ListSupportedOllamaModelsHandler:
    async def get(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message("Listing supported Ollama models"),
            extra=log_metadata.model_dump(),
        )

        return OllamaSupportedModelsResponse(
            models=SUPPORTED_OLLAMA_MODELS,
        )
