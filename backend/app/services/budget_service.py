from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.constants import BudgetPolicyStatus, BudgetStatus
from app.domain.entities.models import Budget, UsageEvent


class BudgetService:
    def current_period(self) -> str:
        return date.today().strftime("%Y-%m")

    def get_active_budget(self, db: Session, team_id: int, period_month: str | None = None) -> Budget | None:
        period = period_month or self.current_period()
        return db.scalar(
            select(Budget).where(
                Budget.team_id == team_id,
                Budget.period_month == period,
                Budget.status == BudgetPolicyStatus.ACTIVE.value,
            )
        )

    def month_to_date_usage(self, db: Session, team_id: int, period_month: str | None = None) -> dict[str, float | int]:
        period = period_month or self.current_period()
        start = f"{period}-01"
        spend = db.scalar(
            select(func.coalesce(func.sum(UsageEvent.estimated_cost), 0.0)).where(
                UsageEvent.team_id == team_id,
                UsageEvent.submitted_at >= start,
            )
        )
        tokens = db.scalar(
            select(func.coalesce(func.sum(UsageEvent.total_tokens), 0)).where(
                UsageEvent.team_id == team_id,
                UsageEvent.submitted_at >= start,
            )
        )
        return {"spend": float(spend or 0.0), "tokens": int(tokens or 0)}

    def evaluate(self, db: Session, team_id: int, estimated_cost: float, total_tokens: int) -> dict[str, object]:
        budget = self.get_active_budget(db, team_id)
        if budget is None:
            return {
                "budget": None,
                "budget_status": BudgetStatus.NO_BUDGET.value,
                "quota_status": BudgetStatus.NO_BUDGET.value,
                "current_spend": 0.0,
                "current_tokens": 0,
                "projected_spend": estimated_cost,
                "projected_tokens": total_tokens,
                "budget_used_percent": 0,
                "quota_used_percent": 0,
            }

        usage = self.month_to_date_usage(db, team_id, budget.period_month)
        projected_spend = float(usage["spend"]) + estimated_cost
        projected_tokens = int(usage["tokens"]) + total_tokens
        budget_used = self._percent(projected_spend, budget.monthly_budget_amount)
        quota_used = self._percent(projected_tokens, budget.monthly_token_quota)
        return {
            "budget": budget,
            "budget_status": self._status(budget_used, budget.warning_threshold_percent, budget.block_threshold_percent),
            "quota_status": self._status(quota_used, budget.warning_threshold_percent, budget.block_threshold_percent),
            "current_spend": round(float(usage["spend"]), 4),
            "current_tokens": int(usage["tokens"]),
            "projected_spend": round(projected_spend, 4),
            "projected_tokens": projected_tokens,
            "budget_used_percent": budget_used,
            "quota_used_percent": quota_used,
        }

    def _percent(self, used: float, limit: float) -> int:
        if limit <= 0:
            return 0
        return round((used / limit) * 100)

    def _status(self, used_percent: int, warning_threshold: int, block_threshold: int) -> str:
        if used_percent >= block_threshold:
            return BudgetStatus.EXCEEDED.value
        if used_percent >= warning_threshold:
            return BudgetStatus.NEAR_LIMIT.value
        return BudgetStatus.WITHIN_BUDGET.value
