import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.constants import ErrorCode
from app.core.errors import APIError
from app.core.responses import success_response
from app.database import get_db
from app.domain.schemas.api import DemoLoadRequest
from app.services.demo_data_service import DemoDataService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/demo/load")
def load_demo_data(payload: DemoLoadRequest | None = None, db: Session = Depends(get_db)) -> dict[str, object]:
    request = payload or DemoLoadRequest()
    try:
        data = DemoDataService().load(db, request.scenario, request.reset_existing)
        logger.info("Loaded demo data for scenario=%s reset=%s", request.scenario, request.reset_existing)
        return success_response(data)
    except APIError:
        raise
    except Exception as exc:
        logger.exception("Failed to load demo data")
        raise APIError(
            ErrorCode.DEMO_LOAD_FAILED,
            "Demo data could not be loaded.",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from exc
