from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.responses import success_response
from app.core.validation import validate_date_range
from app.database import get_db
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/dashboard")
def get_dashboard(
    from_date: str | None = Query(default=None, alias="from", pattern=r"^\d{4}-\d{2}-\d{2}$"),
    to_date: str | None = Query(default=None, alias="to", pattern=r"^\d{4}-\d{2}-\d{2}$"),
    team_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    validate_date_range(from_date, to_date)
    data = DashboardService().dashboard(db, from_date, to_date, team_id)
    return success_response(data, {"date_range": {"from": from_date, "to": to_date}})
