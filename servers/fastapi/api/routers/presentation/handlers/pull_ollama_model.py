import asyncio
import json
from fastapi import BackgroundTasks
from api.models import LogMetadata
from api.routers.presentation.models import OllamaModelStatusResponse
from api.services.instances import REDIS_SERVICE
from api.services.logging import LoggingService
import ollama


class PullOllamaModelHandler:

    def __init__(self, name: str):
        self.name = name

    async def get(
        self,
        logging_service: LoggingService,
        log_metadata: LogMetadata,
        background_tasks: BackgroundTasks,
    ):
        logging_service.logger.info(
            logging_service.message(self.name),
            extra=log_metadata.model_dump(),
        )

        pulled_models = map(lambda model: model.model, ollama.list().models)

        # If the model is already pulled, return the model
        if self.name in pulled_models:
            return OllamaModelStatusResponse(
                name=self.name,
                status="pulled",
                done=True,
            )

        saved_model_status = REDIS_SERVICE.get(f"ollama_models/{self.name}")

        # If the model is being pulled, return the model
        if saved_model_status:
            return json.loads(saved_model_status)

        # If the model is not being pulled, pull the model
        background_tasks.add_task(self.pull_model_in_background)

        return OllamaModelStatusResponse(
            name=self.name,
            status="pulling",
            done=False,
        )

    async def pull_model_in_background(self):
        await asyncio.to_thread(self.pull_model)

    def pull_model(self):
        saved_model_status = OllamaModelStatusResponse(
            name=self.name,
            status="pulling",
            done=False,
        )
        log_event_count = 0
        for event in ollama.pull(self.name, stream=True):
            log_event_count += 1
            if log_event_count != 1 and log_event_count % 20 != 0:
                continue

            if event.completed:
                saved_model_status.downloaded = event.completed

            if not saved_model_status.size and event.total:
                saved_model_status.size = event.total

            if event.status:
                saved_model_status.status = event.status

            REDIS_SERVICE.set(
                f"ollama_models/{self.name}",
                json.dumps(saved_model_status.model_dump(mode="json")),
            )

        saved_model_status.done = True
        saved_model_status.status = "pulled"
        saved_model_status.downloaded = saved_model_status.size

        REDIS_SERVICE.set(
            f"ollama_models/{self.name}",
            json.dumps(saved_model_status.model_dump(mode="json")),
        )

        return saved_model_status
