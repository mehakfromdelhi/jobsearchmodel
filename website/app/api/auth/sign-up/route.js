import { hasSupabase, isInviteAllowed } from "@/lib/env";

export async function POST(request) {
  const body = await request.json();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!email || !email.includes("@")) {
    return Response.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (!password || password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
  }

  if (!isInviteAllowed(email)) {
    return Response.json({ error: "This beta is invite-only right now." }, { status: 403 });
  }

  if (!hasSupabase()) {
    return Response.json({ error: "Supabase is not configured for sign-up." }, { status: 500 });
  }

  return Response.json({
    ok: true,
    email
  });
}
