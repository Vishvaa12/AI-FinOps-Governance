from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.constants import AnomalySeverity, DecisionStatus, Environment
from app.core.responses import success_response
from app.core.validation import validate_date_range
from app.database import get_db
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/history")
def get_history(
    from_date: str | None = Query(default=None, alias="from", pattern=r"^\d{4}-\d{2}-\d{2}$"),
    to_date: str | None = Query(default=None, alias="to", pattern=r"^\d{4}-\d{2}-\d{2}$"),
    team_id: int | None = Query(default=None, gt=0),
    decision_status: DecisionStatus | None = None,
    model_id: int | None = Query(default=None, gt=0),
    environment: Environment | None = None,
    anomaly_severity: AnomalySeverity | None = None,
    limit: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    validate_date_range(from_date, to_date)
    data = DashboardService().history(
        db,
        from_date,
        to_date,
        team_id,
        decision_status.value if decision_status else None,
        model_id,
        environment.value if environment else None,
        anomaly_severity.value if anomaly_severity else None,
        limit,
    )
    return success_response(data, {"limit": limit})
