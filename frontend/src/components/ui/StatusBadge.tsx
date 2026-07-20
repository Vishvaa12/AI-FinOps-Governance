import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Info,
  OctagonX,
  ShieldQuestion,
  TriangleAlert,
} from "lucide-react";

import type { AnomalySeverity, BudgetStatus, DecisionStatus, ModelStatus } from "../../types/api";
import { titleCase } from "../../utils/format";

type BadgeKind = DecisionStatus | BudgetStatus | ModelStatus | AnomalySeverity | "info" | string;

const styles: Record<string, string> = {
  allow: "bg-green-50 text-green-700 ring-green-200",
  within_budget: "bg-green-50 text-green-700 ring-green-200",
  approved: "bg-green-50 text-green-700 ring-green-200",
  none: "bg-slate-50 text-slate-600 ring-slate-200",
  warn: "bg-amber-50 text-amber-700 ring-amber-200",
  near_limit: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-amber-50 text-amber-700 ring-amber-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  rerouted: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  require_approval: "bg-blue-50 text-blue-700 ring-blue-200",
  no_budget: "bg-blue-50 text-blue-700 ring-blue-200",
  restricted: "bg-blue-50 text-blue-700 ring-blue-200",
  info: "bg-blue-50 text-blue-700 ring-blue-200",
  block: "bg-red-50 text-red-700 ring-red-200",
  exceeded: "bg-red-50 text-red-700 ring-red-200",
  blocked: "bg-red-50 text-red-700 ring-red-200",
  high: "bg-red-50 text-red-700 ring-red-200",
};

function iconFor(kind: string) {
  if (kind === "allow" || kind === "within_budget" || kind === "approved") {
    return CheckCircle2;
  }
  if (kind === "block" || kind === "blocked" || kind === "exceeded") {
    return OctagonX;
  }
  if (kind === "require_approval" || kind === "restricted" || kind === "no_budget") {
    return kind === "require_approval" ? Clock3 : ShieldQuestion;
  }
  if (kind === "warn" || kind === "near_limit" || kind === "low" || kind === "medium") {
    return AlertTriangle;
  }
  if (kind === "high") {
    return TriangleAlert;
  }
  return Info;
}

export function StatusBadge({ status, label }: { status: BadgeKind; label?: string }) {
  const normalized = String(status);
  const Icon = iconFor(normalized);
  return (
    <span
      className={`inline-flex h-7 max-w-full items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ring-1 ring-inset ${
        styles[normalized] ?? styles.info
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label ?? titleCase(normalized)}</span>
    </span>
  );
}
