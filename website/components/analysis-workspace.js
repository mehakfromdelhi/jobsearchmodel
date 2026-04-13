"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisRunView } from "@/components/analysis-run-view";

export function AnalysisWorkspace({ resumeVariants, initialRun, history }) {
  const router = useRouter();
  const [selectedResumeIds, setSelectedResumeIds] = useState(
    resumeVariants.filter((resume) => resume.active).map((resume) => resume.id)
  );
  const [analysisMode, setAnalysisMode] = useState("comprehensive");
  const [urls, setUrls] = useState("");
  const [transientResumeName, setTransientResumeName] = useState("");
  const [transientResumeRoleFamily, setTransientResumeRoleFamily] = useState("");
  const [transientResumeContent, setTransientResumeContent] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [currentRun, setCurrentRun] = useState(initialRun);

  const availableResumes = useMemo(() => resumeVariants || [], [resumeVariants]);

  function toggleResume(resumeId) {
    setSelectedResumeIds((current) =>
      current.includes(resumeId) ? current.filter((id) => id !== resumeId) : [...current, resumeId]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeIds: selectedResumeIds,
        urls,
        analysisMode,
        transientResumeName,
        transientResumeRoleFamily,
        transientResumeContent
      })
    });

    const json = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(json.error || "Could not analyze those roles.");
      return;
    }

    setCurrentRun(json.run);
    setStatus("ready");
    setMessage("Analysis complete. Review the fit matrix and role summaries below.");
    router.refresh();
  }

  return (
    <div className="stack">
      <form className="card analysis-form" onSubmit={handleSubmit}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Workspace home</p>
            <h3>Choose resumes, paste role URLs, and decide what kind of analysis to run</h3>
            <p>Use your stored resumes, add a one-off resume if needed, and run ATS-only, HR-fit-only, or comprehensive analysis.</p>
          </div>
          <button className="button" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Analyzing..." : "Analyze Roles"}
          </button>
        </div>

        <div className="stack">
          <section className="card inner-card">
            <p className="eyebrow">Stored resumes</p>
            {availableResumes.length ? (
              <div className="checkbox-grid">
                {availableResumes.map((resume) => (
                  <label key={resume.id} className="checkbox-card">
                    <input
                      type="checkbox"
                      checked={selectedResumeIds.includes(resume.id)}
                      onChange={() => toggleResume(resume.id)}
                    />
                    <div>
                      <strong>{resume.name}</strong>
                      <p>{resume.roleFamily}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="stack-tight">
                <p>No resumes are stored yet. Create or refresh your workspace first.</p>
                <div className="action-row">
                  <Link href="/onboarding" className="button-secondary">
                    Add Resumes
                  </Link>
                  <Link href="/resumes" className="text-link">
                    Open Resume Manager
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section className="card inner-card">
            <p className="eyebrow">Analysis mode</p>
            <div className="checkbox-grid mode-grid">
              {[
                { value: "ats", title: "ATS only", detail: "Focus on keyword and concept overlap." },
                { value: "hr", title: "HR fit only", detail: "Focus on recruiter-style fit and narrative alignment." },
                { value: "comprehensive", title: "Comprehensive", detail: "Return ATS, HR fit, and the broadest recommendation set." }
              ].map((mode) => (
                <label key={mode.value} className="checkbox-card">
                  <input
                    type="radio"
                    name="analysisMode"
                    checked={analysisMode === mode.value}
                    onChange={() => setAnalysisMode(mode.value)}
                  />
                  <div>
                    <strong>{mode.title}</strong>
                    <p>{mode.detail}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="card inner-card">
            <p className="eyebrow">Role URLs</p>
            <label className="field field-full">
              <span>Paste one or many job URLs</span>
              <textarea
                rows="6"
                value={urls}
                onChange={(event) => setUrls(event.target.value)}
                placeholder="https://jobs.example.com/role-one&#10;https://jobs.example.com/role-two"
              />
            </label>
          </section>

          <section className="card inner-card">
            <p className="eyebrow">Optional new resume</p>
            <div className="field-grid">
              <label className="field">
                <span>Resume name</span>
                <input value={transientResumeName} onChange={(event) => setTransientResumeName(event.target.value)} />
              </label>
              <label className="field">
                <span>Role family</span>
                <input
                  value={transientResumeRoleFamily}
                  onChange={(event) => setTransientResumeRoleFamily(event.target.value)}
                  placeholder="Program Management"
                />
              </label>
              <label className="field field-full">
                <span>Paste another resume for this run only</span>
                <textarea
                  rows="8"
                  value={transientResumeContent}
                  onChange={(event) => setTransientResumeContent(event.target.value)}
                  placeholder="Paste a different resume here if you want to compare it without changing your stored resume list."
                />
              </label>
            </div>
          </section>
        </div>

        {message ? (
          <p className={status === "error" ? "error-text" : "success-text"}>{message}</p>
        ) : null}
      </form>

      {currentRun ? <AnalysisRunView run={currentRun} /> : null}

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">History</p>
            <h3>Last 10 analysis runs</h3>
          </div>
          <Link href="/history" className="text-link">
            View all
          </Link>
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
              {history.map((item) => (
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
    </div>
  );
}
