import { redirect } from "next/navigation";
import { hasDatabase, hasSupabase } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { appUser } from "@/lib/mock-data";

export async function getViewer({ requireAuth = false } = {}) {
  if (!hasSupabase()) {
    return { user: appUser, demoMode: true };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user: authUser }
  } = await supabase.auth.getUser();

  if (!authUser) {
    if (requireAuth) redirect("/sign-in");
    return { user: null, demoMode: false };
  }

  if (!hasDatabase()) {
    return {
      user: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email
      },
      demoMode: false
    };
  }

  const prisma = await getPrisma();
  const dbUser = await prisma.user.upsert({
    where: { email: authUser.email },
    update: {
      name: authUser.user_metadata?.full_name || authUser.email,
      emailVerifiedAt: new Date(),
      betaAccessGranted: true
    },
    create: {
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.email,
      emailVerifiedAt: new Date(),
      betaAccessGranted: true
    }
  });

  return { user: dbUser, demoMode: false };
}
