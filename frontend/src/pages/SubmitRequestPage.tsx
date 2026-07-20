import { AlertTriangle, Bot, CheckCircle2, RefreshCw, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

import { api, ApiClientError } from "../api/client";
import type { DataClassification, EnvironmentName, ModelSummary, RiskTier, TeamSummary, UsageRequestPayload, UsageRequestResult } from "../types/api";
import { formatCurrency, formatDateTime, formatNumber, titleCase } from "../utils/format";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/ui/StateBlocks";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/Toast";

type ScenarioKey = "normal" | "budget" | "routing" | "spike" | "approval";

const scenarios: Array<{ key: ScenarioKey; label: string; description: string }> = [
  { key: "normal", label: "Normal Request", description: "Healthy team, approved model, normal token volume." },
  { key: "budget", label: "Budget Exceeded", description: "Finance request expected to trigger budget pressure." },
  { key: "routing", label: "Model Routing", description: "Low-risk task asking for a higher-cost model." },
  { key: "spike", label: "Cost Spike", description: "Large usage pattern for anomaly detection." },
  { key: "approval", label: "Require Approval", description: "Production, high-risk, restricted data signals." },
];

const emptyForm: UsageRequestPayload = {
  team_id: 0,
  application_name: "",
  environment: "production",
  asset_id: "",
  owner: "",
  requested_action: "",
  prompt_summary: "",
  requested_model_id: 0,
  input_tokens: 0,
  output_tokens: 0,
  risk_tier: "low",
  data_classification: "internal",
};

export function SubmitRequestPage({ refreshSignal, onSubmitted }: { refreshSignal: number; onSubmitted: () => void }) {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<ScenarioKey>("normal");
  const [form, setForm] = useState<UsageRequestPayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<UsageRequestResult | null>(null);
  const notify = useToast();

  const loadReferenceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboard, modelResponse] = await Promise.all([api.getDashboard(), api.getModels()]);
      setTeams(dashboard.reference_data.teams);
      setModels(modelResponse.items.length ? modelResponse.items : dashboard.reference_data.models);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Reference data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData, refreshSignal]);

  useEffect(() => {
    if (teams.length && models.length) {
      setForm(buildScenarioPayload(scenario, teams, models));
      setResult(null);
    }
  }, [scenario, teams, models]);

  const scenarioDescription = useMemo(() => scenarios.find((item) => item.key === scenario)?.description ?? "", [scenario]);
  const requestedModel = models.find((model) => model.id === form.requested_model_id);
  const selectedTeam = teams.find((team) => team.id === form.team_id);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.team_id || !form.requested_model_id) {
      notify({ tone: "error", title: "Missing request data", message: "Load demo data and select a team and model." });
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.submitRequest(form);
      setResult(response);
      notify({ tone: "success", title: "Request evaluated", message: `${response.decision.label} decision returned for ${response.usage_event.request_id}.` });
      onSubmitted();
    } catch (err) {
      notify({
        tone: "error",
        title: "Evaluation failed",
        message: err instanceof ApiClientError ? err.message : "The request could not be evaluated.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function update<K extends keyof UsageRequestPayload>(key: K, value: UsageRequestPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  if (loading) {
    return <LoadingBlock label="Loading request reference data" />;
  }

  if (error) {
    return (
      <ErrorBlock
        message={error}
        action={
          <button className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800" type="button" onClick={loadReferenceData}>
            Retry reference data
          </button>
        }
      />
    );
  }

  if (!teams.length || !models.length) {
    return <EmptyBlock title="Demo data required" message="Use Load Demo Data on the dashboard before submitting governance requests." />;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
      <Panel title="Evaluate AI Usage Request" subtitle="Submit a sample event through the in-process governance agents">
        <form onSubmit={submit} className="space-y-5 p-4">
          <div>
            <label className="text-xs font-semibold uppercase text-textMuted" htmlFor="scenario">
              Demo Scenario
            </label>
            <select
              id="scenario"
              value={scenario}
              onChange={(event) => setScenario(event.target.value as ScenarioKey)}
              className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-textPrimary outline-none focus:border-azure focus:ring-2 focus:ring-blue-100"
            >
              {scenarios.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-textSecondary">{scenarioDescription}</p>
          </div>

          <FormSection title="Request Context">
            <SelectField label="Team" value={form.team_id} onChange={(value) => update("team_id", Number(value))}>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} · {team.department}
                </option>
              ))}
            </SelectField>
            <TextField label="Application" value={form.application_name} onChange={(value) => update("application_name", value)} />
            <SelectField label="Environment" value={form.environment} onChange={(value) => update("environment", value as EnvironmentName)}>
              {["development", "test", "staging", "production"].map((value) => (
                <option key={value} value={value}>
                  {titleCase(value)}
                </option>
              ))}
            </SelectField>
            <TextField label="Asset ID" value={form.asset_id ?? ""} onChange={(value) => update("asset_id", value)} />
            <TextField label="Owner" value={form.owner ?? ""} onChange={(value) => update("owner", value)} />
          </FormSection>

          <FormSection title="AI Usage">
            <TextField className="md:col-span-2" label="Requested Action" value={form.requested_action} onChange={(value) => update("requested_action", value)} />
            <SelectField label="Requested Model" value={form.requested_model_id} onChange={(value) => update("requested_model_id", Number(value))}>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.display_label}
                </option>
              ))}
            </SelectField>
            <NumberField label="Input Tokens" value={form.input_tokens} onChange={(value) => update("input_tokens", value)} />
            <NumberField label="Output Tokens" value={form.output_tokens} onChange={(value) => update("output_tokens", value)} />
            <label className="md:col-span-2">
              <span className="text-xs font-semibold uppercase text-textMuted">Prompt Summary</span>
              <textarea
                value={form.prompt_summary ?? ""}
                onChange={(event) => update("prompt_summary", event.target.value)}
                rows={4}
                className="mt-1 w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm text-textPrimary outline-none focus:border-azure focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </FormSection>

          <FormSection title="Governance Signals">
            <SelectField label="Risk Tier" value={form.risk_tier} onChange={(value) => update("risk_tier", value as RiskTier)}>
              {["low", "medium", "high"].map((value) => (
                <option key={value} value={value}>
                  {titleCase(value)}
                </option>
              ))}
            </SelectField>
            <SelectField label="Data Classification" value={form.data_classification} onChange={(value) => update("data_classification", value as DataClassification)}>
              {["public", "internal", "confidential", "restricted"].map((value) => (
                <option key={value} value={value}>
                  {titleCase(value)}
                </option>
              ))}
            </SelectField>
          </FormSection>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => {
                setForm(buildScenarioPayload(scenario, teams, models));
                setResult(null);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-textSecondary hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-azure px-4 text-sm font-semibold text-white shadow-panel hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Evaluate Request
            </button>
          </div>
        </form>
      </Panel>

      <div className="space-y-5">
        <Panel title={result ? "Request Result" : "Scenario Preview"} subtitle={result ? "Final governance decision" : "Review request before evaluation"}>
          {result ? <ResultPanel result={result} /> : <PreviewPanel form={form} team={selectedTeam} model={requestedModel} />}
        </Panel>
      </div>
    </div>
  );
}

