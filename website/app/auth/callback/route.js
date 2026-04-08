import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { hasDatabase, hasSupabase } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (!hasSupabase() || !code) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/sign-in?error=auth_callback_failed", request.url));
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
