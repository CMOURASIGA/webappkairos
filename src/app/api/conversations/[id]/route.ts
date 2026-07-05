import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { deleteConversation, updateConversation } from "@/services/data";

const schema = z.object({
  titulo: z.string().min(1),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    const data = await updateConversation(profile.id, id, body);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao renomear conversa." },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    await deleteConversation(profile.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao excluir conversa." },
      { status: 400 },
    );
  }
}
