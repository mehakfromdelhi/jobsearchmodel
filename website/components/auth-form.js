"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthForm({ mode = "sign-in" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");

  const isSignUp = mode === "sign-up";

  async function handleSubmit(event) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setState("error");
        setMessage("Supabase is not configured.");
        return;
      }

      if (isSignUp) {
        const signupResponse = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name })
        });

        let signupJson = {};
        try {
          signupJson = await signupResponse.json();
        } catch {
          signupJson = {};
        }

        if (!signupResponse.ok) {
          setState("error");
          setMessage(signupJson.error || "Could not create the account.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        });

        if (error) {
          setState("error");
          setMessage(error.message || "Could not create the account.");
          return;
        }

        if (data.session) {
          setState("success");
          setMessage("Account created. Redirecting...");
          router.push("/dashboard");
          router.refresh();
          return;
        }

        setState("success");
        setMessage("Account created. If email confirmation is enabled in Supabase, confirm your email first, then sign in.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setState("error");
        setMessage(error.message || "Could not sign in.");
        return;
      }

      setState("success");
      setMessage("Signed in. Redirecting...");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error?.message || "Something went wrong while contacting Supabase.");
    }
  }

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <p className="eyebrow">{isSignUp ? "Create account" : "Sign in"}</p>
      <h3>{isSignUp ? "Create a normal account with email and password" : "Sign in with email and password"}</h3>
      <p>
        {isSignUp
          ? "Invite-listed beta users can create an account and start using the workspace immediately."
          : "Use the same email and password each time, like a normal website."}
      </p>
      {isSignUp ? (
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Mehak Bhatia" />
        </label>
      ) : null}
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
      <label className="field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
        />
      </label>
      <button type="submit" className="button" disabled={state === "loading"}>
        {state === "loading" ? "Working..." : isSignUp ? "Create account" : "Sign in"}
      </button>
      {state === "success" ? <p className="success-text">{message}</p> : null}
      {state === "error" ? <p className="error-text">{message}</p> : null}
      <div className="auth-links">
        {isSignUp ? (
          <Link href="/sign-in" className="text-link">
            Already have an account? Sign in
          </Link>
        ) : (
          <>
            <Link href="/sign-up" className="text-link">
              Create account
            </Link>
            <Link href="/forgot-password" className="text-link">
              Forgot password?
            </Link>
          </>
        )}
      </div>
    </form>
  );
}
