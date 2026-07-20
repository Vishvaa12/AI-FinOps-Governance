import { Bell, Bot, DollarSign, Gauge, RefreshCw, Sparkles, TrendingDown, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCallback, useEffect, useState } from "react";

import { api, ApiClientError } from "../api/client";
import type { DashboardData, HistoryItem, RequestDetailData } from "../types/api";
import { formatCurrency, formatDateTime, formatNumber, formatPercent } from "../utils/format";
import { RequestDetailModal } from "../components/request/RequestDetailModal";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/ui/StateBlocks";
import { MetricCard } from "../components/ui/MetricCard";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/Toast";

const MODEL_COLORS = ["#2563EB", "#0891B2", "#16A34A", "#D97706", "#64748B"];

export function DashboardPage({ refreshSignal, onRefresh }: { refreshSignal: number; onRefresh: () => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [detail, setDetail] = useState<RequestDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const notify = useToast();

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.getDashboard());
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Dashboard data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, refreshSignal]);

  async function loadDemoData() {
    setLoadingDemo(true);
    try {
      const result = await api.loadDemoData();
      notify({
        tone: "success",
        title: "Demo data loaded",
        message: `${result.counts.usage_events} requests and ${result.counts.models} models are ready.`,
      });
      await loadDashboard();
      onRefresh();
    } catch (err) {
      notify({
        tone: "error",
        title: "Demo load failed",
        message: err instanceof ApiClientError ? err.message : "Could not load demo data.",
      });
    } finally {
      setLoadingDemo(false);
    }
  }

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
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading AI FinOps dashboard" />;
  }

  if (error) {
    return (
      <ErrorBlock
        message={error}
        action={
          <button className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800" type="button" onClick={loadDashboard}>
            Retry dashboard
          </button>
        }
      />
    );
  }

  if (!data) {
    return <EmptyBlock title="No dashboard data" message="Load demo data to populate spend, budget, routing, and chargeback views." />;
  }

  const totalSpend = data.team_spend.reduce((sum, row) => sum + row.estimated_cost, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary">AI Cost & Usage Governance</h2>
          <p className="mt-1 text-sm text-textSecondary">Track tokens, optimize model spend, enforce budgets, and show cost ownership.</p>
        </div>
        <button
          type="button"
          onClick={loadDemoData}
          disabled={loadingDemo}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-azure px-4 text-sm font-semibold text-white shadow-panel hover:bg-blue-700 disabled:opacity-70"
        >
          <RefreshCw className={`h-4 w-4 ${loadingDemo ? "animate-spin" : ""}`} />
          Load Demo Data
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Today's Spend" value={formatCurrency(data.kpis.todays_spend)} trend={`${formatCurrency(totalSpend)} in selected period`} icon={DollarSign} />
        <MetricCard
          title="Budget Remaining"
          value={formatCurrency(data.kpis.budget_remaining)}
          trend={`${formatPercent(data.kpis.budget_remaining_percent)} of budget remaining`}
          icon={Gauge}
          tone={data.kpis.budget_remaining_percent < 20 ? "danger" : data.kpis.budget_remaining_percent < 40 ? "warning" : "neutral"}
        />
        <MetricCard title="Estimated Savings" value={formatCurrency(data.kpis.estimated_savings)} trend="from low-cost routing" icon={TrendingDown} tone="success" />
        <MetricCard
          title="Active Alerts"
          value={formatNumber(data.kpis.active_alerts)}
          trend={data.kpis.active_alerts > 0 ? "review budget and anomaly signals" : "no active alert signals"}
          icon={Bell}
          tone={data.kpis.active_alerts > 0 ? "warning" : "neutral"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel title="Spend Trend" subtitle="Estimated cost and token consumption by day" className="xl:col-span-8">
          <div className="h-80 p-4">
            {data.spend_trend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.spend_trend} margin={{ left: 6, right: 12, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="cost" tick={{ fontSize: 12, fill: "#64748B" }} tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} width={52} />
                  <YAxis yAxisId="tokens" orientation="right" tick={{ fontSize: 12, fill: "#64748B" }} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} tickLine={false} axisLine={false} width={48} />
                  <Tooltip formatter={(value, name) => (name === "estimated_cost" ? formatCurrency(Number(value)) : formatNumber(Number(value)))} />
                  <Bar yAxisId="tokens" dataKey="total_tokens" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="cost" type="monotone" dataKey="estimated_cost" stroke="#2563EB" strokeWidth={3} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <EmptyBlock title="No spend trend yet" message="Load demo data or submit a request to populate trend lines." />
            )}
          </div>
        </Panel>

        <Panel title="AI Recommendation" subtitle="Rule-driven FinOps insight" className="xl:col-span-4">
          <div className="p-4">
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-cyan-950">{data.ai_recommendation.title}</h3>
                  <p className="mt-2 text-sm text-cyan-800">{data.ai_recommendation.impact}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <Fact icon={Bot} label="Related Team" value={data.ai_recommendation.related_team ?? "All teams"} />
              <Fact icon={TrendingDown} label="Related Model" value={data.ai_recommendation.related_model ?? "Approved catalog"} />
              <Fact icon={TriangleAlert} label="Signal" value={data.kpis.active_alerts > 0 ? `${data.kpis.active_alerts} active alerts` : "No urgent alerts"} />
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel title="Budget Utilization" subtitle="Monthly budget and quota pressure" className="xl:col-span-4">
          <div className="space-y-4 p-4">
            {data.budget_utilization.map((row) => (
              <div key={row.team_id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-textPrimary">{row.team_name}</p>
                    <p className="text-xs text-textMuted">{formatCurrency(row.used_amount)} used</p>
                  </div>
                  <StatusBadge status={row.budget_status} />
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${row.used_percent >= 100 ? "bg-red-600" : row.used_percent >= 80 ? "bg-amber-500" : "bg-azure"}`}
                    style={{ width: `${Math.min(row.used_percent, 100)}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-textMuted">
                  <span>{formatPercent(row.used_percent)}</span>
                  <span>{formatCurrency(row.remaining_amount)} left</span>
                </div>
              </div>
            ))}
            {!data.budget_utilization.length && <EmptyBlock title="No budgets" message="Budget rows appear after demo data is loaded." />}
          </div>
        </Panel>

        <Panel title="Team Spend" subtitle="Top spending teams" className="xl:col-span-4">
          <div className="h-72 p-4">
            {data.team_spend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.team_spend.slice(0, 5)} layout="vertical" margin={{ left: 10, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="team_name" width={110} tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="estimated_cost" fill="#2563EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyBlock title="No team spend" message="Submitted requests will appear here by team." />
            )}
          </div>
        </Panel>

        <Panel title="Model Usage" subtitle="Estimated cost by requested model" className="xl:col-span-4">
          <div className="h-72 p-4">
            {data.model_usage.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.model_usage} dataKey="estimated_cost" nameKey="model_name" innerRadius={62} outerRadius={92} paddingAngle={2}>
                    {data.model_usage.map((_, index) => (
                      <Cell key={index} fill={MODEL_COLORS[index % MODEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyBlock title="No model usage" message="Model distribution appears after requests are available." />
            )}
          </div>
          <div className="border-t border-border px-4 py-3">
            <div className="grid gap-2">
              {data.model_usage.slice(0, 4).map((model, index) => (
                <div key={model.model_id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex min-w-0 items-center gap-2 text-textSecondary">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MODEL_COLORS[index % MODEL_COLORS.length] }} />
                    <span className="truncate">{model.model_name}</span>
                  </span>
                  <span className="font-semibold text-textPrimary">{formatPercent(model.usage_percent)}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel title="Recent Requests" subtitle="Latest governance decisions" className="xl:col-span-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border bg-slate-50 text-xs uppercase text-textMuted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Team</th>
                  <th className="px-4 py-3 font-semibold">App</th>
                  <th className="px-4 py-3 font-semibold">Model</th>
                  <th className="px-4 py-3 text-right font-semibold">Tokens</th>
                  <th className="px-4 py-3 text-right font-semibold">Cost</th>
                  <th className="px-4 py-3 font-semibold">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recent_requests.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-textSecondary">{formatDateTime(item.submitted_at)}</td>
                    <td className="px-4 py-3 font-medium text-textPrimary">{item.team_name}</td>
                    <td className="px-4 py-3 text-textSecondary">{item.application_name}</td>
                    <td className="px-4 py-3 text-textSecondary">{item.requested_model_name}</td>
                    <td className="metric-number px-4 py-3 text-right text-textSecondary">{formatNumber(item.total_tokens)}</td>
                    <td className="metric-number px-4 py-3 text-right font-semibold text-textPrimary">{formatCurrency(item.estimated_cost)}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => openDetail(item)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2">
                        <StatusBadge status={item.decision_status} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.recent_requests.length && (
              <div className="p-4">
                <EmptyBlock title="No requests yet" message="Submit a demo request to generate recent activity." />
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Active Alerts" subtitle="Anomalies, budget pressure, and policy alerts" className="xl:col-span-4">
          <div className="divide-y divide-border">
            {data.active_alerts.map((alert) => (
              <div key={alert.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <TriangleAlert className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-textPrimary">{alert.title}</p>
                    <p className="mt-1 text-xs text-textMuted">
                      {alert.team} · {formatDateTime(alert.timestamp)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-textSecondary">{alert.description}</p>
                  </div>
                </div>
              </div>
            ))}
            {!data.active_alerts.length && (
              <div className="p-4">
                <EmptyBlock title="No active alerts" message="Budget, anomaly, and model policy alerts will appear here." />
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Chargeback Summary" subtitle="Cost ownership by team and department">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-border bg-slate-50 text-xs uppercase text-textMuted">
              <tr>
                <th className="px-4 py-3 font-semibold">Owner</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 text-right font-semibold">Tokens</th>
                <th className="px-4 py-3 text-right font-semibold">Estimated Cost</th>
                <th className="px-4 py-3 font-semibold">Top App</th>
                <th className="px-4 py-3 font-semibold">Top Model</th>
                <th className="px-4 py-3 text-right font-semibold">Alerts</th>
                <th className="px-4 py-3 text-right font-semibold">Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.chargeback_summary.map((row) => (
                <tr key={row.team_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-textPrimary">{row.team_name}</p>
                    <p className="text-xs text-textMuted">{row.owner}</p>
                  </td>
                  <td className="px-4 py-3 text-textSecondary">{row.department}</td>
                  <td className="metric-number px-4 py-3 text-right text-textSecondary">{formatNumber(row.tokens)}</td>
                  <td className="metric-number px-4 py-3 text-right font-semibold text-textPrimary">{formatCurrency(row.estimated_cost)}</td>
                  <td className="px-4 py-3 text-textSecondary">{row.top_app ?? "None"}</td>
                  <td className="px-4 py-3 text-textSecondary">{row.top_model ?? "None"}</td>
                  <td className="metric-number px-4 py-3 text-right text-textSecondary">{formatNumber(row.alerts)}</td>
                  <td className="metric-number px-4 py-3 text-right text-green-700">{formatCurrency(row.savings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.chargeback_summary.length && (
            <div className="p-4">
              <EmptyBlock title="No chargeback summary" message="Cost ownership rows appear after usage events are available." />
            </div>
          )}
        </div>
      </Panel>

      {(detail || detailLoading) && <RequestDetailModal detail={detail} loading={detailLoading} onClose={() => setDetail(null)} />}
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-white px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-azure" />
      <div className="min-w-0">
        <p className="text-xs text-textMuted">{label}</p>
        <p className="truncate text-sm font-semibold text-textPrimary">{value}</p>
      </div>
    </div>
  );
}
