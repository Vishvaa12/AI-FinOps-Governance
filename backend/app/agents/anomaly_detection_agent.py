from sqlalchemy.orm import Session

from app.services.anomaly_service import AnomalyService


class AnomalyDetectionAgent:
    def __init__(self, anomaly_service: AnomalyService) -> None:
        self.anomaly_service = anomaly_service

    def run(
        self,
        db: Session,
        team_id: int,
        total_tokens: int,
        estimated_cost: float,
        model_status: str,
        environment: str,
    ) -> dict[str, object]:
        result = self.anomaly_service.detect(db, team_id, total_tokens, estimated_cost, model_status, environment)
        result["summary"] = result["anomaly_reason"] or "No abnormal usage detected."
        return result
