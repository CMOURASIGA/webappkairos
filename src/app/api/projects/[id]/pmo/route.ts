import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  type: z.enum(["task", "decision", "risk"]), action: z.enum(["create", "update", "delete"]).default("create"), id: z.string().uuid().optional(),
  titulo: z.string().min(3).optional(), descricao: z.string().optional().nullable(),
  status: z.string().optional(), prioridade: z.string().optional(), responsavel: z.string().optional().nullable(), prazo: z.string().optional().nullable(),
  impacto: z.string().optional(), probabilidade: z.string().optional(), mitigacao: z.string().optional().nullable(),
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await context.params;
    const body = schema.parse(await request.json());
    const user = await getAuthenticatedUser(); const profile = await ensureProfile(user); const admin = getSupabaseAdminClient();
    const table = body.type === "task" ? "tasks" : body.type === "decision" ? "decisions" : "risks";
    const { action, id, ...payload } = body;
    delete (payload as { type?: string }).type;
    if (action === "delete") {
      if (!id) throw new Error("Identificador obrigatorio.");
      const { error } = await admin.from(table).delete().eq("id", id).eq("profile_id", profile.id).eq("project_id", projectId);
      if (error) throw error;
      return NextResponse.json({ deleted: true });
    }
    if (action === "update") {
      if (!id) throw new Error("Identificador obrigatorio.");
      const updatePayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
      const timestamped = table === "decisions" ? updatePayload : { ...updatePayload, updated_at: new Date().toISOString() };
      const { data, error } = await admin.from(table).update(timestamped).eq("id", id).eq("profile_id", profile.id).eq("project_id", projectId).select("*").single();
      if (error) throw error;
      return NextResponse.json({ data });
    }
    if (!body.titulo) throw new Error("Informe o título para criar o registro.");
    const { data, error } = await admin.from(table).insert({ ...payload, profile_id: profile.id, project_id: projectId }).select("*").single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao salvar item." }, { status: 400 }); }
}
