import { NextRequest, NextResponse } from "next/server";

import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { createOrUpdateEntity } from "@/services/data";
import { instructionSchema } from "@/services/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = instructionSchema.parse(await request.json());
    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    const data = await createOrUpdateEntity("instructions", payload, profile.id);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao salvar orientacao." },
      { status: 400 },
    );
  }
}
