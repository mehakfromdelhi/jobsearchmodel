import { getViewer } from "@/lib/auth";
import { createCoverLetter } from "@/lib/workspace";

export async function POST(_request, { params }) {
  const { user } = await getViewer();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { jobId } = await params;
  const result = await createCoverLetter(user, jobId);

  if (!result.ok) {
    return Response.json(result, { status: 400 });
  }

  return Response.json(result);
}
