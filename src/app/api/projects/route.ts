import { NextRequest, NextResponse } from "next/server";

import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { createOrUpdateEntity } from "@/services/data";
import { projectSchema } from "@/services/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = projectSchema.parse(await request.json());
    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    const data = await createOrUpdateEntity("projects", payload, profile.id);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao salvar projeto." },
      { status: 400 },
    );
  }
}
