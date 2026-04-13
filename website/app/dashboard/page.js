import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AnalysisWorkspace } from "@/components/analysis-workspace";
import { getViewer } from "@/lib/auth";
import { getWorkspaceData } from "@/lib/workspace";

export default async function DashboardPage() {
  const { user, demoMode } = await getViewer({ requireAuth: false });
  const workspace = await getWorkspaceData(user, demoMode);
  if (!demoMode && !user) {
    redirect("/sign-in");
  }
  if (!demoMode && user && !workspace.profileComplete) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      title="Workspace Home"
      subtitle="Start from your stored resumes, choose an analysis mode, and compare them against one or many job URLs."
      actions={
        <>
          <Link href="/onboarding" className="button-secondary">
            Add Resumes
          </Link>
          <Link href="/resumes" className="button-secondary">
            Manage Resumes
          </Link>
          <Link href="/history" className="button">
            View History
          </Link>
        </>
      }
    >
      {workspace.betaMode ? (
        <div className="card tinted-card">
          <p className="eyebrow">Demo mode</p>
          <h3>Auth and database are not configured yet</h3>
          <p>The beta app falls back to demo analysis data locally until Supabase and Postgres env vars are set.</p>
        </div>
      ) : null}
      <section className="card-grid">
        {workspace.analysisStats.map((stat) => (
          <div key={stat.label} className="card stat-card">
            <p className="eyebrow">{stat.label}</p>
            <strong>{stat.value}</strong>
            <p>{stat.detail}</p>
          </div>
        ))}
      </section>
      <AnalysisWorkspace
        resumeVariants={workspace.resumeVariants}
        initialRun={workspace.latestAnalysisRun}
        history={workspace.analysisHistory}
      />
    </AppShell>
  );
}
