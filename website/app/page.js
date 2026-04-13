import Link from "next/link";

const workflow = [
  "Sign in with a magic link",
  "Upload or paste multiple resumes",
  "Submit one or many job URLs",
  "Review ATS and HR-fit scorecards",
  "Revise the best-matching resume in-app"
];

const highlights = [
  { label: "Multi-resume", value: "Many", detail: "Compare several resume versions in one run" },
  { label: "Role input", value: "URLs", detail: "Bring live job links instead of a dashboard queue" },
  { label: "Fit view", value: "ATS + HR", detail: "See both screening and recruiter-fit signals" },
  { label: "Output", value: ".docx", detail: "Copy in-app or download a Word version" }
];

export default function LandingPage() {
  return (
    <div className="site-shell hero-shell">
      <div className="hero-card hero-grid">
        <section>
          <p className="eyebrow">Mehak&apos;s Job Search Model</p>
          <h1>Role matching for business-role candidates.</h1>
          <p className="lede">
            Bring multiple resumes and multiple job URLs into one workspace. The app extracts each JD, scores ATS and HR fit, and helps you decide which resume to use and how to revise it.
          </p>
          <div className="hero-actions">
            <Link href="/sign-in" className="button">
              Get started
            </Link>
            <Link href="/dashboard" className="button-secondary">
              Analyze roles
            </Link>
          </div>
          <ol className="workflow-list">
            {workflow.map((item, index) => (
              <li key={item}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item}</strong>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="showcase-card card">
          <p className="eyebrow">Built for</p>
          <h3>Strategy, Ops, GTM, Program Management, and Strategic Finance</h3>
          <p>
            Instead of a dashboard queue, the website now centers on direct role analysis: compare resume options,
            inspect fit gaps, and generate a revised resume draft only when you want it.
          </p>
          <div className="hero-stats">
            {highlights.map((stat) => (
              <div key={stat.label} className="stat-card card">
                <p className="eyebrow">{stat.label}</p>
                <strong>{stat.value}</strong>
                <p>{stat.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <p className="landing-footer muted-text">The website is now focused on fit analysis, resume recommendations, and in-app revised resume output rather than scan dashboards.</p>
    </div>
  );
}
