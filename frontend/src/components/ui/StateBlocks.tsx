import { AlertCircle, Database, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingBlock({ label = "Loading data" }: { label?: string }) {
  return (
    <div className="flex min-h-44 items-center justify-center rounded-lg border border-dashed border-border bg-white p-6 text-sm text-textSecondary">
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-azure" />
      {label}
    </div>
  );
}

export function EmptyBlock({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-slate-50 p-6 text-center">
      <Database className="h-7 w-7 text-textMuted" />
      <p className="mt-3 text-sm font-semibold text-textPrimary">{title}</p>
      <p className="mt-1 max-w-md text-sm text-textSecondary">{message}</p>
    </div>
  );
}

export function ErrorBlock({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold">Unable to load data</p>
          <p className="mt-1">{message}</p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}
