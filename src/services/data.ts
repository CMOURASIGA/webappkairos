import { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  AgentExecution,
  AgentProfile,
  AgentSettings,
  Conversation,
  DocumentRecord,
  Instruction,
  Memory,
  Message,
  Profile,
  Project,
} from "@/types/domain";

type EntityTable = "instructions" | "memories" | "projects" | "agents";

function normalizeError(error: PostgrestError | Error | null) {
  if (!error) {
    return null;
  }

  if ("message" in error) {
    return error.message;
  }

  return "Falha inesperada ao acessar o Supabase.";
}

async function selectByProfile<T>(
  table: string,
  profileId: string,
  orderColumn = "updated_at",
) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from(table)
    .select("*")
    .eq("profile_id", profileId)
    .order(orderColumn, { ascending: false });

  if (error) {
    throw new Error(normalizeError(error) ?? "Erro desconhecido");
  }

  return (data ?? []) as T[];
}

export async function getDashboardBundle(profile: Profile) {
  const [conversations, memories, instructions, documents, projects, agents, executions] =
    await Promise.all([
      getConversations(profile.id),
      getMemories(profile.id),
      getInstructions(profile.id),
      getDocuments(profile.id),
      getProjects(profile.id),
      getAgents(profile.id),
      getAgentExecutions(profile.id),
    ]);

  return {
    conversations,
    memories,
    instructions,
    documents,
    projects,
    agents,
    executions,
  };
}

export async function getConversations(profileId: string) {
  return selectByProfile<Conversation>("conversations", profileId);
}

export async function getConversation(profileId: string, conversationId: string) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(normalizeError(error) ?? "Erro desconhecido");
  }

  return (data as Conversation | null) ?? null;
}

export async function getConversationMessages(conversationId: string) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(normalizeError(error) ?? "Erro desconhecido");
  }

  return (data ?? []) as Message[];
}

export async function getInstructions(profileId: string) {
  return selectByProfile<Instruction>("instructions", profileId);
}

export async function getMemories(profileId: string) {
  return selectByProfile<Memory>("memories", profileId);
}

export async function getDocuments(profileId: string) {
  return selectByProfile<DocumentRecord>("documents", profileId, "created_at");
}

export async function getProjects(profileId: string) {
  return selectByProfile<Project>("projects", profileId);
}

export async function getAgents(profileId: string) {
  return selectByProfile<AgentProfile>("agents", profileId);
}

export async function getAgentSettings(profileId: string) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("agent_settings")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(normalizeError(error) ?? "Erro desconhecido");
  }

  if (data) {
    return data as AgentSettings;
  }

  const { data: created, error: createdError } = await admin
    .from("agent_settings")
    .insert({
      profile_id: profileId,
      nome_agente: "KAIROS",
      personalidade: "Clara, objetiva, analitica e estrategica.",
      modelo_chat: "gpt-5",
      modelo_embedding: "text-embedding-3-large",
      temperatura: 0.3,
      max_tokens: 4000,
      ativo: true,
      memoria_ativa: true,
      retencao_dias: 90,
      especialistas_ativos: [],
    })
    .select("*")
    .single();

  if (createdError) {
    throw new Error(normalizeError(createdError) ?? "Erro desconhecido");
  }

  return created as AgentSettings;
}

export async function getAgentExecutions(profileId: string) {
  return selectByProfile<AgentExecution>("agent_executions", profileId, "created_at");
}

export async function createOrUpdateEntity(
  table: EntityTable,
  payload: Record<string, unknown>,
  profileId: string,
) {
  const admin = getSupabaseAdminClient();
  const entity = { ...payload, profile_id: profileId };
  const isUpdate = Boolean(payload.id);

  const query = isUpdate
    ? admin.from(table).update(entity).eq("id", payload.id as string).eq("profile_id", profileId)
    : admin.from(table).insert(entity);

  const { data, error } = await query.select("*").single();

  if (error) {
    throw new Error(normalizeError(error) ?? "Erro desconhecido");
  }

  return data;
}

export async function deleteEntity(table: EntityTable, id: string, profileId: string) {
  const admin = getSupabaseAdminClient();
  const { error } = await admin.from(table).delete().eq("id", id).eq("profile_id", profileId);

  if (error) {
    throw new Error(normalizeError(error) ?? "Erro desconhecido");
  }
}

export async function updateAgentSettings(
  profileId: string,
  payload: Partial<AgentSettings>,
) {
  const current = await getAgentSettings(profileId);
  const admin = getSupabaseAdminClient();

  const { data, error } = await admin
    .from("agent_settings")
    .update(payload)
    .eq("id", current.id)
    .eq("profile_id", profileId)
    .select("*")
    .single();

  if (error) {
    throw new Error(normalizeError(error) ?? "Erro desconhecido");
  }

  return data as AgentSettings;
}

export async function updateConversation(
  profileId: string,
  conversationId: string,
  payload: Partial<Conversation>,
) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("conversations")
    .update(payload)
    .eq("id", conversationId)
    .eq("profile_id", profileId)
    .select("*")
    .single();

  if (error) {
    throw new Error(normalizeError(error) ?? "Erro desconhecido");
  }

  return data as Conversation;
}

export async function deleteConversation(profileId: string, conversationId: string) {
  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("profile_id", profileId);

  if (error) {
    throw new Error(normalizeError(error) ?? "Erro desconhecido");
  }
}
