import { useMemo, useState } from "react";

import { AppShell, type PageKey } from "./components/layout/AppShell";
import { ToastProvider } from "./components/ui/Toast";
import { DashboardPage } from "./pages/DashboardPage";
import { RequestHistoryPage } from "./pages/RequestHistoryPage";
import { SubmitRequestPage } from "./pages/SubmitRequestPage";

const pageCopy: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: {
    title: "AI Cost & Usage Governance",
    subtitle: "AI spend, tokens, budgets, routing, and chargeback.",
  },
  submit: {
    title: "Submit Request",
    subtitle: "Evaluate a sample AI usage event against budget, model, and anomaly policy.",
  },
  history: {
    title: "Request History",
    subtitle: "Review recent governance decisions, policy signals, and request details.",
  },
};

export default function App() {
  const [page, setPage] = useState<PageKey>("dashboard");
  const [refreshSignal, setRefreshSignal] = useState(0);
  const copy = useMemo(() => pageCopy[page], [page]);

  function refreshData() {
    setRefreshSignal((value) => value + 1);
  }

  const content = {
    dashboard: <DashboardPage refreshSignal={refreshSignal} onRefresh={refreshData} />,
    submit: <SubmitRequestPage refreshSignal={refreshSignal} onSubmitted={refreshData} />,
    history: <RequestHistoryPage refreshSignal={refreshSignal} />,
  }[page];

  return (
    <ToastProvider>
      <AppShell activePage={page} onPageChange={setPage} title={copy.title} subtitle={copy.subtitle}>
        {content}
      </AppShell>
    </ToastProvider>
  );
}
