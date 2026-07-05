import { createClient } from "@supabase/supabase-js";

import { env, hasSupabaseAdmin } from "@/lib/env";

let adminClient: ReturnType<typeof createClient<any>> | null = null;

export function getSupabaseAdminClient(): any {
  if (!hasSupabaseAdmin) {
    throw new Error(
      "Supabase service role key is missing. Configure SUPABASE_SERVICE_ROLE_KEY or supabasesecret.",
    );
  }

  if (!adminClient) {
    adminClient = createClient<any>(
      env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }

  return adminClient;
}
