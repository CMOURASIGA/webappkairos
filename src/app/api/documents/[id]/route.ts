import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureProfile, getAuthenticatedUser } from "@/services/auth";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    const admin = getSupabaseAdminClient();

    await admin.from("document_chunks").delete().eq("document_id", id);
    await admin.from("documents").delete().eq("id", id).eq("profile_id", profile.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao excluir documento." },
      { status: 400 },
    );
  }
}
