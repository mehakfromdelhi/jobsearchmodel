"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
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

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setState("error");
      setMessage(error.message || "Could not update password.");
      return;
    }

    setState("success");
    setMessage("Password updated. Redirecting to sign in...");
    setTimeout(() => {
      router.push("/sign-in");
      router.refresh();
    }, 900);
  }

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <p className="eyebrow">Reset password</p>
      <h3>Choose a new password</h3>
      <p>Set a new password for your account, then sign in normally.</p>
      <label className="field">
        <span>New password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a new password"
          required
        />
      </label>
      <button type="submit" className="button" disabled={state === "loading"}>
        {state === "loading" ? "Saving..." : "Update password"}
      </button>
      {state === "success" ? <p className="success-text">{message}</p> : null}
      {state === "error" ? <p className="error-text">{message}</p> : null}
    </form>
  );
}
