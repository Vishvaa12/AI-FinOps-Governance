import { X } from "lucide-react";

import type { RequestDetailData } from "../../types/api";
import { formatCurrency, formatDateTime, formatNumber, titleCase } from "../../utils/format";
import { StatusBadge } from "../ui/StatusBadge";

export function RequestDetailModal({
  detail,
  loading,
  onClose,
}: {
  detail: RequestDetailData | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-0 sm:items-center sm:p-6">
      <section className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-t-lg border border-border bg-white shadow-overlay sm:rounded-lg">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-textMuted">Request Detail</p>
            <h2 className="mt-1 truncate text-lg font-semibold text-textPrimary">{detail?.usage_event.request_id ?? "Loading request"}</h2>
          </div>
          <button className="rounded-lg p-2 text-textMuted hover:bg-slate-100 hover:text-textPrimary" type="button" onClick={onClose} aria-label="Close detail">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading || !detail ? (
          <div className="p-6 text-sm text-textSecondary">Loading request detail...</div>
        ) : (
          <div className="scrollbar-thin max-h-[calc(92vh-78px)] overflow-auto p-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={detail.decision.status} label={detail.decision.label} />
              <StatusBadge status={detail.decision.budget_status} />
              <StatusBadge status={detail.decision.model_status} />
              <StatusBadge status={detail.decision.anomaly_severity} />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Metric label="Estimated Cost" value={formatCurrency(detail.usage_event.estimated_cost)} />
              <Metric label="Total Tokens" value={formatNumber(detail.usage_event.total_tokens)} />
              <Metric label="Savings" value={formatCurrency(detail.decision.estimated_savings)} />
            </div>

            <div className="mt-5 rounded-lg border border-border bg-slate-50 p-4">
              <p className="text-sm font-semibold text-textPrimary">{detail.decision.recommendation}</p>
              <p className="mt-2 text-sm text-textSecondary">{detail.decision.explanation}</p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoRow label="Team" value={`${detail.team.name} · ${detail.team.department}`} />
              <InfoRow label="Owner" value={detail.team.owner_name} />
              <InfoRow label="Application" value={detail.usage_event.application_name} />
              <InfoRow label="Environment" value={titleCase(detail.usage_event.environment)} />
              <InfoRow label="Requested Model" value={detail.requested_model.model_name} />
              <InfoRow label="Recommended Model" value={detail.recommended_model?.model_name ?? "No routing change"} />
              <InfoRow label="Risk Tier" value={titleCase(detail.usage_event.risk_tier)} />
              <InfoRow label="Data Classification" value={titleCase(detail.usage_event.data_classification)} />
              <InfoRow label="Submitted" value={formatDateTime(detail.usage_event.submitted_at)} />
              <InfoRow label="Asset" value={detail.usage_event.asset_id ?? "Not provided"} />
            </div>

            <div className="mt-5 rounded-lg border border-border">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-textPrimary">Agent Summary</h3>
              </div>
              <div className="grid gap-0 divide-y divide-border text-sm">
                {Object.entries(detail.agent_summary).map(([agent, summary]) => (
                  <div key={agent} className="grid gap-2 px-4 py-3 sm:grid-cols-[180px_1fr]">
                    <span className="font-semibold text-textPrimary">{titleCase(agent)}</span>
                    <span className="text-textSecondary">{summary}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-xs font-semibold uppercase text-textMuted">{label}</p>
      <p className="metric-number mt-1 text-lg font-semibold text-textPrimary">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase text-textMuted">{label}</p>
      <p className="mt-1 truncate text-sm text-textPrimary">{value}</p>
    </div>
  );
}
