"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function JobActions({ jobId, allowPromote = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");

  async function call(endpoint, options) {
    const response = await fetch(endpoint, options);
    const json = await response.json();
    setMessage(json.error || json.title || "Updated.");
    router.refresh();
  }

  async function update(action) {
    setLoading(action);
    await call(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    setLoading("");
  }

  async function generate(kind) {
    setLoading(kind);
    await call(`/api/jobs/${jobId}/${kind}`, { method: "POST" });
    setLoading("");
  }

  return (
    <div className="action-stack">
      <div className="action-row">
        <button className="button" onClick={() => generate("tailor-resume")} disabled={Boolean(loading)}>
          {loading === "tailor-resume" ? "Creating..." : "Tailor Resume"}
        </button>
        <button className="button-secondary" onClick={() => generate("cover-letter")} disabled={Boolean(loading)}>
          {loading === "cover-letter" ? "Drafting..." : "Generate Cover Letter"}
        </button>
      </div>
      <div className="action-row">
        <button className="button-ghost" onClick={() => update("apply")} disabled={Boolean(loading)}>
          Mark Applied
        </button>
        <button className="button-ghost" onClick={() => update("archive")} disabled={Boolean(loading)}>
          Archive
        </button>
        {allowPromote ? (
          <button className="button-ghost" onClick={() => update("promote")} disabled={Boolean(loading)}>
            Move to Pipeline
          </button>
        ) : null}
      </div>
      {message ? <p className="muted-text action-message">{message}</p> : null}
    </div>
  );
}
