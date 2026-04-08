"use client";

import { useState } from "react";

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const [magicLink, setMagicLink] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setState("loading");
    setMagicLink("");
    const response = await fetch("/api/auth/request-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });
    if (response.ok) {
      const json = await response.json();
      setState("sent");
      setMessage(json.message || "Magic link requested.");
      setMagicLink(json.magicLink || "");
      return;
    }
    const json = await response.json();
    setMessage(json.error || "Could not request a magic link.");
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
      {state === "sent" ? <p className="success-text">{message}</p> : null}
      {magicLink ? (
        <p className="success-text">
          Beta fallback link:{" "}
          <a href={magicLink} target="_blank" rel="noreferrer">
            Open magic link
          </a>
        </p>
      ) : null}
      {state === "error" ? <p className="error-text">{message}</p> : null}
    </form>
  );
}
