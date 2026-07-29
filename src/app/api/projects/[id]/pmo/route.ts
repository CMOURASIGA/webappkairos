import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  type: z.enum(["task", "decision", "risk"]),
  titulo: z.string().min(3), descricao: z.string().optional().nullable(),
  status: z.string().optional(), prioridade: z.string().optional(), responsavel: z.string().optional().nullable(), prazo: z.string().optional().nullable(),
  impacto: z.string().optional(), probabilidade: z.string().optional(), mitigacao: z.string().optional().nullable(),
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await context.params;
    const body = schema.parse(await request.json());
    const user = await getAuthenticatedUser(); const profile = await ensureProfile(user); const admin = getSupabaseAdminClient();
    const table = body.type === "task" ? "tasks" : body.type === "decision" ? "decisions" : "risks";
    const { type: _type, ...payload } = body;
    const { data, error } = await admin.from(table).insert({ ...payload, profile_id: profile.id, project_id: projectId }).select("*").single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao salvar item." }, { status: 400 }); }
}
