from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import ErrorCode, ModelCatalogStatus
from app.core.errors import APIError
from app.core.responses import success_response
from app.database import get_db
from app.services.model_service import ModelService
from app.services.serialization import model_summary

router = APIRouter()


@router.get("/models")
def get_models(
    status: ModelCatalogStatus | None = None,
    provider: str | None = None,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    if provider is not None:
        provider = provider.strip()
        if not provider:
            raise APIError(
                ErrorCode.VALIDATION_ERROR,
                "Provider must not be blank.",
                details=[{"field": "provider", "message": "Provider must not be blank."}],
            )
    models = ModelService().list_models(db, status.value if status else None, provider)
    return success_response({"items": [model_summary(model) for model in models]})
