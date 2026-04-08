"use client";

import { useState } from "react";

export function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  async function submit(event) {
    event.preventDefault();
    setStatus("loading");
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, context: "beta-feedback" })
    });
    setStatus(response.ok ? "done" : "error");
    if (response.ok) setMessage("");
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label className="field">
        <span>Capture beta feedback</span>
        <textarea rows="5" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What worked, what felt confusing, and what should improve?" />
      </label>
      <button className="button" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Saving..." : "Save Feedback"}
      </button>
      {status === "done" ? <p className="success-text">Feedback saved.</p> : null}
      {status === "error" ? <p className="error-text">Could not save feedback yet.</p> : null}
    </form>
  );
}
