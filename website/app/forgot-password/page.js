import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="site-shell hero-shell">
      <div className="hero-card hero-grid">
        <section>
          <p className="eyebrow">Password reset</p>
          <h2>Reset your password</h2>
          <p className="lede">
            Enter your account email and the website will send you a password-reset email so you can choose a new password.
          </p>
          <div className="hero-actions">
            <Link href="/sign-in" className="button-secondary">
              Back to sign in
            </Link>
          </div>
        </section>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
