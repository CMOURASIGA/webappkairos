import { NextResponse } from "next/server";

import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { deleteEntity } from "@/services/data";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    await deleteEntity("agents", id, profile.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao excluir especialista." },
      { status: 400 },
    );
  }
}
