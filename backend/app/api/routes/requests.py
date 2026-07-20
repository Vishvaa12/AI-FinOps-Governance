import logging

from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from app.core.responses import success_response
from app.database import get_db
from app.domain.schemas.api import UsageRequestCreate
from app.services.usage_request_service import UsageRequestService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/request")
def submit_request(payload: UsageRequestCreate, db: Session = Depends(get_db)) -> dict[str, object]:
    result = UsageRequestService().submit(db, payload)
    logger.info("Evaluated request id=%s decision=%s", result["usage_event"]["id"], result["decision"]["status"])
    return success_response(result)


@router.get("/request/{id}")
def get_request_detail(id: int = Path(gt=0), db: Session = Depends(get_db)) -> dict[str, object]:
    return success_response(UsageRequestService().get_detail(db, id))
