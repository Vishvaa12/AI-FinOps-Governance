import { Bell, CalendarDays, History, LayoutDashboard, Menu, Send, ShieldCheck, X } from "lucide-react";
import { useState, type ReactNode } from "react";

export type PageKey = "dashboard" | "submit" | "history";

const navItems = [
  { key: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { key: "submit" as const, label: "Submit Request", icon: Send },
  { key: "history" as const, label: "Request History", icon: History },
];

export function AppShell({
  activePage,
  onPageChange,
  title,
  subtitle,
  action,
  children,
}: {
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.key === activePage;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              onPageChange(item.key);
              setMobileOpen(false);
            }}
            className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
              active ? "bg-blue-50 text-azure" : "text-textSecondary hover:bg-slate-100 hover:text-textPrimary"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-canvas text-textPrimary">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-white lg:flex lg:flex-col">
        <Brand />
        {nav}
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-textSecondary">
            <p className="font-semibold text-textPrimary">Hackathon Demo</p>
            <p className="mt-0.5">AI-08 MVP</p>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 lg:hidden">
          <aside className="h-full w-72 border-r border-border bg-white shadow-overlay">
            <div className="flex items-center justify-between border-b border-border pr-3">
              <Brand />
              <button className="rounded-lg p-2 hover:bg-slate-100" type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-[28px] font-semibold leading-tight tracking-normal text-textPrimary">{title}</h1>
                <p className="mt-1 hidden truncate text-sm text-textSecondary sm:block">{subtitle}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm text-textSecondary md:flex">
                <CalendarDays className="h-4 w-4" />
                Current month
              </div>
              <div className="hidden h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium text-textSecondary xl:flex">
                <Bell className="h-4 w-4" />
                FinOps Analyst
              </div>
              {action}
            </div>
          </div>
        </header>
        <main className="px-4 py-5 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex h-20 items-center gap-3 px-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-azure text-white">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-textPrimary">AI FinOps</p>
        <p className="truncate text-xs text-textMuted">Governance Console</p>
      </div>
    </div>
  );
}
