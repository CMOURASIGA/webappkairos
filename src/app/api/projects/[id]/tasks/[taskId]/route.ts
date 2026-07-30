import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  action: z.enum(["update", "add_label", "remove_label", "add_member", "remove_member", "add_checklist", "add_checklist_item", "toggle_checklist_item", "add_comment", "link_document"]),
  titulo: z.string().min(3).optional(), descricao: z.string().nullable().optional(), prioridade: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(), responsavel: z.string().nullable().optional(), prazo: z.string().nullable().optional(),
  labelId: z.string().uuid().optional(), labelName: z.string().min(1).max(80).optional(), color: z.string().max(20).optional(),
  memberId: z.string().uuid().optional(), memberName: z.string().min(1).max(120).optional(), role: z.string().max(40).optional(),
  checklistTitle: z.string().min(1).max(120).optional(), checklistId: z.string().uuid().optional(), itemId: z.string().uuid().optional(), content: z.string().min(1).max(1000).optional(), done: z.boolean().optional(), documentId: z.string().uuid().optional(),
});

async function detail(projectId: string, taskId: string, profileId: string) {
  const admin = getSupabaseAdminClient();
  const task = await admin.from("tasks").select("*").eq("id", taskId).eq("project_id", projectId).eq("profile_id", profileId).single();
  if (task.error) throw task.error;
  const [labels, members, lists, items, comments, attachments] = await Promise.all([
    admin.from("task_labels").select("*").eq("task_id", taskId).order("created_at"),
    admin.from("task_members").select("*").eq("task_id", taskId).order("created_at"),
    admin.from("task_checklists").select("*").eq("task_id", taskId).order("position"),
    admin.from("task_checklist_items").select("*").eq("task_id", taskId).order("position"),
    admin.from("task_comments").select("*").eq("task_id", taskId).order("created_at", { ascending: false }),
    admin.from("task_attachments").select("*, documents(id,nome_arquivo,mime_type,status)").eq("task_id", taskId).order("created_at", { ascending: false }),
  ]);
  return { task: task.data, labels: labels.data ?? [], members: members.data ?? [], checklists: lists.data ?? [], items: items.data ?? [], comments: comments.data ?? [], attachments: attachments.data ?? [] };
}

type SupabaseResult = { error: { message: string } | null; data?: unknown };

async function execute(query: PromiseLike<SupabaseResult>): Promise<SupabaseResult> {
  const result = await query;
  if (result.error) throw new Error(result.error.message);
  return result;
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string; taskId: string }> }) {
  try { const { id, taskId } = await context.params; const user = await getAuthenticatedUser(); const profile = await ensureProfile(user); return NextResponse.json({ data: await detail(id, taskId, profile.id) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível abrir o card." }, { status: 400 }); }
}
export async function POST(request: NextRequest, context: { params: Promise<{ id: string; taskId: string }> }) {
  try {
    const { id: projectId, taskId } = await context.params; const body = bodySchema.parse(await request.json()); const user = await getAuthenticatedUser(); const profile = await ensureProfile(user); const admin = getSupabaseAdminClient();
    const own = await admin.from("tasks").select("id").eq("id", taskId).eq("project_id", projectId).eq("profile_id", profile.id).single(); if (own.error) throw new Error("Atividade não encontrada neste projeto.");
    if (body.action === "update") { const values = Object.fromEntries(Object.entries({ titulo: body.titulo, descricao: body.descricao, prioridade: body.prioridade, responsavel: body.responsavel, prazo: body.prazo }).filter(([,v])=>v!==undefined)); await execute(admin.from("tasks").update({ ...values, updated_at: new Date().toISOString() }).eq("id", taskId)); }
    if (body.action === "add_label") await execute(admin.from("task_labels").insert({ task_id: taskId, name: body.labelName, color: body.color || "#0ea5e9" }));
    if (body.action === "remove_label") await execute(admin.from("task_labels").delete().eq("id", body.labelId).eq("task_id", taskId));
    if (body.action === "add_member") await execute(admin.from("task_members").upsert({ task_id: taskId, member_name: body.memberName, role: body.role || "responsavel" }, { onConflict: "task_id,member_name" }));
    if (body.action === "remove_member") await execute(admin.from("task_members").delete().eq("id", body.memberId).eq("task_id", taskId));
    if (body.action === "add_checklist") { const result = await execute(admin.from("task_checklists").insert({ task_id: taskId, title: body.checklistTitle || "Checklist" }).select("id").single()); if (!result.data) throw new Error("Não foi possível criar o checklist."); }
    if (body.action === "add_checklist_item") await execute(admin.from("task_checklist_items").insert({ task_id: taskId, checklist_id: body.checklistId || null, content: body.content, position: Date.now() }));
    if (body.action === "toggle_checklist_item") await execute(admin.from("task_checklist_items").update({ done: body.done, updated_at: new Date().toISOString() }).eq("id", body.itemId).eq("task_id", taskId));
    if (body.action === "add_comment") await execute(admin.from("task_comments").insert({ task_id: taskId, profile_id: profile.id, author_name: profile.nome, content: body.content }));
    if (body.action === "link_document") { const { data: doc } = await admin.from("documents").select("id,nome_arquivo,storage_path,mime_type,tamanho").eq("id", body.documentId).eq("project_id", projectId).eq("profile_id", profile.id).single(); if (!doc) throw new Error("Documento não pertence a este projeto."); await admin.from("task_attachments").upsert({ task_id: taskId, document_id: doc.id, file_name: doc.nome_arquivo, storage_path: doc.storage_path, mime_type: doc.mime_type, size_bytes: doc.tamanho }, { onConflict: "task_id,document_id" }); }
    await execute(admin.from("task_activity_log").insert({ task_id: taskId, profile_id: profile.id, action_type: body.action, action_detail: "Atualização realizada no card" }));
    return NextResponse.json({ data: await detail(projectId, taskId, profile.id) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível salvar o card." }, { status: 400 }); }
}
