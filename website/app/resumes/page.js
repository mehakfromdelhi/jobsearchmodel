import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ResumeActivateButton } from "@/components/resume-actions";
import { getViewer } from "@/lib/auth";
import { getWorkspaceData } from "@/lib/workspace";

export default async function ResumesPage() {
  const { user, demoMode } = await getViewer({ requireAuth: true });
  const workspace = await getWorkspaceData(user, demoMode);

  return (
    <AppShell
      title="Resume Manager"
      subtitle="Keep multiple role-family resumes ready for analysis. Revised resumes are shown in-app and not saved locally."
      actions={
        <>
          <Link href="/onboarding" className="button">
            Re-run onboarding
          </Link>
        </>
      }
    >
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Variants</p>
            <h3>Stored resumes for multi-role comparison</h3>
            <p>Select from these during analysis, or paste a new one-off resume directly into an analysis run.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role family</th>
                <th>Status</th>
                <th>Last updated</th>
                <th>Summary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workspace.resumeVariants.map((variant) => (
                <tr key={variant.id}>
                  <td>{variant.name}</td>
                  <td>{variant.roleFamily}</td>
                  <td>{variant.active ? "Active default" : "Available"}</td>
                  <td>{variant.lastUpdated}</td>
                  <td>{variant.summary}</td>
                  <td>
                    <div className="inline-actions">
                      <ResumeActivateButton resumeId={variant.id} active={variant.active} />
                      <button className="link-button" disabled>Analyze in next run</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
