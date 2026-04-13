import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { hasDatabase, hasSupabase } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") || "email";
  const next = url.searchParams.get("next") || (type === "recovery" ? "/reset-password" : "/dashboard");

  if (!hasSupabase() || (!code && !tokenHash)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const supabase = await getSupabaseServerClient();
  let data;
  let error;

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    data = result.data;
    error = result.error;
  } else {
    const result = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type
    });
    data = result.data;
    error = result.error;
  }

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/sign-in?error=auth_callback_failed", request.url));
  }

  if (type === "recovery") {
    return NextResponse.redirect(new URL("/reset-password", request.url));
  }

  if (hasDatabase()) {
    const prisma = await getPrisma();
    const dbUser = await prisma.user.upsert({
      where: { email: data.user.email },
      update: {
        name: data.user.user_metadata?.full_name || data.user.email,
        emailVerifiedAt: new Date()
      },
      create: {
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.email,
        emailVerifiedAt: new Date()
      }
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: dbUser.id }
    });

    const destination = profile?.onboardingCompletedAt ? next : "/onboarding";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
