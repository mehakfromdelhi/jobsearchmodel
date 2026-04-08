import { AppShell } from "@/components/app-shell";

export default function SettingsPage() {
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
              <input defaultValue="Mehak Demo User" />
            </label>
            <label className="field">
              <span>Location</span>
              <input defaultValue="San Francisco, CA" />
            </label>
            <label className="field field-full">
              <span>Target functions</span>
              <textarea defaultValue="Strategy & Operations, GTM / Revenue Operations, Program Management, Strategic Finance" rows="3" />
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
            <h3>Exports, not source of truth</h3>
            <p>Website dashboard is primary. Google Sheets and Notion are optional published views.</p>
            <div className="stack">
              <button className="button">Connect Google Sheets</button>
              <button className="button-secondary">Connect Notion</button>
            </div>
          </div>

          <div className="card">
            <p className="eyebrow">Coming next</p>
            <h3>Post-v1 enhancements</h3>
            <ul className="clean-list">
              <li>Recurring scan schedules</li>
              <li>Notification preferences</li>
              <li>OAuth-based dashboard connections</li>
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
