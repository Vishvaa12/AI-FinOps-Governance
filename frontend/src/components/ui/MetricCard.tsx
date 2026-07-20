import type { LucideIcon } from "lucide-react";

export function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  tone = "neutral",
}: {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const toneClass = {
    neutral: "bg-slate-50 text-graphite",
    success: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    info: "bg-cyan-50 text-cyan-700",
  }[tone];

  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-textMuted">{title}</p>
          <p className="metric-number mt-2 truncate text-3xl font-semibold text-textPrimary">{value}</p>
        </div>
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 truncate text-xs text-textSecondary">{trend}</p>
    </section>
  );
}
