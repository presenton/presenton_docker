from api.models import LogMetadata, OllamaModelMetadata
from api.routers.presentation.models import OllamaSupportedModelsResponse
from api.services.logging import LoggingService


SUPPORTED_OLLAMA_MODELS = {
    "llama3.1:8b": OllamaModelMetadata(
        label="Llama 3.1:8b",
        value="llama3.1:8b",
        description="❌ Graphs not supported.",
        size="4.9GB",
        supports_graph=False,
    ),
    "llama3.1:70b": OllamaModelMetadata(
        label="Llama 3.1:70b",
        value="llama3.1:70b",
        description="✅ Graphs supported.",
        size="43GB",
        supports_graph=True,
    ),
    "llama3.1:405b": OllamaModelMetadata(
        label="Llama 3.1:405b",
        value="llama3.1:405b",
        description="✅ Graphs supported.",
        size="243GB",
        supports_graph=True,
    ),
}


class ListSupportedOllamaModelsHandler:
    async def get(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message("Listing supported Ollama models"),
            extra=log_metadata.model_dump(),
        )

        return OllamaSupportedModelsResponse(
            models=SUPPORTED_OLLAMA_MODELS.values(),
        )
