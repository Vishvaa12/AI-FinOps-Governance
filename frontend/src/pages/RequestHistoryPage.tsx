import { Filter, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api, ApiClientError } from "../api/client";
import type { DecisionStatus, EnvironmentName, HistoryData, HistoryItem, RequestDetailData } from "../types/api";
import { RequestDetailModal } from "../components/request/RequestDetailModal";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/ui/StateBlocks";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/Toast";
import { formatCurrency, formatDateTime, formatNumber, titleCase } from "../utils/format";

export function RequestHistoryPage({ refreshSignal }: { refreshSignal: number }) {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [decision, setDecision] = useState<DecisionStatus | "">("");
  const [environment, setEnvironment] = useState<EnvironmentName | "">("");
  const [detail, setDetail] = useState<RequestDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const notify = useToast();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(
        await api.getHistory({
          decision_status: decision || undefined,
          environment: environment || undefined,
          limit: 100,
        }),
      );
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Request history could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [decision, environment]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshSignal]);

  const filteredItems = useMemo(() => {
    if (!data) {
      return [];
    }
    const term = search.trim().toLowerCase();
    if (!term) {
      return data.items;
    }
    return data.items.filter((item) =>
      [item.request_id, item.team_name, item.department, item.application_name, item.requested_model_name, item.recommended_model_name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [data, search]);

  async function openDetail(item: HistoryItem) {
    setDetailLoading(true);
    setDetail(null);
    try {
      setDetail(await api.getRequestDetail(item.id));
    } catch (err) {
      notify({
        tone: "error",
        title: "Request detail unavailable",
        message: err instanceof ApiClientError ? err.message : "Could not load request detail.",
      });
    } finally {
      setDetailLoading(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading request history" />;
  }

  if (error) {
    return (
      <ErrorBlock
        message={error}
        action={
          <button className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800" type="button" onClick={loadHistory}>
            Retry history
          </button>
        }
      />
    );
  }

  if (!data) {
    return <EmptyBlock title="No history data" message="Submitted requests will appear in the history view." />;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total Requests" value={formatNumber(data.summary.total_requests)} />
        <SummaryCard label="Total Tokens" value={formatNumber(data.summary.total_tokens)} />
        <SummaryCard label="Estimated Cost" value={formatCurrency(data.summary.total_estimated_cost)} />
        <SummaryCard label="Needs Attention" value={formatNumber(data.summary.warn_count + data.summary.block_count + data.summary.require_approval_count)} />
      </div>

      <Panel title="Request History" subtitle="Search and filter AI usage governance outcomes">
        <div className="border-b border-border p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_180px_auto]">
            <label className="relative">
              <span className="sr-only">Search requests</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by request, team, app, or model"
                className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-textPrimary outline-none focus:border-azure focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <select
              value={decision}
              onChange={(event) => setDecision(event.target.value as DecisionStatus | "")}
              className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-textPrimary outline-none focus:border-azure focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All decisions</option>
              <option value="allow">Allow</option>
              <option value="warn">Warn</option>
              <option value="block">Block</option>
              <option value="require_approval">Require Approval</option>
            </select>
            <select
              value={environment}
              onChange={(event) => setEnvironment(event.target.value as EnvironmentName | "")}
              className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-textPrimary outline-none focus:border-azure focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All environments</option>
              <option value="development">Development</option>
              <option value="test">Test</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
            <button
              type="button"
              onClick={loadHistory}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-textSecondary hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" />
              Apply
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-border bg-slate-50 text-xs uppercase text-textMuted">
              <tr>
                <th className="px-4 py-3 font-semibold">Request</th>
                <th className="px-4 py-3 font-semibold">Team</th>
                <th className="px-4 py-3 font-semibold">Application</th>
                <th className="px-4 py-3 font-semibold">Environment</th>
                <th className="px-4 py-3 font-semibold">Model</th>
                <th className="px-4 py-3 text-right font-semibold">Tokens</th>
                <th className="px-4 py-3 text-right font-semibold">Cost</th>
                <th className="px-4 py-3 font-semibold">Decision</th>
                <th className="px-4 py-3 font-semibold">Signals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => openDetail(item)} className="text-left font-semibold text-azure hover:text-blue-700">
                      {item.request_id}
                    </button>
                    <p className="mt-0.5 text-xs text-textMuted">{formatDateTime(item.submitted_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-textPrimary">{item.team_name}</p>
                    <p className="text-xs text-textMuted">{item.department}</p>
                  </td>
                  <td className="px-4 py-3 text-textSecondary">{item.application_name}</td>
                  <td className="px-4 py-3 text-textSecondary">{titleCase(item.environment)}</td>
                  <td className="px-4 py-3">
                    <p className="text-textSecondary">{item.requested_model_name}</p>
                    {item.recommended_model_name && item.recommended_model_name !== item.requested_model_name && (
                      <p className="mt-0.5 text-xs text-cyan-700">Route to {item.recommended_model_name}</p>
                    )}
                  </td>
                  <td className="metric-number px-4 py-3 text-right text-textSecondary">{formatNumber(item.total_tokens)}</td>
                  <td className="metric-number px-4 py-3 text-right font-semibold text-textPrimary">{formatCurrency(item.estimated_cost)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.decision_status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={item.budget_status} />
                      <StatusBadge status={item.anomaly_severity} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredItems.length && (
            <div className="p-4">
              <EmptyBlock title="No matching requests" message="Adjust search or filters to review more request history." />
            </div>
          )}
        </div>
      </Panel>

      {(detail || detailLoading) && <RequestDetailModal detail={detail} loading={detailLoading} onClose={() => setDetail(null)} />}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-panel">
      <p className="text-xs font-semibold uppercase text-textMuted">{label}</p>
      <p className="metric-number mt-2 truncate text-2xl font-semibold text-textPrimary">{value}</p>
    </section>
  );
}
