import { getViewer } from "@/lib/auth";
import { runManualScan } from "@/lib/workspace";

export async function POST() {
  const { user } = await getViewer();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await runManualScan(user);
  if (!result.ok) {
    return Response.json(result, { status: 429 });
  }

  return Response.json(result);
}