function buildScenarioPayload(scenario: ScenarioKey, teams: TeamSummary[], models: ModelSummary[]): UsageRequestPayload {
  const teamByName = (name: string) => teams.find((team) => team.name === name) ?? teams[0];
  const modelByName = (name: string) => models.find((model) => model.model_name === name) ?? models[0];

  const standard = modelByName("Standard Balanced Model");
  const premium = modelByName("Premium Reasoning Model");

  const presets: Record<ScenarioKey, UsageRequestPayload> = {
    normal: {
      team_id: teamByName("Customer Analytics").id,
      application_name: "Customer Insight Assistant",
      environment: "production",
      asset_id: "APP-CIA-001",
      owner: teamByName("Customer Analytics").owner_name,
      requested_action: "Summarize customer meeting notes",
      prompt_summary: "Summarize recent sales call notes into follow-up actions.",
      requested_model_id: standard.id,
      input_tokens: 4200,
      output_tokens: 900,
      risk_tier: "low",
      data_classification: "internal",
    },
    budget: {
      team_id: teamByName("Finance Insights").id,
      application_name: "Finance Forecasting",
      environment: "production",
      asset_id: "APP-FIN-004",
      owner: teamByName("Finance Insights").owner_name,
      requested_action: "Analyze financial forecast variance",
      prompt_summary: "Analyze forecast variance and produce executive commentary.",
      requested_model_id: standard.id,
      input_tokens: 42000,
      output_tokens: 9000,
      risk_tier: "medium",
      data_classification: "confidential",
    },
    routing: {
      team_id: teamByName("Support Automation").id,
      application_name: "Support Bot",
      environment: "production",
      asset_id: "APP-SUP-002",
      owner: teamByName("Support Automation").owner_name,
      requested_action: "Summarize FAQ and draft customer response",
      prompt_summary: "Summarize FAQ content and draft a support response for internal review.",
      requested_model_id: premium.id,
      input_tokens: 9000,
      output_tokens: 2200,
      risk_tier: "low",
      data_classification: "internal",
    },
    spike: {
      team_id: teamByName("Engineering Productivity").id,
      application_name: "Developer Copilot",
      environment: "development",
      asset_id: "APP-ENG-003",
      owner: teamByName("Engineering Productivity").owner_name,
      requested_action: "Analyze repository and generate migration plan",
      prompt_summary: "Analyze a large repository export and produce a migration plan.",
      requested_model_id: standard.id,
      input_tokens: 88000,
      output_tokens: 16000,
      risk_tier: "medium",
      data_classification: "internal",
    },
    approval: {
      team_id: teamByName("Finance Insights").id,
      application_name: "Finance Forecasting",
      environment: "production",
      asset_id: "APP-FIN-SEC",
      owner: teamByName("Finance Insights").owner_name,
      requested_action: "Generate restricted board reporting narrative",
      prompt_summary: "Prepare a restricted finance narrative using sensitive business data.",
      requested_model_id: premium.id,
      input_tokens: 26000,
      output_tokens: 6000,
      risk_tier: "high",
      data_classification: "restricted",
    },
  };

  return presets[scenario];
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-border p-4">
      <legend className="px-1 text-sm font-semibold text-textPrimary">{title}</legend>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function TextField({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <label className={className}>
      <span className="text-xs font-semibold uppercase text-textMuted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-textPrimary outline-none focus:border-azure focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase text-textMuted">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="metric-number mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-textPrimary outline-none focus:border-azure focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string | number; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase text-textMuted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-textPrimary outline-none focus:border-azure focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}

function PreviewPanel({ form, team, model }: { form: UsageRequestPayload; team?: TeamSummary; model?: ModelSummary }) {
  const estimatedCost = model ? form.input_tokens * model.input_token_cost + form.output_tokens * model.output_token_cost : 0;
  return (
    <div className="p-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-blue-950">{team?.name ?? "Select a team"}</p>
            <p className="mt-1 text-sm text-blue-800">{form.requested_action || "Select a scenario to populate the request."}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        <PreviewMetric label="Requested Model" value={model?.model_name ?? "Not selected"} />
        <PreviewMetric label="Environment" value={titleCase(form.environment)} />
        <PreviewMetric label="Total Tokens" value={formatNumber(form.input_tokens + form.output_tokens)} />
        <PreviewMetric label="Estimated Cost" value={formatCurrency(estimatedCost)} />
        <PreviewMetric label="Risk & Data" value={`${titleCase(form.risk_tier)} · ${titleCase(form.data_classification)}`} />
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: UsageRequestResult }) {
  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={result.decision.status} label={result.decision.label} />
        <span className="text-xs text-textMuted">
          {result.usage_event.request_id} · {formatDateTime(result.usage_event.submitted_at)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <PreviewMetric label="Estimated Cost" value={formatCurrency(result.usage_event.estimated_cost)} />
        <PreviewMetric label="Total Tokens" value={formatNumber(result.usage_event.total_tokens)} />
        <PreviewMetric label="Recommended Model" value={result.decision.recommended_model_name ?? "No routing change"} />
        <PreviewMetric label="Savings" value={formatCurrency(result.decision.estimated_savings)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusBadge status={result.decision.budget_status} />
        <StatusBadge status={result.decision.model_status} />
        <StatusBadge status={result.decision.anomaly_severity} />
      </div>

      <div className="mt-5 rounded-lg border border-border bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          {result.decision.status === "allow" ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-700" /> : <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-textPrimary">{result.decision.recommendation}</p>
            <p className="mt-2 text-sm text-textSecondary">{result.decision.explanation}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border">
        <div className="border-b border-border px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-textPrimary">
            <Bot className="h-4 w-4 text-azure" />
            Agent Trace
          </h3>
        </div>
        <div className="divide-y divide-border">
          {Object.entries(result.agent_summary).map(([agent, summary]) => (
            <div key={agent} className="px-4 py-3">
              <p className="text-xs font-semibold uppercase text-textMuted">{titleCase(agent)}</p>
              <p className="mt-1 text-sm text-textSecondary">{summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-3">
      <p className="text-xs font-semibold uppercase text-textMuted">{label}</p>
      <p className="metric-number mt-1 truncate text-sm font-semibold text-textPrimary">{value}</p>
    </div>
  );
}
