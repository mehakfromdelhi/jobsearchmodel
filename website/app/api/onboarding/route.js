import { getViewer } from "@/lib/auth";
import { saveOnboarding } from "@/lib/workspace";

export async function POST(request) {
  const { user, demoMode } = await getViewer();
  const body = await request.json();

  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await saveOnboarding(user, body);
  if (!result.ok) {
    return Response.json(result, { status: 400 });
  }
  return Response.json({ ok: true, demoMode, ...result });
}
