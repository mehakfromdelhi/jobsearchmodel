import { createClient } from "@supabase/supabase-js";
import { hasDatabase, hasSupabase, isInviteAllowed } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export async function POST(request) {
  const body = await request.json();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const name = String(body?.name || "").trim();

  if (!email || !email.includes("@")) {
    return Response.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (!password || password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
  }

  if (!isInviteAllowed(email)) {
    return Response.json({ error: "This beta is invite-only right now." }, { status: 403 });
  }

  if (!hasSupabase() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "Supabase is not configured for sign-up." }, { status: 500 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: name
    }
  });

  if (error) {
    return Response.json({ error: error.message || "Could not create account." }, { status: 400 });
  }

  if (hasDatabase()) {
    const prisma = await getPrisma();
    await prisma.user.upsert({
      where: { email },
      update: {
        name: name || email,
        betaAccessGranted: true,
        emailVerifiedAt: new Date()
      },
      create: {
        email,
        name: name || email,
        betaAccessGranted: true,
        emailVerifiedAt: new Date()
      }
    });
  }

  return Response.json({
    ok: true,
    userId: data.user?.id || null
  });
}
