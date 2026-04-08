import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { JobTable } from "@/components/job-table";
import { applications, dashboardStats, generatedMaterials, jobs } from "@/lib/mock-data";

const livePipeline = jobs.filter((job) => job.workflowState === "live_pipeline");
const reviewQueue = jobs.filter((job) => job.workflowState === "review_queue");

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="The primary workspace: live pipeline, review queue, applications, and resume/material generation in one place."
      actions={
        <>
          <button className="button">Run Scan</button>
          <Link href="/resumes" className="button-secondary">
            Upload Resume
          </Link>
          <button className="button-ghost">Sync Dashboard</button>
        </>
      }
    >
      <section className="card-grid">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="card stat-card">
            <p className="eyebrow">{stat.label}</p>
            <strong>{stat.value}</strong>
            <p>{stat.detail}</p>
          </div>
        ))}
      </section>

      <div className="stack">
        <JobTable
          title="Live Pipeline"
          subtitle="Fresh verified roles with strong business-role relevance."
          jobs={livePipeline}
        />

        <JobTable
          title="Review Queue"
          subtitle="Relevant roles that need date verification or confidence review before promotion."
          jobs={reviewQueue}
          reviewMode
        />

        <section className="job-detail-grid">
          <div className="card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Applications / Archive</p>
                <h3>Track applied, archived, and stale roles</h3>
              </div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>{application.company}</td>
                      <td>{application.role}</td>
                      <td>{application.status}</td>
                      <td>{application.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="stack">
            <div className="card tinted-card">
              <p className="eyebrow">Next best action</p>
              <h3>Pick one role, then tailor</h3>
              <p>Resume tailoring should always happen from a selected role, not in isolation.</p>
              <Link href="/jobs/together-senior-program-manager" className="button">
                Tailor for Together AI
              </Link>
            </div>
            <div className="card">
              <p className="eyebrow">Generated materials</p>
              <h3>Recent AI outputs</h3>
              <ul className="clean-list">
                {generatedMaterials.map((item) => (
                  <li key={item.id}>
                    <strong>{item.kind}:</strong> {item.title} <span className="muted-text">({item.status})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
