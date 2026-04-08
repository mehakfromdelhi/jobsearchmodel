import { OnboardingWizard } from "@/components/onboarding-wizard";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { getWorkspaceData } from "@/lib/workspace";

export default async function OnboardingPage() {
  const { user, demoMode } = await getViewer({ requireAuth: false });
  const workspace = await getWorkspaceData(user, demoMode);

  if (!demoMode && !user) {
    redirect("/sign-in");
  }

  if (!demoMode && user && workspace.profileComplete) {
    redirect("/dashboard");
  }

  return (
    <div className="site-shell hero-shell">
      <OnboardingWizard />
    </div>
  );
}
