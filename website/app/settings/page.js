import { AppShell } from "@/components/app-shell";
import { FeedbackForm } from "@/components/feedback-form";
import { getViewer } from "@/lib/auth";
import { getWorkspaceData } from "@/lib/workspace";

export default async function SettingsPage() {
  const { user, demoMode } = await getViewer({ requireAuth: true });
  const workspace = await getWorkspaceData(user, demoMode);

  return (
    <AppShell
      title="Settings & Integrations"
      subtitle="Profile, ATS matching preferences, and beta feedback live here."
      actions={<button className="button">Save changes</button>}
    >
      <div className="settings-grid">
        <section className="card">
          <p className="eyebrow">Profile</p>
          <h3>Business-role candidate settings</h3>
          <div className="field-grid">
            <label className="field">
              <span>Name</span>
              <input defaultValue={workspace.user.name || "Beta user"} />
            </label>
            <label className="field">
              <span>Location</span>
              <input defaultValue={workspace.user.location || "San Francisco, CA"} />
            </label>
            <label className="field field-full">
              <span>Target functions</span>
              <textarea defaultValue={workspace.user.targetFunctions?.join(", ") || "Strategy & Operations"} rows="3" />
            </label>
            <label className="field field-full">
              <span>Preferred locations</span>
              <textarea defaultValue="San Francisco, Bay Area, New York" rows="2" />
            </label>
          </div>
        </section>

        <section className="stack">
          <div className="card tinted-card">
            <p className="eyebrow">Current product scope</p>
            <h3>Analysis first, no dashboard queues</h3>
            <p>The website now focuses on multi-resume role matching, fit scorecards, and in-app resume revision instead of live pipeline management.</p>
          </div>

          <div className="card">
            <p className="eyebrow">Beta feedback</p>
            <h3>Capture what users tell you</h3>
            <FeedbackForm />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
