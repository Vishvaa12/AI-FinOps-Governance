from app.core.constants import AnomalySeverity, BudgetStatus, DecisionStatus, ModelStatus


class PolicyRuleEvaluator:
    def evaluate(
        self,
        budget_status: str,
        quota_status: str,
        model_status: str,
        anomaly_severity: str,
        estimated_savings: float,
        recommended_model_name: str | None,
    ) -> dict[str, object]:
        if model_status == ModelStatus.BLOCKED.value:
            status = DecisionStatus.BLOCK.value
            recommendation = "Use an approved model before proceeding."
            explanation = "The requested model is blocked or inactive."
        elif budget_status == BudgetStatus.EXCEEDED.value or quota_status == BudgetStatus.EXCEEDED.value:
            status = DecisionStatus.BLOCK.value
            recommendation = "Reduce usage or increase the team budget before retrying."
            explanation = "The request would exceed the team budget or token quota."
        elif anomaly_severity == AnomalySeverity.HIGH.value:
            status = DecisionStatus.REQUIRE_APPROVAL.value
            recommendation = "Review this request before approving spend."
            explanation = "The request shows a high cost or token anomaly."
        elif model_status == ModelStatus.RESTRICTED.value:
            status = DecisionStatus.REQUIRE_APPROVAL.value
            recommendation = "Review restricted model usage before proceeding."
            explanation = "The requested model is restricted for this usage pattern."
        elif budget_status == BudgetStatus.NEAR_LIMIT.value or quota_status == BudgetStatus.NEAR_LIMIT.value:
            status = DecisionStatus.WARN.value
            recommendation = "Proceed carefully because the team is near its monthly limit."
            explanation = "The request is valid but the team is close to budget or quota threshold."
        elif model_status == ModelStatus.REROUTED.value:
            status = DecisionStatus.WARN.value
            recommendation = f"Use {recommended_model_name} to reduce cost."
            explanation = "A lower-cost approved model is suitable for this low-risk request."
        elif anomaly_severity in {AnomalySeverity.MEDIUM.value, AnomalySeverity.LOW.value}:
            status = DecisionStatus.WARN.value
            recommendation = "Review usage pattern and proceed with cost awareness."
            explanation = "The request has a non-blocking anomaly signal."
        else:
            status = DecisionStatus.ALLOW.value
            recommendation = "Proceed with the requested AI usage."
            explanation = "The request is within budget and uses an approved model."

        if estimated_savings > 0 and model_status == ModelStatus.REROUTED.value:
            recommendation = f"Use {recommended_model_name} to save an estimated ${estimated_savings:.2f}."

        return {"decision_status": status, "recommendation": recommendation, "explanation": explanation}
