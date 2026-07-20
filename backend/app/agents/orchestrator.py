from sqlalchemy.orm import Session

from app.agents.anomaly_detection_agent import AnomalyDetectionAgent
from app.agents.budget_policy_agent import BudgetPolicyAgent
from app.agents.chargeback_agent import ChargebackAgent
from app.agents.model_router_agent import ModelRouterAgent
from app.agents.usage_collector_agent import UsageCollectorAgent
from app.domain.entities.models import Model, Team
from app.domain.schemas.api import UsageRequestCreate
from app.services.policy_rule_evaluator import PolicyRuleEvaluator


class AgentOrchestrator:
    def __init__(
        self,
        usage_collector: UsageCollectorAgent,
        budget_policy: BudgetPolicyAgent,
        model_router: ModelRouterAgent,
        anomaly_detection: AnomalyDetectionAgent,
        chargeback: ChargebackAgent,
        rule_evaluator: PolicyRuleEvaluator,
    ) -> None:
        self.usage_collector = usage_collector
        self.budget_policy = budget_policy
        self.model_router = model_router
        self.anomaly_detection = anomaly_detection
        self.chargeback = chargeback
        self.rule_evaluator = rule_evaluator

    def run(self, db: Session, request: UsageRequestCreate, team: Team, requested_model: Model) -> dict[str, object]:
        usage = self.usage_collector.run(request, requested_model)
        model_result = self.model_router.run(db, request, requested_model)
        budget = self.budget_policy.run(db, team.id, float(usage["estimated_cost"]), int(usage["total_tokens"]))
        anomaly = self.anomaly_detection.run(
            db,
            team.id,
            int(usage["total_tokens"]),
            float(usage["estimated_cost"]),
            str(model_result["model_status"]),
            request.environment.value,
        )
        recommended_model = model_result["recommended_model"]
        recommended_model_name = recommended_model.model_name if isinstance(recommended_model, Model) else None
        decision = self.rule_evaluator.evaluate(
            str(budget["budget_status"]),
            str(budget["quota_status"]),
            str(model_result["model_status"]),
            str(anomaly["anomaly_severity"]),
            float(model_result["estimated_savings"]),
            recommended_model_name,
        )
        chargeback = self.chargeback.run(team, float(usage["estimated_cost"]), int(usage["total_tokens"]))
        return {
            "usage": usage,
            "budget": budget,
            "model": model_result,
            "anomaly": anomaly,
            "decision": decision,
            "chargeback": chargeback,
            "agent_summary": {
                "usage_collector": usage["summary"],
                "budget_policy": budget["summary"],
                "model_router": model_result["summary"],
                "anomaly_detection": anomaly["summary"],
                "chargeback": chargeback["summary"],
            },
        }
