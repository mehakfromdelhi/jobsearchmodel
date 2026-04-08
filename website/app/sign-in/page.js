import Link from "next/link";
import { redirect } from "next/navigation";
import { MagicLinkForm } from "@/components/magic-link-form";
import { getViewer } from "@/lib/auth";
import { getWorkspaceData } from "@/lib/workspace";

export default async function SignInPage() {
  const { user, demoMode } = await getViewer({ requireAuth: false });
  const workspace = await getWorkspaceData(user, demoMode);

  if (!demoMode && user) {
    redirect(workspace.profileComplete ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="site-shell hero-shell">
      <div className="hero-card hero-grid">
        <section>
          <p className="eyebrow">Auth flow</p>
          <h2>Magic-link sign in for private recruiting workspaces</h2>
          <p className="lede">
            Each user enters an email, receives a unique one-time link, and lands inside their own recruiting workspace.
            First-time users go to onboarding. Returning users go to the dashboard.
          </p>
          <div className="hero-actions">
            <Link href="/onboarding" className="button-secondary">
              Preview onboarding
            </Link>
            <Link href="/dashboard" className="button-ghost">
              Preview dashboard
            </Link>
          </div>
        </section>
        <MagicLinkForm />
      </div>
    </div>
  );
}
