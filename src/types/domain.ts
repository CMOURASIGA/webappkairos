export type ConversationStatus = "ACTIVE" | "ARCHIVED";
export type DocumentStatus = "PROCESSING" | "READY" | "ERROR";
export type OrbState =
  | "Idle"
  | "Listening"
  | "Thinking"
  | "Searching"
  | "Answering"
  | "Learning"
  | "Error";

export interface Profile {
  id: string;
  auth_user_id: string;
  nome: string;
  email: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  profile_id: string;
  titulo: string | null;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  channel?: "text" | "voice";
  metadata?: Record<string, unknown> | null;
  tokens?: number | null;
  model?: string | null;
  created_at: string;
}

export interface Instruction {
  id: string;
  profile_id: string;
  titulo: string;
  categoria?: string | null;
  conteudo: string;
  prioridade: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  profile_id: string;
  tipo?: string | null;
  titulo?: string | null;
  conteudo: string;
  importancia: number;
  origem?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  profile_id: string;
  nome_arquivo: string;
  categoria?: string | null;
  mime_type?: string | null;
  tamanho?: number | null;
  storage_path?: string | null;
  status: DocumentStatus;
  extraido_texto?: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  profile_id: string;
  nome: string;
  cliente?: string | null;
  descricao?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AgentProfile {
  id: string;
  profile_id: string;
  nome: string;
  descricao?: string | null;
  prompt_base?: string | null;
  modelo?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentSettings {
  id: string;
  profile_id: string;
  nome_agente?: string | null;
  personalidade?: string | null;
  modelo_chat?: string | null;
  modelo_embedding?: string | null;
  temperatura: number;
  max_tokens: number;
  ativo: boolean;
  memoria_ativa?: boolean;
  retencao_dias?: number;
  especialistas_ativos?: string[];
  created_at: string;
  updated_at: string;
}

export interface AgentExecution {
  id: string;
  profile_id: string;
  conversation_id?: string | null;
  pergunta?: string | null;
  contexto?: Record<string, unknown> | null;
  resposta?: string | null;
  modelo?: string | null;
  tempo_execucao_ms?: number | null;
  created_at: string;
}
