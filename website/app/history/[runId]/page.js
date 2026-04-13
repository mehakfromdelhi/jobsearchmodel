import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AnalysisRunView } from "@/components/analysis-run-view";
import { getViewer } from "@/lib/auth";
import { getAnalysisRun } from "@/lib/workspace";

export default async function AnalysisHistoryDetailPage({ params }) {
  const { user, demoMode } = await getViewer({ requireAuth: true });
  const { runId } = await params;
  const run = await getAnalysisRun(user, runId, demoMode);

  if (!run) {
    notFound();
  }

  return (
    <AppShell
      title="Analysis detail"
      subtitle="Inspect ATS and HR fit outcomes, then generate an in-app revised resume if needed."
    >
      <AnalysisRunView run={run} />
    </AppShell>
  );
}
