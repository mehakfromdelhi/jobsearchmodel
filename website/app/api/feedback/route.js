import { getViewer } from "@/lib/auth";
import { saveFeedback } from "@/lib/workspace";

export async function POST(request) {
  const { user } = await getViewer();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const message = String(body?.message || "").trim();
  if (!message) {
    return Response.json({ error: "Feedback message is required." }, { status: 400 });
  }

  const result = await saveFeedback(user, message, body?.context);
  return Response.json(result);
}
