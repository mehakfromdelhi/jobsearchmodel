import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getJob } from "@/lib/mock-data";

export default async function JobDetailPage({ params }) {
  const { jobId } = await params;
  const job = getJob(jobId);

  if (!job) {
    notFound();
  }

  return (
    <AppShell
      title={job.role}
      subtitle={`${job.company} • ${job.location} • ${job.sourcePlatform}`}
      actions={
        <>
          <button className="button">Tailor Resume</button>
          <button className="button-secondary">Generate Cover Letter</button>
          <button className="button-ghost">Mark Applied</button>
        </>
      }
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
            <div className="stack">
              <button className="button">Tailor Resume</button>
              <button className="button-secondary">Compare to Another Role</button>
              <button className="button-ghost">Archive</button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
