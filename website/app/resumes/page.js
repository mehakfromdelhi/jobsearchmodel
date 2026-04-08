import { AppShell } from "@/components/app-shell";
import { resumeVariants } from "@/lib/mock-data";

export default function ResumesPage() {
  return (
    <AppShell
      title="Resume Manager"
      subtitle="Manage the active default resume, role-family variants, and tailored drafts tied to jobs."
      actions={
        <>
          <button className="button">Upload Resume</button>
          <button className="button-secondary">Create New Variant</button>
        </>
      }
    >
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Variants</p>
            <h3>Active and role-specific resumes</h3>
            <p>First version supports one base resume, multiple role-family variants, and AI-generated tailored drafts.</p>
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
              {resumeVariants.map((variant) => (
                <tr key={variant.id}>
                  <td>{variant.name}</td>
                  <td>{variant.roleFamily}</td>
                  <td>{variant.active ? "Active default" : "Available"}</td>
                  <td>{variant.lastUpdated}</td>
                  <td>{variant.summary}</td>
                  <td>
                    <div className="inline-actions">
                      <button className="link-button">Set Active</button>
                      <button className="link-button">Edit</button>
                      <button className="link-button">Duplicate</button>
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
