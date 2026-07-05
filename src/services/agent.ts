import { env, hasOpenAI } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { KAIROS_SYSTEM_PROMPT } from "@/prompts/kairos-system-prompt";
import { generateAgentResponse, createEmbedding } from "@/services/openai";
import { AgentSettings, Conversation, Instruction, Memory, Message, Profile } from "@/types/domain";

interface RunAgentInput {
  profile: Profile;
  message: string;
  conversationId?: string;
  channel?: "text" | "voice";
  transcript?: string;
}

interface RetrievedDocument {
  content: string;
  document_name: string;
  similarity?: number;
}

async function ensureConversation(profileId: string, conversationId?: string) {
  const admin = getSupabaseAdminClient();

  if (conversationId) {
    const { data } = await admin
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (data) {
      return data as Conversation;
    }
  }

  const title = messageToTitle("Nova conversa");
  const { data, error } = await admin
    .from("conversations")
    .insert({
      profile_id: profileId,
      titulo: title,
      status: "ACTIVE",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Conversation;
}

function messageToTitle(content: string) {
  return content.slice(0, 64);
}

async function getRelevantInstructions(profileId: string) {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("instructions")
    .select("*")
    .eq("profile_id", profileId)
    .eq("ativo", true)
    .order("prioridade", { ascending: false })
    .limit(6);

  return (data ?? []) as Instruction[];
}

async function getRelevantMemories(profileId: string) {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("memories")
    .select("*")
    .eq("profile_id", profileId)
    .eq("ativo", true)
    .order("importancia", { ascending: false })
    .limit(6);

  return (data ?? []) as Memory[];
}

async function getConversationHistory(conversationId: string) {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(12);

  return ((data ?? []) as Message[]).reverse();
}

async function getRelevantDocuments(profileId: string, message: string) {
  const admin = getSupabaseAdminClient();

  if (hasOpenAI) {
    const queryEmbedding = await createEmbedding(message);

    if (queryEmbedding) {
      const { data } = await admin.rpc("match_document_chunks", {
        query_embedding: queryEmbedding,
        match_count: env.TOP_K_RESULTS,
        p_profile_id: profileId,
      });

      return (data ?? []) as RetrievedDocument[];
    }
  }

  const { data } = await admin
    .from("documents")
    .select("id, nome_arquivo, extraido_texto")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(10);

  const terms = message
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 3);

  return (data ?? [])
    .map((document: { nome_arquivo: string; extraido_texto: string | null }) => ({
      document_name: document.nome_arquivo as string,
      content: String(document.extraido_texto ?? "").slice(0, 1200),
      score: terms.reduce(
        (acc, term) => acc + (String(document.extraido_texto ?? "").toLowerCase().includes(term) ? 1 : 0),
        0,
      ),
    }))
    .filter((document: { score: number }) => document.score > 0)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, env.TOP_K_RESULTS);
}

function buildPrompt(input: {
  profile: Profile;
  settings: AgentSettings;
  question: string;
  instructions: Instruction[];
  memories: Memory[];
  documents: RetrievedDocument[];
  history: Message[];
}) {
  const instructionsText =
    input.instructions.map((item) => `- ${item.titulo}: ${item.conteudo}`).join("\n") ||
    "- Nenhuma orientacao ativa";
  const memoriesText =
    input.memories.map((item) => `- ${item.titulo || item.tipo}: ${item.conteudo}`).join("\n") ||
    "- Nenhuma memoria relevante";
  const documentsText =
    input.documents
      .map((item) => `- ${item.document_name}: ${item.content.slice(0, 700)}`)
      .join("\n") || "- Nenhum documento relevante";
  const historyText =
    input.history.map((item) => `${item.role.toUpperCase()}: ${item.content}`).join("\n") ||
    "- Sem historico previo";

  return `
Perfil:
${input.profile.nome} <${input.profile.email}>

Configuracoes do agente:
- nome: ${input.settings.nome_agente || "KAIROS"}
- personalidade: ${input.settings.personalidade || "Clara e objetiva"}
- modelo chat: ${input.settings.modelo_chat || env.OPENAI_MODEL}
- temperatura: ${input.settings.temperatura}

Orientacoes ativas:
${instructionsText}

Memorias relevantes:
${memoriesText}

Documentos relevantes:
${documentsText}

Historico:
${historyText}

Pergunta atual:
${input.question}

Responda em portugues do Brasil com a estrutura:
1. Resumo Executivo
2. Contexto Utilizado
3. Analise
4. Recomendacao
5. Proximos Passos
`;
}

export async function runAgent(input: RunAgentInput) {
  const startedAt = Date.now();
  const admin = getSupabaseAdminClient();
  const conversation = await ensureConversation(input.profile.id, input.conversationId);
  const settings = await admin
    .from("agent_settings")
    .select("*")
    .eq("profile_id", input.profile.id)
    .maybeSingle();

  const agentSettings = settings.data as AgentSettings | null;

  await admin.from("messages").insert({
    conversation_id: conversation.id,
    role: "user",
    content: input.message,
    channel: input.channel ?? "text",
    metadata: {
      transcript: input.transcript ?? input.message,
    },
  });

  const [instructions, memories, documents, history] = await Promise.all([
    getRelevantInstructions(input.profile.id),
    getRelevantMemories(input.profile.id),
    getRelevantDocuments(input.profile.id, input.message),
    getConversationHistory(conversation.id),
  ]);

  const prompt = buildPrompt({
    profile: input.profile,
    settings:
      agentSettings ??
      ({
        id: "",
        profile_id: input.profile.id,
        temperatura: 0.3,
        max_tokens: 4000,
        ativo: true,
      } as AgentSettings),
    question: input.message,
    instructions,
    memories,
    documents,
    history,
  });

  const response = await generateAgentResponse(prompt, KAIROS_SYSTEM_PROMPT);
  const latency = Date.now() - startedAt;

  await admin.from("messages").insert({
    conversation_id: conversation.id,
    role: "assistant",
    content: response.text,
    channel: input.channel ?? "text",
    model: response.model,
    tokens: response.usage?.total_tokens ?? 0,
  });

  await admin.from("agent_executions").insert({
    profile_id: input.profile.id,
    conversation_id: conversation.id,
    pergunta: input.message,
    contexto: {
      instructions: instructions.map((item) => item.titulo),
      memories: memories.map((item: Memory) => item.titulo || item.tipo),
      documents: documents.map((item: RetrievedDocument) => item.document_name),
      history_count: history.length,
      channel: input.channel ?? "text",
      transcript: input.transcript ?? input.message,
    },
    resposta: response.text,
    modelo: response.model,
    tempo_execucao_ms: latency,
  });

  await admin
    .from("conversations")
    .update({
      titulo: conversation.titulo || messageToTitle(input.message),
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversation.id);

  return {
    conversationId: conversation.id,
    answer: response.text,
    context: {
      instructions: instructions.map((item) => item.titulo),
      memories: memories.map((item: Memory) => item.titulo || item.tipo || "Memoria"),
      documents: documents.map((item: RetrievedDocument) => item.document_name),
      tokens: response.usage?.total_tokens ?? 0,
      model: response.model,
      latency,
    },
  };
}
