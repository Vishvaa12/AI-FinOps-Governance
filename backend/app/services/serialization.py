from app.domain.entities.models import Model, Team


def team_summary(team: Team) -> dict[str, object]:
    return {
        "id": team.id,
        "name": team.name,
        "department": team.department,
        "owner_name": team.owner_name,
        "owner_email": team.owner_email,
        "status": team.status,
    }


def model_summary(model: Model | None) -> dict[str, object] | None:
    if model is None:
        return None
    return {
        "id": model.id,
        "provider": model.provider,
        "model_name": model.model_name,
        "status": model.status,
        "input_token_cost": model.input_token_cost,
        "output_token_cost": model.output_token_cost,
        "risk_suitability": model.risk_suitability,
        "monthly_token_cap": model.monthly_token_cap,
        "routing_priority": model.routing_priority,
        "display_label": f"{model.provider} - {model.model_name}",
    }


def decision_label(status: str) -> str:
    labels = {
        "allow": "Allow",
        "warn": "Warn",
        "block": "Block",
        "require_approval": "Require Approval",
    }
    return labels.get(status, status.replace("_", " ").title())
