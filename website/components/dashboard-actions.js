"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DashboardActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function runScan() {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/scan", { method: "POST" });
    const json = await response.json();
    setLoading(false);
    setMessage(json.error || (json.demoMode ? "Demo scan completed." : `Scan completed. ${json.inserted || 0} jobs updated.`));
    router.refresh();
  }

  return (
    <div className="action-stack">
      <div className="action-row">
        <button className="button" onClick={runScan} disabled={loading}>
          {loading ? "Running..." : "Run Scan"}
        </button>
        <button className="button-ghost" onClick={() => router.refresh()}>
          Refresh
        </button>
      </div>
      {message ? <p className="muted-text action-message">{message}</p> : null}
    </div>
  );
}
