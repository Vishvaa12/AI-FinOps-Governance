from datetime import datetime, timezone

from fastapi import status
from sqlalchemy.orm import Session

from app.agents.anomaly_detection_agent import AnomalyDetectionAgent
from app.agents.budget_policy_agent import BudgetPolicyAgent
from app.agents.chargeback_agent import ChargebackAgent
from app.agents.model_router_agent import ModelRouterAgent
from app.agents.orchestrator import AgentOrchestrator
from app.agents.usage_collector_agent import UsageCollectorAgent
from app.core.constants import ErrorCode, TeamStatus
from app.core.errors import APIError
from app.domain.entities.models import GovernanceDecision, Model, Team, UsageEvent
from app.domain.schemas.api import UsageRequestCreate
from app.services.anomaly_service import AnomalyService
from app.services.budget_service import BudgetService
from app.services.cost_calculation_service import CostCalculationService
from app.services.model_service import ModelService
from app.services.policy_rule_evaluator import PolicyRuleEvaluator
from app.services.serialization import decision_label, model_summary


class UsageRequestService:
    def __init__(self) -> None:
        cost_service = CostCalculationService()
        model_service = ModelService()
        orchestrator = AgentOrchestrator(
            UsageCollectorAgent(cost_service),
            BudgetPolicyAgent(BudgetService()),
            ModelRouterAgent(model_service, cost_service),
            AnomalyDetectionAgent(AnomalyService()),
            ChargebackAgent(),
            PolicyRuleEvaluator(),
        )
        self.cost_service = cost_service
        self.orchestrator = orchestrator

    def submit(self, db: Session, request: UsageRequestCreate) -> dict[str, object]:
        team = self._get_active_team(db, request.team_id)
        requested_model = self._get_model(db, request.requested_model_id)
        result = self.orchestrator.run(db, request, team, requested_model)
        model_result = result["model"]
        recommended_model = model_result["recommended_model"]

        usage_event = UsageEvent(
            request_id=self._request_id(),
            team_id=team.id,
            application_name=request.application_name,
            environment=request.environment.value,
            asset_id=request.asset_id,
            owner=request.owner,
            requested_action=request.requested_action,
            prompt_summary=request.prompt_summary,
            requested_model_id=requested_model.id,
            recommended_model_id=recommended_model.id if isinstance(recommended_model, Model) else None,
            input_tokens=request.input_tokens,
            output_tokens=request.output_tokens,
            total_tokens=int(result["usage"]["total_tokens"]),
            estimated_cost=float(result["usage"]["estimated_cost"]),
            risk_tier=request.risk_tier.value,
            data_classification=request.data_classification.value,
            submitted_at=self._now(),
        )
        db.add(usage_event)
        db.flush()

        decision_payload = result["decision"]
        anomaly = result["anomaly"]
        budget = result["budget"]
        decision = GovernanceDecision(
            usage_event_id=usage_event.id,
            decision_status=str(decision_payload["decision_status"]),
            budget_status=str(budget["budget_status"]),
            model_status=str(model_result["model_status"]),
            anomaly_severity=str(anomaly["anomaly_severity"]),
            anomaly_reason=anomaly["anomaly_reason"],
            estimated_savings=float(model_result["estimated_savings"]),
            recommendation=str(decision_payload["recommendation"]),
            explanation=str(decision_payload["explanation"]),
            created_at=self._now(),
        )
        db.add(decision)
        db.commit()
        db.refresh(usage_event)
        db.refresh(decision)

        return self.format_request_result(usage_event, decision, result["agent_summary"])

    def get_detail(self, db: Session, usage_event_id: int) -> dict[str, object]:
        usage_event = db.get(UsageEvent, usage_event_id)
        if usage_event is None:
            raise APIError(ErrorCode.REQUEST_NOT_FOUND, "Request was not found.", status.HTTP_404_NOT_FOUND)
        return self.format_request_detail(usage_event)

    def format_request_result(
        self,
        usage_event: UsageEvent,
        decision: GovernanceDecision,
        agent_summary: dict[str, object] | None = None,
    ) -> dict[str, object]:
        return {
            "usage_event": self._usage_event_summary(usage_event),
            "decision": self._decision_object(decision),
            "agent_summary": agent_summary or self._agent_summary_from_decision(usage_event, decision),
        }

    def format_request_detail(self, usage_event: UsageEvent) -> dict[str, object]:
        decision = usage_event.decision
        return {
            "usage_event": {
                "id": usage_event.id,
                "request_id": usage_event.request_id,
                "application_name": usage_event.application_name,
                "environment": usage_event.environment,
                "asset_id": usage_event.asset_id,
                "owner": usage_event.owner,
                "requested_action": usage_event.requested_action,
                "prompt_summary": usage_event.prompt_summary,
                "risk_tier": usage_event.risk_tier,
                "data_classification": usage_event.data_classification,
                "input_tokens": usage_event.input_tokens,
                "output_tokens": usage_event.output_tokens,
                "total_tokens": usage_event.total_tokens,
                "estimated_cost": usage_event.estimated_cost,
                "submitted_at": usage_event.submitted_at,
            },
            "team": {
                "id": usage_event.team.id,
                "name": usage_event.team.name,
                "department": usage_event.team.department,
                "owner_name": usage_event.team.owner_name,
            },
            "requested_model": model_summary(usage_event.requested_model),
            "recommended_model": model_summary(usage_event.recommended_model),
            "decision": self._decision_object(decision),
            "cost_breakdown": self._cost_breakdown(usage_event),
            "agent_summary": self._agent_summary_from_decision(usage_event, decision),
        }

    def _usage_event_summary(self, usage_event: UsageEvent) -> dict[str, object]:
        return {
            "id": usage_event.id,
            "request_id": usage_event.request_id,
            "team": {
                "id": usage_event.team.id,
                "name": usage_event.team.name,
                "department": usage_event.team.department,
            },
            "application_name": usage_event.application_name,
            "environment": usage_event.environment,
            "requested_model": model_summary(usage_event.requested_model),
            "recommended_model": model_summary(usage_event.recommended_model),
            "input_tokens": usage_event.input_tokens,
            "output_tokens": usage_event.output_tokens,
            "total_tokens": usage_event.total_tokens,
            "estimated_cost": usage_event.estimated_cost,
            "submitted_at": usage_event.submitted_at,
        }

    def _decision_object(self, decision: GovernanceDecision) -> dict[str, object]:
        recommended_model = decision.usage_event.recommended_model
        return {
            "status": decision.decision_status,
            "label": decision_label(decision.decision_status),
            "budget_status": decision.budget_status,
            "model_status": decision.model_status,
            "anomaly_severity": decision.anomaly_severity,
            "anomaly_reason": decision.anomaly_reason,
            "estimated_savings": decision.estimated_savings,
            "recommended_model_name": recommended_model.model_name if recommended_model else None,
            "recommendation": decision.recommendation,
            "explanation": decision.explanation,
        }

    def _cost_breakdown(self, usage_event: UsageEvent) -> dict[str, float]:
        input_cost = usage_event.input_tokens * usage_event.requested_model.input_token_cost
        output_cost = usage_event.output_tokens * usage_event.requested_model.output_token_cost
        return {
            "input_cost": round(input_cost, 4),
            "output_cost": round(output_cost, 4),
            "total_cost": round(usage_event.estimated_cost, 4),
            "estimated_savings": round(usage_event.decision.estimated_savings, 4),
        }

    def _agent_summary_from_decision(self, usage_event: UsageEvent, decision: GovernanceDecision) -> dict[str, str]:
        return {
            "usage_collector": f"Captured {usage_event.total_tokens:,} tokens and estimated cost.",
            "budget_policy": f"Budget status is {decision.budget_status}.",
            "model_router": f"Model status is {decision.model_status}.",
            "anomaly_detection": decision.anomaly_reason or "No abnormal usage detected.",
            "chargeback": f"Cost attributed to {usage_event.team.name}.",
        }

    def _get_active_team(self, db: Session, team_id: int) -> Team:
        team = db.get(Team, team_id)
        if team is None or team.status != TeamStatus.ACTIVE.value:
            raise APIError(ErrorCode.TEAM_NOT_FOUND, "The selected team does not exist or is inactive.", status.HTTP_404_NOT_FOUND)
        return team

    def _get_model(self, db: Session, model_id: int) -> Model:
        model = db.get(Model, model_id)
        if model is None:
            raise APIError(ErrorCode.MODEL_NOT_FOUND, "The selected model does not exist.", status.HTTP_404_NOT_FOUND)
        return model

    def _request_id(self) -> str:
        return f"REQ-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S-%f')}"

    def _now(self) -> str:
        return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
