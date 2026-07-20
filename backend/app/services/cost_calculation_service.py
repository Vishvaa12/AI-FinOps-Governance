from app.domain.entities.models import Model


class CostCalculationService:
    def total_tokens(self, input_tokens: int, output_tokens: int) -> int:
        return input_tokens + output_tokens

    def estimate_cost(self, model: Model, input_tokens: int, output_tokens: int) -> float:
        cost = (input_tokens * model.input_token_cost) + (output_tokens * model.output_token_cost)
        return round(cost, 4)

    def estimate_savings(
        self,
        requested_model: Model,
        recommended_model: Model | None,
        input_tokens: int,
        output_tokens: int,
    ) -> float:
        if recommended_model is None or recommended_model.id == requested_model.id:
            return 0.0
        original_cost = self.estimate_cost(requested_model, input_tokens, output_tokens)
        routed_cost = self.estimate_cost(recommended_model, input_tokens, output_tokens)
        return round(max(original_cost - routed_cost, 0.0), 4)
