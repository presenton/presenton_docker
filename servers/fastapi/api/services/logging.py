from typing import Any
from logging import Logger


class LoggingService:

    def __init__(self, stream_name: str):
        self._logger = Logger(stream_name)

    @property
    def logger(self) -> Logger:
        return self._logger

    def message(self, msg: Any):
        return {"msg": msg}
