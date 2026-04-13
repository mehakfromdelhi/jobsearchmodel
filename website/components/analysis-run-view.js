"use client";

import { useMemo, useState } from "react";

export function AnalysisRunView({ run }) {
  const [draftState, setDraftState] = useState("idle");
  const [draftMessage, setDraftMessage] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTitle, setDraftTitle] = useState("");

  const roleMap = useMemo(
    () => Object.fromEntries((run?.results?.roles || []).map((role) => [role.id, role])),
    [run]
  );
  const resumeMap = useMemo(
    () => Object.fromEntries((run?.results?.resumeInputs || []).map((resume) => [resume.id, resume])),
    [run]
  );

  async function generateDraft(pair) {
    setDraftState("loading");
    setDraftMessage("");

    const role = roleMap[pair.roleId];
    const resume = resumeMap[pair.resumeId];
    const response = await fetch(`/api/analysis/${run.id}/resume-draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        resume,
        strengths: pair.strengths,
        gaps: pair.gaps,
        missingKeywords: pair.missingKeywords
      })
    });

    const json = await response.json();
    if (!response.ok) {
      setDraftState("error");
      setDraftMessage(json.error || "Could not create the revised resume.");
      return;
    }

    setDraftTitle(json.title || "Revised resume");
    setDraftContent(json.content || "");
    setDraftState("ready");
    setDraftMessage("Revised resume generated in-app. Copy it or download a Word version.");
  }

  async function downloadDocx() {
    const response = await fetch("/api/export/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draftTitle,
        content: draftContent
      })
    });

    if (!response.ok) {
      const json = await response.json();
      setDraftMessage(json.error || "Could not export the Word document.");
      return;
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${slugify(draftTitle || "revised-resume")}.docx`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  if (!run) {
    return null;
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Analysis overview</p>
            <h3>{run.topRecommendation}</h3>
            <p>
              {run.resumeCount} resume{run.resumeCount === 1 ? "" : "s"} x {run.roleCount} role
              {run.roleCount === 1 ? "" : "s"} analyzed on {run.createdAt}
            </p>
          </div>
        </div>
        <div className="card-grid">
          <div className="card stat-card">
            <p className="eyebrow">ATS matches</p>
            <strong>{run.atsMatchCount}</strong>
            <p>Pairs above the ATS threshold</p>
          </div>
          <div className="card stat-card">
            <p className="eyebrow">HR matches</p>
            <strong>{run.hrMatchCount}</strong>
            <p>Pairs above the recruiter-fit threshold</p>
          </div>
          <div className="card stat-card">
            <p className="eyebrow">Submitted URLs</p>
            <strong>{run.submittedUrls.length}</strong>
            <p>Role links included in this run</p>
          </div>
          <div className="card stat-card">
            <p className="eyebrow">Resume inputs</p>
            <strong>{run.results.resumeInputs?.length || run.resumeCount}</strong>
            <p>Stored and transient resumes considered</p>
          </div>
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">By role</p>
        <h3>Best matching resume for each job</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>ATS matches</th>
                <th>HR matches</th>
                <th>Best resume</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {run.results.roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.company}</td>
                  <td>{role.role}</td>
                  <td>{role.atsMatchCount}</td>
                  <td>{role.hrMatchCount}</td>
                  <td>{role.bestResumeName || "No strong match yet"}</td>
                  <td>
                    <a href={role.sourceUrl} className="text-link" target="_blank" rel="noreferrer">
                      Open URL
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">Fit matrix</p>
        <h3>Resume-by-role scorecard</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Resume</th>
                <th>Role</th>
                <th>ATS</th>
                <th>HR</th>
                <th>Recommendation</th>
                <th>Highlights</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {run.results.pairs.map((pair) => (
                <tr key={pair.pairId}>
                  <td>{pair.resumeName}</td>
                  <td>
                    <strong>{pair.roleName}</strong>
                    <div className="muted-text">{pair.company}</div>
                  </td>
                  <td>{pair.atsScore}</td>
                  <td>{pair.hrScore}</td>
                  <td>{pair.recommendation}</td>
                  <td>
                    <div className="stack-tight">
                      <span>{pair.strengths[0] || "No major strength detected yet."}</span>
                      {pair.gaps[0] ? <span>{pair.gaps[0]}</span> : null}
                      {pair.redFlags[0] ? <span>{pair.redFlags[0]}</span> : null}
                    </div>
                  </td>
                  <td>
                    <button className="button-secondary" onClick={() => generateDraft(pair)} disabled={draftState === "loading"}>
                      {draftState === "loading" ? "Building..." : "Revise Resume"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {draftState === "ready" ? (
        <section className="card tinted-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Revised resume</p>
              <h3>{draftTitle}</h3>
              <p>This draft is shown in-app only. It is not saved locally as a file.</p>
            </div>
            <div className="action-row">
              <button className="button-secondary" onClick={() => navigator.clipboard.writeText(draftContent)}>
                Copy text
              </button>
              <button className="button" onClick={downloadDocx}>
                Download .docx
              </button>
            </div>
          </div>
          <textarea className="draft-output" value={draftContent} readOnly rows="18" />
          {draftMessage ? <p className="success-text">{draftMessage}</p> : null}
        </section>
      ) : null}

      {draftState === "error" && draftMessage ? <p className="error-text">{draftMessage}</p> : null}
    </div>
  );
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
