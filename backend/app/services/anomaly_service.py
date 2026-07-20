from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.constants import AnomalySeverity
from app.domain.entities.models import UsageEvent


class AnomalyService:
    def detect(
        self,
        db: Session,
        team_id: int,
        total_tokens: int,
        estimated_cost: float,
        model_status: str,
        environment: str,
    ) -> dict[str, str | None]:
        baseline = self._baseline(db, team_id)
        if total_tokens >= 75000 or estimated_cost >= 25:
            return {
                "anomaly_severity": AnomalySeverity.HIGH.value,
                "anomaly_reason": "Request is significantly above normal token or cost levels.",
            }
        if baseline["avg_tokens"] and total_tokens > baseline["avg_tokens"] * 3:
            return {
                "anomaly_severity": AnomalySeverity.MEDIUM.value,
                "anomaly_reason": "Token usage is more than 3x the team baseline.",
            }
        if baseline["avg_cost"] and estimated_cost > baseline["avg_cost"] * 3:
            return {
                "anomaly_severity": AnomalySeverity.MEDIUM.value,
                "anomaly_reason": "Estimated cost is more than 3x the team baseline.",
            }
        if model_status in {"restricted", "blocked"} and environment != "production":
            return {
                "anomaly_severity": AnomalySeverity.LOW.value,
                "anomaly_reason": "Restricted or blocked model usage was requested outside production.",
            }
        return {"anomaly_severity": AnomalySeverity.NONE.value, "anomaly_reason": None}

    def _baseline(self, db: Session, team_id: int) -> dict[str, float]:
        row = db.execute(
            select(
                func.coalesce(func.avg(UsageEvent.total_tokens), 0),
                func.coalesce(func.avg(UsageEvent.estimated_cost), 0),
            ).where(UsageEvent.team_id == team_id)
        ).one()
        return {"avg_tokens": float(row[0] or 0), "avg_cost": float(row[1] or 0)}
