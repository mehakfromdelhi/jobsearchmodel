import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { JobActions } from "@/components/job-actions";
import { getViewer } from "@/lib/auth";
import { getWorkspaceData } from "@/lib/workspace";

export default async function JobDetailPage({ params }) {
  const { jobId } = await params;
  const { user, demoMode } = await getViewer({ requireAuth: false });
  const workspace = await getWorkspaceData(user, demoMode);
  const job = workspace.jobs.find((item) => item.id === jobId);

  if (!job) {
    notFound();
  }

  return (
    <AppShell
      title={job.role}
      subtitle={`${job.company} • ${job.location} • ${job.sourcePlatform}`}
      actions={<JobActions jobId={job.id} allowPromote={job.workflowState === "review_queue"} />}
    >
      <div className="job-detail-grid">
        <div className="stack">
          <section className="card">
            <div className="detail-head">
              <div>
                <p className="eyebrow">Role detail</p>
                <h3>Job summary</h3>
              </div>
              <Link href={job.sourceUrl} className="text-link">
                Open source
              </Link>
            </div>
            <p>{job.jdSummary}</p>
            <p>{job.description}</p>
          </section>

          <section className="card">
            <p className="eyebrow">AI actions</p>
            <h3>Tailor from a selected role</h3>
            <ul className="clean-list">
              <li>Choose base or role-specific resume variant</li>
              <li>Generate tailored draft plus fit explanation</li>
              <li>Save as a new resume variant</li>
              <li>Generate cover letter and short answers</li>
            </ul>
          </section>
        </div>

        <div className="stack">
          <section className="card tinted-card">
            <p className="eyebrow">Fit signals</p>
            <h3>{job.relevanceScore}/100 relevance</h3>
            <p>{job.reason}</p>
            <ul className="detail-list">
              <li><strong>Freshness:</strong> {job.freshness}</li>
              <li><strong>Freshness source:</strong> {job.freshnessSource}</li>
              <li><strong>Priority:</strong> {job.priority}</li>
              <li><strong>Funding:</strong> {job.funding}</li>
            </ul>
          </section>

          <section className="card">
            <p className="eyebrow">Workflow</p>
            <h3>Next decisions</h3>
            <JobActions jobId={job.id} allowPromote={job.workflowState === "review_queue"} />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
