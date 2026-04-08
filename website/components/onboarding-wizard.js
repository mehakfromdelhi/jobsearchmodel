"use client";

import { useMemo, useState } from "react";

const stepDefinitions = [
  { key: "profile", title: "Basic info" },
  { key: "targets", title: "Target roles" },
  { key: "preferences", title: "Preferences" },
  { key: "matching", title: "ATS matching" },
  { key: "resume", title: "Resume" },
  { key: "integrations", title: "Dashboard" }
];

export function OnboardingWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [email, setEmail] = useState("mehak@example.com");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "Mehak Bhatia",
    location: "San Francisco, CA",
    seniority: "MBA / Mid-Senior",
    targetFunctions: "Strategy & Operations, GTM / Revenue Operations, Program Management",
    preferredLocations: "San Francisco, New York",
    includeRemote: "Yes",
    industries: "B2B SaaS, Healthtech, Fintech",
    companies: "Together AI, SmithRx, Notion",
    positiveKeywords: "strategy, operations, business operations, strategic finance, enablement",
    negativeKeywords: "intern, junior, software engineer",
    conceptMatches: "business planning, KPI ownership, stakeholder management, execution cadence",
    resume: "Paste resume text or upload a file in the production implementation.",
    dashboardPreference: "Google Sheets"
  });

  const currentStep = stepDefinitions[stepIndex];
  const progress = useMemo(() => `${stepIndex + 1} / ${stepDefinitions.length}`, [stepIndex]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function nextStep() {
    setStepIndex((value) => Math.min(value + 1, stepDefinitions.length - 1));
  }

  function prevStep() {
    setStepIndex((value) => Math.max(value - 1, 0));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="wizard-layout">
      <div className="wizard-rail card">
        <p className="eyebrow">Onboarding</p>
        <h3>Set up your recruiting workspace</h3>
        <p>Short, browser-native onboarding replacing manual YAML edits.</p>
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
          </div>
        ) : null}

        {currentStep.key === "preferences" ? (
          <div className="field-grid">
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

        {currentStep.key === "resume" ? (
          <div className="field-grid">
            <label className="field field-full">
              <span>Resume paste or upload</span>
              <textarea name="resume" rows="8" value={form.resume} onChange={updateField} />
            </label>
          </div>
        ) : null}

        {currentStep.key === "integrations" ? (
          <div className="field-grid">
            <label className="field">
              <span>Dashboard preference</span>
              <input name="dashboardPreference" value={form.dashboardPreference} onChange={updateField} />
            </label>
            <div className="card tinted-card">
              <p className="eyebrow">Output</p>
              <h4>On submit, create:</h4>
              <ul>
                <li>User profile</li>
                <li>Matching preferences</li>
                <li>Base resume</li>
                <li>Starter search config</li>
              </ul>
            </div>
          </div>
        ) : null}

        <div className="wizard-footer">
          <button type="button" className="button button-secondary" onClick={prevStep} disabled={stepIndex === 0}>
            Back
          </button>
          <div className="wizard-actions">
            {stepIndex < stepDefinitions.length - 1 ? (
              <button type="button" className="button" onClick={nextStep}>
                Next step
              </button>
            ) : (
              <button type="submit" className="button">
                Create workspace
              </button>
            )}
          </div>
        </div>

        {submitted ? (
          <div className="success-banner">
            <strong>Workspace created.</strong> In the production build this would persist the profile, resume, and preferences, then route the user to the dashboard.
          </div>
        ) : null}
      </form>
    </div>
  );
}
