"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResumeActivateButton({ resumeId, active }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function activate() {
    setLoading(true);
    await fetch(`/api/resumes/${resumeId}/activate`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button className="link-button" onClick={activate} disabled={loading || active}>
      {active ? "Active" : loading ? "Updating..." : "Set Active"}
    </button>
  );
}
