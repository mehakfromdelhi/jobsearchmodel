import { appUrl, hasDatabase, hasSupabase, isInviteAllowed } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export async function POST(request) {
  const body = await request.json();
  const email = String(body?.email || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return Response.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (!isInviteAllowed(email)) {
    return Response.json({ error: "This beta is invite-only right now." }, { status: 403 });
  }

  if (!hasSupabase()) {
    return Response.json({
      ok: true,
      email,
      demoMode: true,
      message: "Supabase env vars are not configured yet. In beta setup, this route will send a real magic link."
    });
  }

  if (hasDatabase()) {
    const prisma = await getPrisma();
    await prisma.user.upsert({
      where: { email },
      update: { betaAccessGranted: true },
      create: { email, betaAccessGranted: true }
    });
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/otp`, {
    method: "POST",
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      create_user: true,
      data: {
        betaAccessGranted: true
      },
      options: {
        emailRedirectTo: `${appUrl()}/auth/callback`
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return Response.json({ error: `Could not send magic link: ${errorText}` }, { status: 400 });
  }

  return Response.json({
    ok: true,
    email,
    message: "Magic link requested."
  });
}
