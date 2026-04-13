"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setState("error");
      setMessage("Supabase is not configured.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`
    });

    if (error) {
      setState("error");
      setMessage(error.message || "Could not send reset instructions.");
      return;
    }

    setState("success");
    setMessage("Reset instructions sent. Check your email for the password reset link.");
  }

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <p className="eyebrow">Forgot password</p>
      <h3>Send reset instructions</h3>
      <p>Use your account email and follow the reset link to choose a new password.</p>
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@school.edu"
          required
        />
      </label>
      <button type="submit" className="button" disabled={state === "loading"}>
        {state === "loading" ? "Sending..." : "Send reset email"}
      </button>
      {state === "success" ? <p className="success-text">{message}</p> : null}
      {state === "error" ? <p className="error-text">{message}</p> : null}
      <div className="auth-links">
        <Link href="/sign-in" className="text-link">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
