import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getViewer } from "@/lib/auth";
import { getWorkspaceData } from "@/lib/workspace";

export default async function HistoryPage() {
  const { user, demoMode } = await getViewer({ requireAuth: true });
  const workspace = await getWorkspaceData(user, demoMode);

  return (
    <AppShell
      title="History"
      subtitle="Review the last 10 analysis runs, reopen the best-fit combinations, and revisit prior recommendations."
    >
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Last 10 runs</p>
            <h3>Recent role-matching analyses</h3>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Roles</th>
                <th>Resumes</th>
                <th>ATS matches</th>
                <th>HR matches</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {workspace.analysisHistory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link href={`/history/${item.id}`} className="text-link">
                      {item.createdAt}
                    </Link>
                  </td>
                  <td>{item.roleCount}</td>
                  <td>{item.resumeCount}</td>
                  <td>{item.atsMatchCount}</td>
                  <td>{item.hrMatchCount}</td>
                  <td>{item.topRecommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
