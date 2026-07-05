import { NextResponse } from "next/server";

import { ensureProfile, getAuthenticatedUser } from "@/services/auth";

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha no bootstrap do perfil." },
      { status: 400 },
    );
  }
}
