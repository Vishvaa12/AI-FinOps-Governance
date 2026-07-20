from pydantic import BaseModel, Field, field_validator, model_validator

from app.core.constants import DataClassification, Environment, RiskTier


class DemoLoadRequest(BaseModel):
    scenario: str = Field(default="default")
    reset_existing: bool = True

    @field_validator("scenario")
    @classmethod
    def validate_scenario(cls, value: str) -> str:
        allowed = {"default", "normal_request", "budget_warning", "model_routing", "cost_spike", "require_approval"}
        normalized = value.strip().lower()
        if normalized not in allowed:
            raise ValueError(f"Scenario must be one of: {', '.join(sorted(allowed))}.")
        return normalized


class UsageRequestCreate(BaseModel):
    team_id: int = Field(gt=0)
    application_name: str = Field(min_length=1, max_length=160)
    environment: Environment
    asset_id: str | None = Field(default=None, max_length=120)
    owner: str | None = Field(default=None, max_length=120)
    requested_action: str = Field(min_length=1, max_length=240)
    prompt_summary: str | None = Field(default=None, max_length=500)
    requested_model_id: int = Field(gt=0)
    input_tokens: int = Field(ge=0)
    output_tokens: int = Field(ge=0)
    risk_tier: RiskTier
    data_classification: DataClassification

    @field_validator("application_name", "requested_action")
    @classmethod
    def trim_required_strings(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Field must not be blank.")
        return trimmed

    @field_validator("asset_id", "owner", "prompt_summary")
    @classmethod
    def trim_optional_strings(cls, value: str | None) -> str | None:
        if value is None:
            return value
        trimmed = value.strip()
        return trimmed or None

    @model_validator(mode="after")
    def validate_total_tokens(self) -> "UsageRequestCreate":
        if self.input_tokens + self.output_tokens <= 0:
            raise ValueError("Total tokens must be greater than 0.")
        return self
