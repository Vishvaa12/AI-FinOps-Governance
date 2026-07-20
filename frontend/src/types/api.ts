export type DecisionStatus = "allow" | "warn" | "block" | "require_approval";
export type BudgetStatus = "within_budget" | "near_limit" | "exceeded" | "no_budget";
export type ModelStatus = "approved" | "rerouted" | "restricted" | "blocked";
export type AnomalySeverity = "none" | "low" | "medium" | "high";
export type EnvironmentName = "development" | "test" | "staging" | "production";
export type RiskTier = "low" | "medium" | "high";
export type DataClassification = "public" | "internal" | "confidential" | "restricted";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: ApiError | null;
  meta: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details: Array<{ field: string; message: string }>;
}

export interface TeamSummary {
  id: number;
  name: string;
  department: string;
  owner_name: string;
  owner_email?: string | null;
  status: string;
}

export interface ModelSummary {
  id: number;
  provider: string;
  model_name: string;
  status: "approved" | "restricted" | "blocked" | "inactive";
  input_token_cost: number;
  output_token_cost: number;
  risk_suitability: string;
  monthly_token_cap?: number | null;
  routing_priority: number;
  display_label: string;
}

export interface DashboardData {
  kpis: {
    todays_spend: number;
    budget_remaining: number;
    budget_remaining_percent: number;
    estimated_savings: number;
    active_alerts: number;
  };
  spend_trend: Array<{ date: string; estimated_cost: number; total_tokens: number }>;
  budget_utilization: BudgetUtilizationRow[];
  team_spend: Array<{ team_id: number; team_name: string; department: string; estimated_cost: number; total_tokens: number }>;
  model_usage: Array<{ model_id: number; model_name: string; provider: string; estimated_cost: number; total_tokens: number; usage_percent: number }>;
  ai_recommendation: {
    title: string;
    impact: string;
    severity: string;
    related_team?: string | null;
    related_model?: string | null;
  };
  recent_requests: HistoryItem[];
  active_alerts: AlertItem[];
  chargeback_summary: ChargebackRow[];
  reference_data: {
    teams: TeamSummary[];
    models: ModelSummary[];
  };
}

export interface BudgetUtilizationRow {
  team_id: number;
  team_name: string;
  department: string;
  budget_amount: number;
  used_amount: number;
  remaining_amount: number;
  used_percent: number;
  budget_status: BudgetStatus;
}

export interface AlertItem {
  id: number;
  severity: string;
  title: string;
  team: string;
  application_name: string;
  description: string;
  timestamp: string;
}

export interface ChargebackRow {
  team_id: number;
  team_name: string;
  department: string;
  owner: string;
  tokens: number;
  estimated_cost: number;
  alerts: number;
  savings: number;
  top_app?: string | null;
  top_model?: string | null;
}

export interface HistoryItem {
  id: number;
  request_id: string;
  submitted_at: string;
  team_name: string;
  department: string;
  application_name: string;
  environment: EnvironmentName;
  requested_model_name: string;
  recommended_model_name?: string | null;
  total_tokens: number;
  estimated_cost: number;
  decision_status: DecisionStatus;
  budget_status: BudgetStatus;
  model_status: ModelStatus;
  anomaly_severity: AnomalySeverity;
}

export interface HistoryData {
  items: HistoryItem[];
  summary: {
    total_requests: number;
    total_tokens: number;
    total_estimated_cost: number;
    allow_count: number;
    warn_count: number;
    block_count: number;
    require_approval_count: number;
  };
}

export interface UsageRequestPayload {
  team_id: number;
  application_name: string;
  environment: EnvironmentName;
  asset_id?: string | null;
  owner?: string | null;
  requested_action: string;
  prompt_summary?: string | null;
  requested_model_id: number;
  input_tokens: number;
  output_tokens: number;
  risk_tier: RiskTier;
  data_classification: DataClassification;
}

export interface DecisionObject {
  status: DecisionStatus;
  label: string;
  budget_status: BudgetStatus;
  model_status: ModelStatus;
  anomaly_severity: AnomalySeverity;
  anomaly_reason?: string | null;
  estimated_savings: number;
  recommended_model_name?: string | null;
  recommendation: string;
  explanation: string;
}

export interface UsageRequestResult {
  usage_event: {
    id: number;
    request_id: string;
    team: { id: number; name: string; department: string };
    application_name: string;
    environment: EnvironmentName;
    requested_model: ModelSummary;
    recommended_model?: ModelSummary | null;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    estimated_cost: number;
    submitted_at: string;
  };
  decision: DecisionObject;
  agent_summary: Record<string, string>;
}

export interface RequestDetailData {
  usage_event: {
    id: number;
    request_id: string;
    application_name: string;
    environment: EnvironmentName;
    asset_id?: string | null;
    owner?: string | null;
    requested_action: string;
    prompt_summary?: string | null;
    risk_tier: RiskTier;
    data_classification: DataClassification;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    estimated_cost: number;
    submitted_at: string;
  };
  team: {
    id: number;
    name: string;
    department: string;
    owner_name: string;
  };
  requested_model: ModelSummary;
  recommended_model?: ModelSummary | null;
  decision: DecisionObject;
  cost_breakdown: {
    input_cost: number;
    output_cost: number;
    total_cost: number;
    estimated_savings: number;
  };
  agent_summary: Record<string, string>;
}

export interface DemoLoadData {
  scenario: string;
  loaded_at: string;
  counts: {
    teams: number;
    budgets: number;
    models: number;
    usage_events: number;
    governance_decisions: number;
  };
  teams: TeamSummary[];
  models: ModelSummary[];
  message: string;
}
