import { NextResponse } from "next/server";

import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { reprocessDocument } from "@/services/documents";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    await reprocessDocument(profile.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao reprocessar documento." },
      { status: 400 },
    );
  }
}
