import { getViewer } from "@/lib/auth";
import { runRoleAnalysis } from "@/lib/workspace";

export async function POST(request) {
  const { user } = await getViewer();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const result = await runRoleAnalysis(user, body);
  if (!result.ok) {
    return Response.json(result, { status: 400 });
  }

  return Response.json(result);
}
