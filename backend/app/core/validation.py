from datetime import date

from fastapi import status

from app.core.constants import ErrorCode
from app.core.errors import APIError


def validate_date_range(from_date: str | None, to_date: str | None) -> None:
    start = _parse_date(from_date)
    end = _parse_date(to_date)
    if start and end and start > end:
        raise APIError(
            ErrorCode.VALIDATION_ERROR,
            "Start date must be before or equal to end date.",
            status.HTTP_400_BAD_REQUEST,
            [{"field": "from", "message": "Start date must be before or equal to end date."}],
        )


def _parse_date(value: str | None) -> date | None:
    if value is None:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise APIError(
            ErrorCode.VALIDATION_ERROR,
            "Date filters must be valid calendar dates.",
            status.HTTP_400_BAD_REQUEST,
            [{"field": "date_range", "message": "Use valid YYYY-MM-DD dates."}],
        ) from exc
