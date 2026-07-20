from sqlalchemy.orm import Session

from app.services.budget_service import BudgetService


class BudgetPolicyAgent:
    def __init__(self, budget_service: BudgetService) -> None:
        self.budget_service = budget_service

    def run(self, db: Session, team_id: int, estimated_cost: float, total_tokens: int) -> dict[str, object]:
        result = self.budget_service.evaluate(db, team_id, estimated_cost, total_tokens)
        result["summary"] = f"Budget status is {result['budget_status']} and quota status is {result['quota_status']}."
        return result
