"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const stepDefinitions = [
  { key: "profile", title: "Basic info" },
  { key: "targets", title: "Target roles" },
  { key: "matching", title: "ATS matching" },
  { key: "resumes", title: "Resumes" }
];

function newResume(index) {
  return {
    name: `Resume ${index + 1}`,
    roleFamily: "General business roles",
    content: "",
    parseStatus: "idle",
    parseMessage: "",
    sourceFileName: ""
  };
}

function seedResume(index, values = {}) {
  return {
    ...newResume(index),
    ...values
  };
}

export function OnboardingWizard({ initialName = "", initialEmail = "" }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [email, setEmail] = useState(initialEmail);
  const [submitted, setSubmitted] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: initialName,
    location: "San Francisco, CA",
    seniority: "MBA / Mid-Senior",
    targetFunctions: "Strategy & Operations, GTM / Revenue Operations, Program Management, Strategic Finance",
    preferredLocations: "San Francisco, New York",
    includeRemote: "Yes",
    industries: "B2B SaaS, Healthtech, Fintech",
    companies: "Clay, Together AI, Notion",
    positiveKeywords: "strategy, operations, business operations, strategic finance, enablement, capacity planning",
    negativeKeywords: "intern, junior, software engineer",
    conceptMatches: "business planning, KPI ownership, stakeholder management, execution cadence, portfolio management"
  });
  const [resumes, setResumes] = useState([
    seedResume(0, {
      name: "Strategy Resume",
      roleFamily: "Strategy & Operations",
      content: ""
    })
  ]);

  const currentStep = stepDefinitions[stepIndex];
  const progress = useMemo(() => `${stepIndex + 1} / ${stepDefinitions.length}`, [stepIndex]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function updateResume(index, field, value) {
    setResumes((current) =>
      current.map((resume, resumeIndex) => (resumeIndex === index ? { ...resume, [field]: value } : resume))
    );
  }

  function addResume() {
    setResumes((current) => [...current, seedResume(current.length)]);
  }

  function removeResume(index) {
    setResumes((current) => current.filter((_, resumeIndex) => resumeIndex !== index));
  }

  function setResumeStatus(index, parseStatus, parseMessage = "", extra = {}) {
    setResumes((current) =>
      current.map((resume, resumeIndex) =>
        resumeIndex === index ? { ...resume, parseStatus, parseMessage, ...extra } : resume
      )
    );
  }

  async function importFile(index, file) {
    if (!file) return;
    setResumeStatus(index, "loading", `Parsing ${file.name}...`, { sourceFileName: file.name });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/resumes/parse", {
        method: "POST",
        body: formData
      });
      const json = await response.json();

      if (!response.ok) {
        setResumeStatus(index, "error", json.error || "Could not parse that resume file.");
        return;
      }

      updateResume(index, "content", json.parsedText || "");
      if (!resumes[index]?.name || resumes[index]?.name.startsWith("Resume")) {
        updateResume(index, "name", json.name || file.name.replace(/\.[^.]+$/, ""));
      }
      setResumeStatus(
        index,
        "success",
        json.warnings?.length
          ? `Parsed with ${json.warnings.length} warning${json.warnings.length === 1 ? "" : "s"}. Review the text below.`
          : "Parsed successfully. Review and edit the extracted text below."
      );
    } catch (error) {
      setResumeStatus(index, "error", error?.message || "Could not parse that resume file.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validResumes = resumes.filter((resume) => String(resume.content || "").trim());
    if (!validResumes.length) {
      setSubmitted(false);
      setSubmissionMessage("Add at least one pasted or parsed resume before creating the workspace.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage("");
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email,
          resumes: validResumes.map((resume) => ({
            name: resume.name,
            roleFamily: resume.roleFamily,
            content: resume.content
          }))
        })
      });

      let json = {};
      try {
        json = await response.json();
      } catch {
        json = {};
      }

      if (response.ok) {
        setSubmitted(true);
        setSubmissionMessage(
          json.demoMode
            ? "Demo workspace created."
            : `Workspace saved with ${json.resumesSaved || validResumes.length} resumes. Redirecting to Analyze Roles...`
        );
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 900);
        return;
      }

      setSubmitted(false);
      setSubmissionMessage(json.error || "Could not save onboarding.");
    } catch (error) {
      setSubmitted(false);
      setSubmissionMessage(error?.message || "Something went wrong while creating the workspace.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="wizard-layout">
      <div className="wizard-rail card">
        <p className="eyebrow">Onboarding</p>
        <h3>Set up your matching workspace</h3>
        <p>Upload or paste multiple resumes now so later analysis can compare them across several roles at once.</p>
        <div className="step-list">
          {stepDefinitions.map((step, index) => (
            <div key={step.key} className={`step-chip ${index === stepIndex ? "active" : ""}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <form className="card wizard-form" onSubmit={handleSubmit}>
        <div className="wizard-head">
          <div>
            <p className="eyebrow">Step {progress}</p>
            <h3>{currentStep.title}</h3>
          </div>
        </div>

        {currentStep.key === "profile" ? (
          <div className="field-grid">
            <label className="field">
              <span>Name</span>
              <input name="name" value={form.name} onChange={updateField} />
            </label>
            <label className="field">
              <span>Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="field">
              <span>Location</span>
              <input name="location" value={form.location} onChange={updateField} />
            </label>
            <label className="field">
              <span>Seniority</span>
              <input name="seniority" value={form.seniority} onChange={updateField} />
            </label>
          </div>
        ) : null}

        {currentStep.key === "targets" ? (
          <div className="field-grid">
            <label className="field field-full">
              <span>Target functions</span>
              <textarea name="targetFunctions" rows="4" value={form.targetFunctions} onChange={updateField} />
            </label>
            <label className="field">
              <span>Preferred locations</span>
              <input name="preferredLocations" value={form.preferredLocations} onChange={updateField} />
            </label>
            <label className="field">
              <span>Include remote</span>
              <input name="includeRemote" value={form.includeRemote} onChange={updateField} />
            </label>
            <label className="field">
              <span>Industries</span>
              <textarea name="industries" rows="4" value={form.industries} onChange={updateField} />
            </label>
            <label className="field">
              <span>Companies</span>
              <textarea name="companies" rows="4" value={form.companies} onChange={updateField} />
            </label>
          </div>
        ) : null}

        {currentStep.key === "matching" ? (
          <div className="field-grid">
            <label className="field field-full">
              <span>Positive keywords</span>
              <textarea name="positiveKeywords" rows="4" value={form.positiveKeywords} onChange={updateField} />
            </label>
            <label className="field">
              <span>Negative keywords</span>
              <textarea name="negativeKeywords" rows="4" value={form.negativeKeywords} onChange={updateField} />
            </label>
            <label className="field">
              <span>Concept matches</span>
              <textarea name="conceptMatches" rows="4" value={form.conceptMatches} onChange={updateField} />
            </label>
          </div>
        ) : null}

        {currentStep.key === "resumes" ? (
          <div className="stack">
            {resumes.map((resume, index) => (
              <div className="card inner-card" key={`${resume.name}-${index}`}>
                <div className="section-head">
                  <div>
                    <p className="eyebrow">Resume {index + 1}</p>
                    <h4>{resume.name || `Resume ${index + 1}`}</h4>
                  </div>
                  {resumes.length > 1 ? (
                    <button type="button" className="button-ghost" onClick={() => removeResume(index)}>
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="field-grid">
                  <label className="field">
                    <span>Name</span>
                    <input value={resume.name} onChange={(event) => updateResume(index, "name", event.target.value)} />
                  </label>
                  <label className="field">
                    <span>Role family</span>
                    <input
                      value={resume.roleFamily}
                      onChange={(event) => updateResume(index, "roleFamily", event.target.value)}
                    />
                  </label>
                  <label className="field field-full">
                    <span>Upload a .docx resume</span>
                    <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => importFile(index, event.target.files?.[0])} />
                  </label>
                  {resume.sourceFileName ? (
                    <p className={resume.parseStatus === "error" ? "error-text" : resume.parseStatus === "success" ? "success-text" : ""}>
                      {resume.parseMessage || `Uploaded ${resume.sourceFileName}`}
                    </p>
                  ) : resume.parseMessage ? (
                    <p className={resume.parseStatus === "error" ? "error-text" : resume.parseStatus === "success" ? "success-text" : ""}>
                      {resume.parseMessage}
                    </p>
                  ) : null}
                  <label className="field field-full">
                    <span>Paste or edit resume text</span>
                    <textarea
                      rows="8"
                      value={resume.content}
                      onChange={(event) => updateResume(index, "content", event.target.value)}
                      placeholder="Paste resume text here, or upload a .docx file and review the extracted text."
                    />
                  </label>
                </div>
              </div>
            ))}
            <button type="button" className="button-secondary" onClick={addResume}>
              Add another resume
            </button>
          </div>
        ) : null}

        <div className="wizard-footer">
          <button type="button" className="button button-secondary" onClick={() => setStepIndex((value) => Math.max(value - 1, 0))} disabled={stepIndex === 0}>
            Back
          </button>
          <div className="wizard-actions">
            {stepIndex < stepDefinitions.length - 1 ? (
              <button type="button" className="button" onClick={() => setStepIndex((value) => Math.min(value + 1, stepDefinitions.length - 1))}>
                Next step
              </button>
            ) : (
              <button type="submit" className="button" disabled={isSubmitting}>
                {isSubmitting ? "Creating workspace..." : "Create workspace"}
              </button>
            )}
          </div>
        </div>

        {submitted ? (
          <div className="success-banner">
            <strong>Workspace created.</strong> {submissionMessage}
          </div>
        ) : submissionMessage ? <div className="error-text">{submissionMessage}</div> : null}
      </form>
    </div>
  );
}
