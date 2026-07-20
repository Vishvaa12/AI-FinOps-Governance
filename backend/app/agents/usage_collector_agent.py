from app.domain.entities.models import Model
from app.domain.schemas.api import UsageRequestCreate
from app.services.cost_calculation_service import CostCalculationService


class UsageCollectorAgent:
    def __init__(self, cost_service: CostCalculationService) -> None:
        self.cost_service = cost_service

    def run(self, request: UsageRequestCreate, requested_model: Model) -> dict[str, object]:
        total_tokens = self.cost_service.total_tokens(request.input_tokens, request.output_tokens)
        estimated_cost = self.cost_service.estimate_cost(requested_model, request.input_tokens, request.output_tokens)
        return {
            "total_tokens": total_tokens,
            "estimated_cost": estimated_cost,
            "summary": f"Captured {total_tokens:,} tokens and estimated cost.",
        }
