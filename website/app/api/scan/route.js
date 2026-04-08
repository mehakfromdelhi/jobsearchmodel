import { jobs } from "@/lib/mock-data";

export async function POST() {
  return Response.json({
    ok: true,
    summary: {
      livePipeline: jobs.filter((job) => job.workflowState === "live_pipeline").length,
      reviewQueue: jobs.filter((job) => job.workflowState === "review_queue").length
    },
    jobs,
    message: "Prototype scan response. Replace with server-side ATS discovery, ranking, and freshness verification."
  });
}
