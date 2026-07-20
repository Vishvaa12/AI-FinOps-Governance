from enum import StrEnum


class DecisionStatus(StrEnum):
    ALLOW = "allow"
    WARN = "warn"
    BLOCK = "block"
    REQUIRE_APPROVAL = "require_approval"


class RiskTier(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Environment(StrEnum):
    DEVELOPMENT = "development"
    TEST = "test"
    STAGING = "staging"
    PRODUCTION = "production"


class BudgetStatus(StrEnum):
    WITHIN_BUDGET = "within_budget"
    NEAR_LIMIT = "near_limit"
    EXCEEDED = "exceeded"
    NO_BUDGET = "no_budget"


class ModelStatus(StrEnum):
    APPROVED = "approved"
    REROUTED = "rerouted"
    RESTRICTED = "restricted"
    BLOCKED = "blocked"


class ModelCatalogStatus(StrEnum):
    APPROVED = "approved"
    RESTRICTED = "restricted"
    BLOCKED = "blocked"
    INACTIVE = "inactive"


class AnomalySeverity(StrEnum):
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TeamStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class BudgetPolicyStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class DataClassification(StrEnum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"


class ErrorCode(StrEnum):
    VALIDATION_ERROR = "VALIDATION_ERROR"
    DEMO_LOAD_FAILED = "DEMO_LOAD_FAILED"
    TEAM_NOT_FOUND = "TEAM_NOT_FOUND"
    MODEL_NOT_FOUND = "MODEL_NOT_FOUND"
    MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE"
    BUDGET_NOT_FOUND = "BUDGET_NOT_FOUND"
    REQUEST_NOT_FOUND = "REQUEST_NOT_FOUND"
    REQUEST_EVALUATION_FAILED = "REQUEST_EVALUATION_FAILED"
    UNEXPECTED_ERROR = "UNEXPECTED_ERROR"
