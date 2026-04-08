import Link from "next/link";
import { dashboardStats } from "@/lib/mock-data";

const workflow = [
  "Sign in with a magic link",
  "Complete onboarding with resumes and ATS preferences",
  "Run a fresh scan across live ATS sources",
  "Review the Live Pipeline and Review Queue",
  "Tailor a resume and application materials for one role"
];

export default function LandingPage() {
  return (
    <div className="site-shell hero-shell">
      <div className="hero-card hero-grid">
        <section>
          <p className="eyebrow">Mehak's Job Search Model</p>
          <h1>Recruiting OS for business-role candidates.</h1>
          <p className="lede">
            A browser-native version of the workflow behind the repo: sign in, onboard, run scans, review a live
            pipeline, tailor resumes, and track applications in one place.
          </p>
          <div className="hero-actions">
            <Link href="/sign-in" className="button">
              Get started
            </Link>
            <Link href="/dashboard" className="button-secondary">
              See how it works
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
            The app keeps pipeline, review queue, and applications separate so users can focus on high-signal roles
            instead of messy spreadsheets and one-off docs.
          </p>
          <div className="hero-stats">
            {dashboardStats.map((stat) => (
              <div key={stat.label} className="stat-card card">
                <p className="eyebrow">{stat.label}</p>
                <strong>{stat.value}</strong>
                <p>{stat.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <p className="landing-footer muted-text">Prototype website scaffold added inside the existing repo so the product can evolve from repo-first to app-first.</p>
    </div>
  );
}
