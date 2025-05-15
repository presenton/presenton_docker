from api.models import LogMetadata
from api.routers.presentation.models import UpdatePresentationThemeRequest
from api.services.logging import LoggingService
from api.sql_models import PreferencesSqlModel, PresentationSqlModel
from api.services.database import get_sql_session


class UpdatePresentationThemeHandler:

    def __init__(self, data: UpdatePresentationThemeRequest):
        self.data = data

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        with get_sql_session() as sql_session:
            presentation = sql_session.get(
                PresentationSqlModel, self.data.presentation_id
            )
            preferences = sql_session.get(PreferencesSqlModel, 0)

            if not preferences:
                preferences = PreferencesSqlModel(id=0, theme=None)
                sql_session.add(preferences)
                sql_session.commit()
                sql_session.refresh(preferences)

            if self.data.theme:
                theme_name = self.data.theme.get("name", None)
                if theme_name and theme_name.lower() == "custom":
                    preferences.theme = self.data.theme

            presentation.theme = self.data.theme
            sql_session.commit()

        return {"message": "Theme updated successfully"}
