from app.domain.entities.models import Team


class ChargebackAgent:
    def run(self, team: Team, estimated_cost: float, total_tokens: int) -> dict[str, object]:
        return {
            "team_id": team.id,
            "team_name": team.name,
            "department": team.department,
            "owner_name": team.owner_name,
            "estimated_cost": estimated_cost,
            "total_tokens": total_tokens,
            "summary": f"Cost attributed to {team.name}.",
        }
