import { getViewer } from "@/lib/auth";
import { updateJobState } from "@/lib/workspace";

export async function PATCH(request, { params }) {
  const { user } = await getViewer();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { jobId } = await params;
  const body = await request.json();
  const result = await updateJobState(user, jobId, body.action);

  if (!result.ok) {
    return Response.json(result, { status: 400 });
  }

  return Response.json(result);
}
