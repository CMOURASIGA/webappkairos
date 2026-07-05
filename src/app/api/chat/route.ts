import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { runAgent } from "@/services/agent";

const schema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
  channel: z.enum(["text", "voice"]).default("text"),
  transcript: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    const result = await runAgent({
      profile,
      message: body.message,
      conversationId: body.conversationId,
      channel: body.channel,
      transcript: body.transcript,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao processar chat." },
      { status: 400 },
    );
  }
}
