from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.domain.entities.models import Budget, GovernanceDecision, Model, Team, UsageEvent
from app.services.cost_calculation_service import CostCalculationService
from app.services.serialization import model_summary, team_summary


class DemoDataService:
    def __init__(self) -> None:
        self.cost_service = CostCalculationService()

    def load(self, db: Session, scenario: str, reset_existing: bool) -> dict[str, object]:
        if reset_existing:
            self._clear(db)
        if db.scalar(select(func.count(Team.id))) == 0:
            teams = self._seed_teams(db)
            models = self._seed_models(db)
            self._seed_budgets(db, teams)
            self._seed_usage(db, teams, models)
        db.commit()
        teams = list(db.scalars(select(Team).order_by(Team.name)))
        models = list(db.scalars(select(Model).order_by(Model.routing_priority)))
        return {
            "scenario": scenario,
            "loaded_at": self._now(),
            "counts": {
                "teams": db.scalar(select(func.count(Team.id))) or 0,
                "budgets": db.scalar(select(func.count(Budget.id))) or 0,
                "models": db.scalar(select(func.count(Model.id))) or 0,
                "usage_events": db.scalar(select(func.count(UsageEvent.id))) or 0,
                "governance_decisions": db.scalar(select(func.count(GovernanceDecision.id))) or 0,
            },
            "teams": [team_summary(team) for team in teams],
            "models": [model_summary(model) for model in models],
            "message": "Demo data loaded successfully.",
        }

    def _clear(self, db: Session) -> None:
        db.execute(delete(GovernanceDecision))
        db.execute(delete(UsageEvent))
        db.execute(delete(Budget))
        db.execute(delete(Model))
        db.execute(delete(Team))
        db.commit()

    def _seed_teams(self, db: Session) -> list[Team]:
        teams = [
            Team(name="Customer Analytics", department="Sales Operations", owner_name="Priya Menon", owner_email="priya.menon@example.com", status="active", created_at=self._now()),
            Team(name="Support Automation", department="Customer Experience", owner_name="David Chen", owner_email="david.chen@example.com", status="active", created_at=self._now()),
            Team(name="Engineering Productivity", department="Technology", owner_name="Aisha Khan", owner_email="aisha.khan@example.com", status="active", created_at=self._now()),
            Team(name="Finance Insights", department="Finance", owner_name="Marcus Lee", owner_email="marcus.lee@example.com", status="active", created_at=self._now()),
        ]
        db.add_all(teams)
        db.flush()
        return teams

    def _seed_models(self, db: Session) -> list[Model]:
        models = [
            Model(provider="Mock", model_name="Low Cost Fast Model", status="approved", input_token_cost=0.00001, output_token_cost=0.00002, risk_suitability="low_medium", monthly_token_cap=2000000, routing_priority=10, created_at=self._now()),
            Model(provider="Mock", model_name="Standard Balanced Model", status="approved", input_token_cost=0.00004, output_token_cost=0.00006, risk_suitability="all", monthly_token_cap=1200000, routing_priority=20, created_at=self._now()),
            Model(provider="Mock", model_name="Premium Reasoning Model", status="restricted", input_token_cost=0.00008, output_token_cost=0.00012, risk_suitability="all", monthly_token_cap=500000, routing_priority=30, created_at=self._now()),
            Model(provider="Mock", model_name="Experimental Unapproved Model", status="blocked", input_token_cost=0.00009, output_token_cost=0.00014, risk_suitability="high_only", monthly_token_cap=100000, routing_priority=90, created_at=self._now()),
        ]
        db.add_all(models)
        db.flush()
        return models

    def _seed_budgets(self, db: Session, teams: list[Team]) -> None:
        period = date.today().strftime("%Y-%m")
        budgets = [
            Budget(team_id=teams[0].id, period_month=period, monthly_budget_amount=140.0, monthly_token_quota=1800000, warning_threshold_percent=80, block_threshold_percent=100, status="active", created_at=self._now()),
            Budget(team_id=teams[1].id, period_month=period, monthly_budget_amount=38.0, monthly_token_quota=520000, warning_threshold_percent=80, block_threshold_percent=100, status="active", created_at=self._now()),
            Budget(team_id=teams[2].id, period_month=period, monthly_budget_amount=95.0, monthly_token_quota=1300000, warning_threshold_percent=80, block_threshold_percent=100, status="active", created_at=self._now()),
            Budget(team_id=teams[3].id, period_month=period, monthly_budget_amount=11.0, monthly_token_quota=180000, warning_threshold_percent=80, block_threshold_percent=100, status="active", created_at=self._now()),
        ]
        db.add_all(budgets)

    def _seed_usage(self, db: Session, teams: list[Team], models: list[Model]) -> None:
        low_cost, standard, premium, blocked = models
        scenarios = [
            (teams[0], "Customer Insight Assistant", "production", standard, standard, 4200, 900, "allow", "within_budget", "approved", "none", 0.0),
            (teams[1], "Support Bot", "production", premium, low_cost, 9000, 2200, "warn", "near_limit", "rerouted", "none", 1.03),
            (teams[2], "Developer Copilot", "development", standard, standard, 82000, 14000, "require_approval", "within_budget", "approved", "high", 0.0),
            (teams[3], "Finance Forecasting", "production", standard, standard, 16000, 3600, "block", "exceeded", "approved", "medium", 0.0),
            (teams[1], "Support Bot", "staging", blocked, None, 2600, 700, "block", "near_limit", "blocked", "low", 0.0),
        ]
        today = date.today()
        for index in range(24):
            if index < len(scenarios):
                team, app, env, req_model, rec_model, input_tokens, output_tokens, decision_status, budget_status, model_status, anomaly, savings = scenarios[index]
            else:
                team = teams[index % len(teams)]
                app = ["Customer Insight Assistant", "Support Bot", "Developer Copilot", "Finance Forecasting"][index % 4]
                env = ["production", "staging", "development", "test"][index % 4]
                req_model = [standard, low_cost, standard, premium][index % 4]
                rec_model = low_cost if req_model == premium and index % 3 == 0 else req_model
                input_tokens = 3000 + (index * 850)
                output_tokens = 700 + (index * 210)
                decision_status = "warn" if rec_model != req_model else "allow"
                budget_status = "near_limit" if team.name == "Support Automation" and index % 3 == 0 else "within_budget"
                model_status = "rerouted" if rec_model != req_model else "approved"
                anomaly = "medium" if index % 11 == 0 else "none"
                savings = self.cost_service.estimate_savings(req_model, rec_model, input_tokens, output_tokens)
            submitted_at = datetime.combine(today - timedelta(days=index % 14), time(hour=9 + (index % 8)), tzinfo=timezone.utc)
            cost = self.cost_service.estimate_cost(req_model, input_tokens, output_tokens)
            event = UsageEvent(
                request_id=f"REQ-DEMO-{index + 1:04d}",
                team_id=team.id,
                application_name=app,
                environment=env,
                asset_id=f"APP-{index + 1:03d}",
                owner=team.owner_name,
                requested_action="Summarize and classify business content",
                prompt_summary="Demo prompt summary for AI cost and usage governance.",
                requested_model_id=req_model.id,
                recommended_model_id=rec_model.id if rec_model else None,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=input_tokens + output_tokens,
                estimated_cost=cost,
                risk_tier="low" if index % 4 != 2 else "high",
                data_classification="internal" if index % 4 != 3 else "confidential",
                submitted_at=submitted_at.isoformat().replace("+00:00", "Z"),
            )
            db.add(event)
            db.flush()
            db.add(
                GovernanceDecision(
                    usage_event_id=event.id,
                    decision_status=decision_status,
                    budget_status=budget_status,
                    model_status=model_status,
                    anomaly_severity=anomaly,
                    anomaly_reason=None if anomaly == "none" else "Demo anomaly signal for unusual cost or token usage.",
                    estimated_savings=savings,
                    recommendation=self._recommendation(decision_status, model_status),
                    explanation=self._explanation(decision_status, budget_status, model_status, anomaly),
                    created_at=submitted_at.isoformat().replace("+00:00", "Z"),
                )
            )

    def _recommendation(self, decision_status: str, model_status: str) -> str:
        if decision_status == "block":
            return "Reduce usage or choose an approved model before proceeding."
        if decision_status == "require_approval":
            return "Review this request before approving spend."
        if model_status == "rerouted":
            return "Use the approved low-cost model to reduce cost."
        return "Proceed with the requested AI usage."

    def _explanation(self, decision_status: str, budget_status: str, model_status: str, anomaly: str) -> str:
        if decision_status == "block":
            return "The request violates budget or model policy."
        if decision_status == "require_approval":
            return "The request has elevated cost, risk, or anomaly signals."
        if decision_status == "warn":
            return "The request can proceed with cost or routing caution."
        return "The request is within budget and uses an approved model."

    def _now(self) -> str:
        return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
