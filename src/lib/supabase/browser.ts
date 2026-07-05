"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient<any>> | null = null;

export function getSupabaseBrowserClient(): any {
  if (!browserClient) {
    browserClient = createBrowserClient<any>(
      env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    );
  }

  return browserClient;
}
