import Link from "next/link";

export function JobTable({ title, subtitle, jobs, reviewMode = false }) {
  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="eyebrow">{reviewMode ? "Review queue" : "Live pipeline"}</p>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Location</th>
              <th>{reviewMode ? "Reason" : "Freshness"}</th>
              <th>Score</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.company}</td>
                <td>{job.role}</td>
                <td>{job.location}</td>
                <td>{reviewMode ? job.reason : job.freshness}</td>
                <td>{job.relevanceScore}</td>
                <td>
                  <span className={`pill pill-${job.priority.toLowerCase()}`}>{job.priority}</span>
                </td>
                <td>
                  <div className="inline-actions">
                    <Link href={`/jobs/${job.id}`} className="text-link">
                      View
                    </Link>
                    <button className="link-button">{reviewMode ? "Verify" : "Tailor"}</button>
                    <button className="link-button">{reviewMode ? "Move" : "Apply"}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
