from sqlalchemy.orm import Session

from app.domain.entities.models import Model
from app.domain.schemas.api import UsageRequestCreate
from app.services.cost_calculation_service import CostCalculationService
from app.services.model_service import ModelService


class ModelRouterAgent:
    def __init__(self, model_service: ModelService, cost_service: CostCalculationService) -> None:
        self.model_service = model_service
        self.cost_service = cost_service

    def run(self, db: Session, request: UsageRequestCreate, requested_model: Model) -> dict[str, object]:
        result = self.model_service.route_model(
            db,
            requested_model,
            request.risk_tier.value,
            request.data_classification.value,
            request.requested_action,
        )
        recommended_model = result["recommended_model"]
        estimated_savings = self.cost_service.estimate_savings(
            requested_model,
            recommended_model if isinstance(recommended_model, Model) else None,
            request.input_tokens,
            request.output_tokens,
        )
        result["estimated_savings"] = estimated_savings
        result["summary"] = str(result["routing_reason"])
        return result
