import uuid
from api.models import LogMetadata
from api.routers.presentation.models import GenerateResearchReportRequest
from api.services.logging import LoggingService
from api.services.instances import temp_file_service
from research_report.generator import get_report


class GenerateResearchReportHandler:
    def __init__(self, data: GenerateResearchReportRequest):
        self.data = data

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        report = await get_report(self.data.query, self.data.language)

        file_name = f"{report[:30]}.txt"
        file_path = temp_file_service.create_temp_file_path(file_name, self.temp_dir)
        with open(file_path, "w") as text_file:
            text_file.write(report)

        logging_service.logger.info(
            logging_service.message(file_path), extra=log_metadata.model_dump()
        )
        return file_path
