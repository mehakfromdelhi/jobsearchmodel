import { AppShell } from "@/components/app-shell";
import { FeedbackForm } from "@/components/feedback-form";
import { getViewer } from "@/lib/auth";
import { getWorkspaceData } from "@/lib/workspace";

export default async function SettingsPage() {
  const { user, demoMode } = await getViewer({ requireAuth: false });
  const workspace = await getWorkspaceData(user, demoMode);

  return (
    <AppShell
      title="Settings & Integrations"
      subtitle="Profile, matching preferences, preferred locations, and dashboard publishing live here."
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
            <p className="eyebrow">Dashboard sync</p>
            <h3>Personal dashboard first</h3>
            <p>This beta skips Google Sheets and Notion so the website itself stays the primary recruiting workspace.</p>
            <div className="stack">
              <button className="button" disabled>Google Sheets deferred</button>
              <button className="button-secondary" disabled>Notion deferred</button>
            </div>
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
