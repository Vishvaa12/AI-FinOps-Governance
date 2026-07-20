from collections import defaultdict
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.domain.entities.models import Budget, GovernanceDecision, Model, Team, UsageEvent
from app.services.budget_service import BudgetService
from app.services.serialization import model_summary, team_summary


class DashboardService:
    def __init__(self) -> None:
        self.budget_service = BudgetService()

    def dashboard(self, db: Session, from_date: str | None = None, to_date: str | None = None, team_id: int | None = None) -> dict[str, object]:
        events = self._events(db, from_date, to_date, team_id)
        decisions = [event.decision for event in events if event.decision]
        return {
            "kpis": self._kpis(db, events, decisions),
            "spend_trend": self._spend_trend(events),
            "budget_utilization": self._budget_utilization(db),
            "team_spend": self._team_spend(events),
            "model_usage": self._model_usage(events),
            "ai_recommendation": self._ai_recommendation(decisions),
            "recent_requests": self.recent_requests(db, limit=7),
            "active_alerts": self._active_alerts(events),
            "chargeback_summary": self._chargeback_summary(events),
            "reference_data": {
                "teams": [team_summary(team) for team in db.scalars(select(Team).where(Team.status == "active").order_by(Team.name))],
                "models": [model_summary(model) for model in db.scalars(select(Model).order_by(Model.routing_priority))],
            },
        }

    def history(
        self,
        db: Session,
        from_date: str | None,
        to_date: str | None,
        team_id: int | None,
        decision_status: str | None,
        model_id: int | None,
        environment: str | None,
        anomaly_severity: str | None,
        limit: int,
    ) -> dict[str, object]:
        query = select(UsageEvent).join(GovernanceDecision)
        query = self._apply_filters(query, from_date, to_date, team_id, model_id, environment)
        if decision_status:
            query = query.where(GovernanceDecision.decision_status == decision_status)
        if anomaly_severity:
            query = query.where(GovernanceDecision.anomaly_severity == anomaly_severity)
        items = list(db.scalars(query.order_by(UsageEvent.submitted_at.desc()).limit(limit)))
        return {"items": [self._history_row(event) for event in items], "summary": self._history_summary(items)}

    def recent_requests(self, db: Session, limit: int = 7) -> list[dict[str, object]]:
        events = list(db.scalars(select(UsageEvent).order_by(UsageEvent.submitted_at.desc()).limit(limit)))
        return [self._history_row(event) for event in events]

    def _events(self, db: Session, from_date: str | None, to_date: str | None, team_id: int | None) -> list[UsageEvent]:
        query = select(UsageEvent)
        query = self._apply_filters(query, from_date, to_date, team_id, None, None)
        return list(db.scalars(query.order_by(UsageEvent.submitted_at.desc())))

    def _apply_filters(self, query, from_date: str | None, to_date: str | None, team_id: int | None, model_id: int | None, environment: str | None):
        if from_date:
            query = query.where(UsageEvent.submitted_at >= from_date)
        if to_date:
            query = query.where(UsageEvent.submitted_at <= f"{to_date}T23:59:59Z")
        if team_id:
            query = query.where(UsageEvent.team_id == team_id)
        if model_id:
            query = query.where(UsageEvent.requested_model_id == model_id)
        if environment:
            query = query.where(UsageEvent.environment == environment)
        return query

    def _kpis(self, db: Session, events: list[UsageEvent], decisions: list[GovernanceDecision]) -> dict[str, object]:
        today_prefix = date.today().isoformat()
        todays_spend = sum(event.estimated_cost for event in events if event.submitted_at.startswith(today_prefix))
        budgets = list(db.scalars(select(Budget).where(Budget.status == "active")))
        total_budget = sum(budget.monthly_budget_amount for budget in budgets)
        total_spend = sum(event.estimated_cost for event in events)
        remaining = max(total_budget - total_spend, 0.0)
        return {
            "todays_spend": round(todays_spend, 2),
            "budget_remaining": round(remaining, 2),
            "budget_remaining_percent": round((remaining / total_budget) * 100) if total_budget else 0,
            "estimated_savings": round(sum(decision.estimated_savings for decision in decisions), 2),
            "active_alerts": sum(1 for decision in decisions if self._is_alert(decision)),
        }

    def _spend_trend(self, events: list[UsageEvent]) -> list[dict[str, object]]:
        grouped: dict[str, dict[str, float | int | str]] = {}
        for event in events:
            day = event.submitted_at[:10]
            row = grouped.setdefault(day, {"date": day, "estimated_cost": 0.0, "total_tokens": 0})
            row["estimated_cost"] = round(float(row["estimated_cost"]) + event.estimated_cost, 4)
            row["total_tokens"] = int(row["total_tokens"]) + event.total_tokens
        return sorted(grouped.values(), key=lambda row: str(row["date"]))

    def _budget_utilization(self, db: Session) -> list[dict[str, object]]:
        rows = []
        for budget in db.scalars(select(Budget).where(Budget.status == "active")):
            usage = self.budget_service.month_to_date_usage(db, budget.team_id, budget.period_month)
            used = float(usage["spend"])
            used_percent = round((used / budget.monthly_budget_amount) * 100) if budget.monthly_budget_amount else 0
            rows.append(
                {
                    "team_id": budget.team.id,
                    "team_name": budget.team.name,
                    "department": budget.team.department,
                    "budget_amount": budget.monthly_budget_amount,
                    "used_amount": round(used, 2),
                    "remaining_amount": round(max(budget.monthly_budget_amount - used, 0.0), 2),
                    "used_percent": used_percent,
                    "budget_status": self.budget_service._status(used_percent, budget.warning_threshold_percent, budget.block_threshold_percent),
                }
            )
        return sorted(rows, key=lambda row: row["used_percent"], reverse=True)

    def _team_spend(self, events: list[UsageEvent]) -> list[dict[str, object]]:
        grouped: dict[int, dict[str, object]] = {}
        for event in events:
            row = grouped.setdefault(
                event.team_id,
                {
                    "team_id": event.team_id,
                    "team_name": event.team.name,
                    "department": event.team.department,
                    "estimated_cost": 0.0,
                    "total_tokens": 0,
                },
            )
            row["estimated_cost"] = round(float(row["estimated_cost"]) + event.estimated_cost, 4)
            row["total_tokens"] = int(row["total_tokens"]) + event.total_tokens
        return sorted(grouped.values(), key=lambda row: float(row["estimated_cost"]), reverse=True)

    def _model_usage(self, events: list[UsageEvent]) -> list[dict[str, object]]:
        grouped: dict[int, dict[str, object]] = {}
        total_cost = sum(event.estimated_cost for event in events) or 1.0
        for event in events:
            model = event.requested_model
            row = grouped.setdefault(
                model.id,
                {
                    "model_id": model.id,
                    "model_name": model.model_name,
                    "provider": model.provider,
                    "estimated_cost": 0.0,
                    "total_tokens": 0,
                    "usage_percent": 0,
                },
            )
            row["estimated_cost"] = round(float(row["estimated_cost"]) + event.estimated_cost, 4)
            row["total_tokens"] = int(row["total_tokens"]) + event.total_tokens
            row["usage_percent"] = round((float(row["estimated_cost"]) / total_cost) * 100)
        return sorted(grouped.values(), key=lambda row: float(row["estimated_cost"]), reverse=True)

    def _ai_recommendation(self, decisions: list[GovernanceDecision]) -> dict[str, object]:
        rerouted = next((decision for decision in decisions if decision.model_status == "rerouted"), None)
        if rerouted:
            return {
                "title": "Route low-risk requests to the low-cost model",
                "impact": f"Estimated savings of ${rerouted.estimated_savings:.2f} on similar requests",
                "severity": "info",
                "related_team": rerouted.usage_event.team.name,
                "related_model": rerouted.usage_event.recommended_model.model_name if rerouted.usage_event.recommended_model else None,
            }
        return {
            "title": "AI usage is operating within expected policy",
            "impact": "No urgent optimization action is required.",
            "severity": "info",
            "related_team": None,
            "related_model": None,
        }

    def _active_alerts(self, events: list[UsageEvent]) -> list[dict[str, object]]:
        alerts = []
        for event in events:
            decision = event.decision
            if decision and self._is_alert(decision):
                alerts.append(
                    {
                        "id": decision.id,
                        "severity": decision.anomaly_severity if decision.anomaly_severity != "none" else decision.budget_status,
                        "title": self._alert_title(decision),
                        "team": event.team.name,
                        "application_name": event.application_name,
                        "description": decision.anomaly_reason or decision.explanation,
                        "timestamp": decision.created_at,
                    }
                )
        return alerts[:8]

    def _chargeback_summary(self, events: list[UsageEvent]) -> list[dict[str, object]]:
        grouped: dict[int, dict[str, object]] = {}
        apps: dict[int, defaultdict[str, float]] = defaultdict(lambda: defaultdict(float))
        models: dict[int, defaultdict[str, float]] = defaultdict(lambda: defaultdict(float))
        for event in events:
            row = grouped.setdefault(
                event.team_id,
                {
                    "team_id": event.team_id,
                    "team_name": event.team.name,
                    "department": event.team.department,
                    "owner": event.team.owner_name,
                    "tokens": 0,
                    "estimated_cost": 0.0,
                    "alerts": 0,
                    "savings": 0.0,
                    "top_app": None,
                    "top_model": None,
                },
            )
            row["tokens"] = int(row["tokens"]) + event.total_tokens
            row["estimated_cost"] = round(float(row["estimated_cost"]) + event.estimated_cost, 4)
            if event.decision:
                row["alerts"] = int(row["alerts"]) + (1 if self._is_alert(event.decision) else 0)
                row["savings"] = round(float(row["savings"]) + event.decision.estimated_savings, 4)
            apps[event.team_id][event.application_name] += event.estimated_cost
            models[event.team_id][event.requested_model.model_name] += event.estimated_cost
        for team_id, row in grouped.items():
            row["top_app"] = max(apps[team_id], key=apps[team_id].get) if apps[team_id] else None
            row["top_model"] = max(models[team_id], key=models[team_id].get) if models[team_id] else None
        return sorted(grouped.values(), key=lambda row: float(row["estimated_cost"]), reverse=True)

    def _history_row(self, event: UsageEvent) -> dict[str, object]:
        decision = event.decision
        return {
            "id": event.id,
            "request_id": event.request_id,
            "submitted_at": event.submitted_at,
            "team_name": event.team.name,
            "department": event.team.department,
            "application_name": event.application_name,
            "environment": event.environment,
            "requested_model_name": event.requested_model.model_name,
            "recommended_model_name": event.recommended_model.model_name if event.recommended_model else None,
            "total_tokens": event.total_tokens,
            "estimated_cost": event.estimated_cost,
            "decision_status": decision.decision_status if decision else None,
            "budget_status": decision.budget_status if decision else None,
            "model_status": decision.model_status if decision else None,
            "anomaly_severity": decision.anomaly_severity if decision else None,
        }

    def _history_summary(self, events: list[UsageEvent]) -> dict[str, object]:
        decisions = [event.decision for event in events if event.decision]
        return {
            "total_requests": len(events),
            "total_tokens": sum(event.total_tokens for event in events),
            "total_estimated_cost": round(sum(event.estimated_cost for event in events), 4),
            "allow_count": sum(1 for decision in decisions if decision.decision_status == "allow"),
            "warn_count": sum(1 for decision in decisions if decision.decision_status == "warn"),
            "block_count": sum(1 for decision in decisions if decision.decision_status == "block"),
            "require_approval_count": sum(1 for decision in decisions if decision.decision_status == "require_approval"),
        }

    def _is_alert(self, decision: GovernanceDecision) -> bool:
        return (
            decision.anomaly_severity != "none"
            or decision.budget_status in {"near_limit", "exceeded"}
            or decision.model_status in {"restricted", "blocked"}
        )

    def _alert_title(self, decision: GovernanceDecision) -> str:
        if decision.anomaly_severity != "none":
            return "Cost or usage anomaly detected"
        if decision.budget_status in {"near_limit", "exceeded"}:
            return "Budget threshold reached"
        return "Model policy alert"
