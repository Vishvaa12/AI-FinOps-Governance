from sqlalchemy import Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    department: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    owner_name: Mapped[str] = mapped_column(String(120), nullable=False)
    owner_email: Mapped[str | None] = mapped_column(String(180), nullable=True)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="active")
    created_at: Mapped[str] = mapped_column(String(40), nullable=False)

    budgets: Mapped[list["Budget"]] = relationship(back_populates="team")
    usage_events: Mapped[list["UsageEvent"]] = relationship(back_populates="team")


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (UniqueConstraint("team_id", "period_month", name="uq_budget_team_month"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False)
    period_month: Mapped[str] = mapped_column(String(7), nullable=False)
    monthly_budget_amount: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    monthly_token_quota: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    warning_threshold_percent: Mapped[int] = mapped_column(Integer, nullable=False, default=80)
    block_threshold_percent: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="active")
    created_at: Mapped[str] = mapped_column(String(40), nullable=False)

    team: Mapped[Team] = relationship(back_populates="budgets")


class Model(Base):
    __tablename__ = "models"
    __table_args__ = (UniqueConstraint("provider", "model_name", name="uq_model_provider_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    provider: Mapped[str] = mapped_column(String(80), nullable=False)
    model_name: Mapped[str] = mapped_column(String(160), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="approved", index=True)
    input_token_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    output_token_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    risk_suitability: Mapped[str] = mapped_column(String(40), nullable=False, default="low_medium")
    monthly_token_cap: Mapped[int | None] = mapped_column(Integer, nullable=True)
    routing_priority: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    created_at: Mapped[str] = mapped_column(String(40), nullable=False)

    requested_usage_events: Mapped[list["UsageEvent"]] = relationship(
        back_populates="requested_model",
        foreign_keys="UsageEvent.requested_model_id",
    )
    recommended_usage_events: Mapped[list["UsageEvent"]] = relationship(
        back_populates="recommended_model",
        foreign_keys="UsageEvent.recommended_model_id",
    )


class UsageEvent(Base):
    __tablename__ = "usage_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    request_id: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False, index=True)
    application_name: Mapped[str] = mapped_column(String(160), nullable=False)
    environment: Mapped[str] = mapped_column(String(40), nullable=False, default="development")
    asset_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    owner: Mapped[str | None] = mapped_column(String(120), nullable=True)
    requested_action: Mapped[str] = mapped_column(String(240), nullable=False)
    prompt_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    requested_model_id: Mapped[int] = mapped_column(ForeignKey("models.id"), nullable=False, index=True)
    recommended_model_id: Mapped[int | None] = mapped_column(ForeignKey("models.id"), nullable=True)
    input_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    estimated_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    risk_tier: Mapped[str] = mapped_column(String(40), nullable=False, default="low")
    data_classification: Mapped[str] = mapped_column(String(40), nullable=False, default="internal")
    submitted_at: Mapped[str] = mapped_column(String(40), nullable=False, index=True)

    team: Mapped[Team] = relationship(back_populates="usage_events")
    requested_model: Mapped[Model] = relationship(
        back_populates="requested_usage_events",
        foreign_keys=[requested_model_id],
    )
    recommended_model: Mapped[Model | None] = relationship(
        back_populates="recommended_usage_events",
        foreign_keys=[recommended_model_id],
    )
    decision: Mapped["GovernanceDecision"] = relationship(
        back_populates="usage_event",
        cascade="all, delete-orphan",
        uselist=False,
    )


class GovernanceDecision(Base):
    __tablename__ = "governance_decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    usage_event_id: Mapped[int] = mapped_column(ForeignKey("usage_events.id", ondelete="CASCADE"), nullable=False, unique=True)
    decision_status: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    budget_status: Mapped[str] = mapped_column(String(40), nullable=False, default="within_budget")
    model_status: Mapped[str] = mapped_column(String(40), nullable=False, default="approved")
    anomaly_severity: Mapped[str] = mapped_column(String(40), nullable=False, default="none", index=True)
    anomaly_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_savings: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[str] = mapped_column(String(40), nullable=False)

    usage_event: Mapped[UsageEvent] = relationship(back_populates="decision")


Index("ix_usage_events_team_submitted", UsageEvent.team_id, UsageEvent.submitted_at)
