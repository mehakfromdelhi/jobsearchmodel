import { getViewer } from "@/lib/auth";
import { activateResume } from "@/lib/workspace";

export async function POST(_request, { params }) {
  const { user } = await getViewer();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { resumeId } = await params;
  const result = await activateResume(user, resumeId);

  if (!result.ok) {
    return Response.json(result, { status: 400 });
  }

  return Response.json(result);
}
