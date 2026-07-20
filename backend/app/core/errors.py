from fastapi import status

from app.core.constants import ErrorCode


class APIError(Exception):
    def __init__(
        self,
        code: ErrorCode,
        message: str,
        http_status: int = status.HTTP_400_BAD_REQUEST,
        details: list[dict[str, str]] | None = None,
    ) -> None:
        self.code = code
        self.message = message
        self.http_status = http_status
        self.details = details or []
