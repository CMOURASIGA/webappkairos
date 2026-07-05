import { NextRequest, NextResponse } from "next/server";

import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { createOrUpdateEntity } from "@/services/data";
import { agentSchema } from "@/services/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = agentSchema.parse(await request.json());
    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    const data = await createOrUpdateEntity("agents", payload, profile.id);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao salvar especialista." },
      { status: 400 },
    );
  }
}
