import { NextRequest, NextResponse } from "next/server";

import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { updateAgentSettings } from "@/services/data";
import { settingsSchema } from "@/services/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = settingsSchema.parse(await request.json());
    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    const data = await updateAgentSettings(profile.id, payload);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao salvar configuracoes." },
      { status: 400 },
    );
  }
}
