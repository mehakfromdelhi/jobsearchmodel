"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasSupabase } from "@/lib/env";

let browserClient;

export function getSupabaseBrowserClient() {
  if (!hasSupabase()) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return browserClient;
}
