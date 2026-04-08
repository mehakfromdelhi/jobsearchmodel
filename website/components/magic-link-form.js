"use client";

import { useState } from "react";

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");

  async function handleSubmit(event) {
    event.preventDefault();
    setState("loading");
    const response = await fetch("/api/auth/request-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });
    if (response.ok) {
      setState("sent");
      return;
    }
    setState("error");
  }

  return (
    <form className="card auth-card" onSubmit={handleSubmit}>
      <p className="eyebrow">Magic link sign in</p>
      <h3>Secure access without passwords</h3>
      <p>Each user gets a unique one-time link sent to their email. In v1 this is the only auth flow.</p>
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
        {state === "loading" ? "Sending..." : "Send magic link"}
      </button>
      {state === "sent" ? (
        <p className="success-text">Magic link requested. In production, the backend will email a unique temporary sign-in link to this address.</p>
      ) : null}
      {state === "error" ? <p className="error-text">Could not request a magic link. Check the auth backend wiring.</p> : null}
    </form>
  );
}
