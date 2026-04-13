import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getViewer } from "@/lib/auth";
import { getWorkspaceData } from "@/lib/workspace";

export default async function SignUpPage() {
  const { user, demoMode } = await getViewer({ requireAuth: false });
  const workspace = await getWorkspaceData(user, demoMode);

  if (!demoMode && user) {
    redirect(workspace.profileComplete ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="site-shell hero-shell">
      <div className="hero-card hero-grid">
        <section>
          <p className="eyebrow">Create account</p>
          <h2>Invite-only beta access with a standard password</h2>
          <p className="lede">
            If your email is included in the beta invite list, you can create an account here and start using the website without one-time login links.
          </p>
          <div className="hero-actions">
            <Link href="/sign-in" className="button-secondary">
              Already have an account?
            </Link>
          </div>
        </section>
        <AuthForm mode="sign-up" />
      </div>
    </div>
  );
}
