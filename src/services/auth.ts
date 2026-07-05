import { User } from "@supabase/supabase-js";
import { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Profile } from "@/types/domain";

function normalizeDbError(error: PostgrestError | Error | null) {
  if (!error) {
    return "Erro desconhecido ao acessar o Supabase.";
  }

  if ("message" in error) {
    return error.message;
  }

  return "Erro desconhecido ao acessar o Supabase.";
}

export async function getAuthenticatedUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Usuario nao autenticado.");
  }

  return user;
}

export async function ensureProfile(user: User): Promise<Profile> {
  const admin = getSupabaseAdminClient();
  const email = user.email ?? `${user.id}@kairos.local`;
  const payload = {
    auth_user_id: user.id,
    nome:
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      email.split("@")[0] ||
      "Christian Moura",
    email,
    avatar_url: user.user_metadata?.avatar_url ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: existingError } = await admin
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(normalizeDbError(existingError));
  }

  if (existing) {
    return existing as Profile;
  }

  const { data: existingByEmail, error: emailLookupError } = await admin
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (emailLookupError) {
    throw new Error(normalizeDbError(emailLookupError));
  }

  if (existingByEmail) {
    const { data: updated, error: updateError } = await admin
      .from("profiles")
      .update(payload)
      .eq("id", existingByEmail.id)
      .select("*")
      .single();

    if (updateError) {
      throw new Error(normalizeDbError(updateError));
    }

    return updated as Profile;
  }

  const { data, error } = await admin.from("profiles").insert(payload).select("*").single();

  if (error) {
    if (error.code === "23505") {
      const { data: retryByAuthUser, error: retryAuthError } = await admin
        .from("profiles")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (retryAuthError) {
        throw new Error(normalizeDbError(retryAuthError));
      }

      if (retryByAuthUser) {
        return retryByAuthUser as Profile;
      }

      const { data: retryByEmail, error: retryEmailError } = await admin
        .from("profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (retryEmailError) {
        throw new Error(normalizeDbError(retryEmailError));
      }

      if (retryByEmail) {
        return retryByEmail as Profile;
      }
    }

    throw new Error(normalizeDbError(error));
  }

  return data as Profile;
}
