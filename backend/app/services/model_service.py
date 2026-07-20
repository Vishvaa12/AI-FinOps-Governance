from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.constants import DataClassification, ModelCatalogStatus, ModelStatus, RiskTier
from app.domain.entities.models import Model


class ModelService:
    def list_models(self, db: Session, status: str | None = None, provider: str | None = None) -> list[Model]:
        query = select(Model)
        if status:
            query = query.where(Model.status == status)
        if provider:
            query = query.where(Model.provider == provider)
        return list(db.scalars(query.order_by(Model.routing_priority, Model.model_name)))

    def get_model(self, db: Session, model_id: int) -> Model | None:
        return db.get(Model, model_id)

    def route_model(
        self,
        db: Session,
        requested_model: Model,
        risk_tier: str,
        data_classification: str,
        requested_action: str,
    ) -> dict[str, object]:
        if requested_model.status == ModelCatalogStatus.BLOCKED.value:
            return {
                "model_status": ModelStatus.BLOCKED.value,
                "recommended_model": None,
                "routing_reason": "Requested model is blocked.",
            }
        if requested_model.status == ModelCatalogStatus.INACTIVE.value:
            return {
                "model_status": ModelStatus.BLOCKED.value,
                "recommended_model": None,
                "routing_reason": "Requested model is inactive.",
            }

        if self._should_consider_low_cost_route(risk_tier, data_classification, requested_action):
            candidates = self._approved_candidates(db, risk_tier)
            cheaper = [
                model for model in candidates
                if model.id != requested_model.id and self._unit_cost(model) < self._unit_cost(requested_model)
            ]
            if cheaper:
                recommended = sorted(cheaper, key=lambda model: (model.routing_priority, self._unit_cost(model)))[0]
                return {
                    "model_status": ModelStatus.REROUTED.value,
                    "recommended_model": recommended,
                    "routing_reason": "Lower-cost approved model is suitable for this low-risk request.",
                }

        if requested_model.status == ModelCatalogStatus.RESTRICTED.value:
            return {
                "model_status": ModelStatus.RESTRICTED.value,
                "recommended_model": requested_model,
                "routing_reason": "Requested model is restricted and should be reviewed.",
            }

        return {
            "model_status": ModelStatus.APPROVED.value,
            "recommended_model": requested_model,
            "routing_reason": "Requested model is approved for this request.",
        }

    def _approved_candidates(self, db: Session, risk_tier: str) -> list[Model]:
        models = list(
            db.scalars(
                select(Model).where(Model.status == ModelCatalogStatus.APPROVED.value).order_by(Model.routing_priority)
            )
        )
        return [model for model in models if self._is_suitable(model, risk_tier)]

    def _is_suitable(self, model: Model, risk_tier: str) -> bool:
        suitability = model.risk_suitability
        if suitability == "all":
            return True
        if suitability == "low_medium":
            return risk_tier in {RiskTier.LOW.value, RiskTier.MEDIUM.value}
        if suitability == "low":
            return risk_tier == RiskTier.LOW.value
        if suitability == "high_only":
            return risk_tier == RiskTier.HIGH.value
        return False

    def _should_consider_low_cost_route(self, risk_tier: str, data_classification: str, requested_action: str) -> bool:
        action = requested_action.lower()
        low_risk_action = any(term in action for term in ["summarize", "classify", "extract", "faq", "draft"])
        low_data = data_classification in {DataClassification.PUBLIC.value, DataClassification.INTERNAL.value}
        return risk_tier == RiskTier.LOW.value and low_data and low_risk_action

    def _unit_cost(self, model: Model) -> float:
        return model.input_token_cost + model.output_token_cost
