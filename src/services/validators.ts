import { z } from "zod";

export const instructionSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(3),
  categoria: z.string().optional().nullable(),
  conteudo: z.string().min(10),
  prioridade: z.coerce.number().min(1).max(10),
  ativo: z.coerce.boolean().default(true),
});

export const memorySchema = z.object({
  id: z.string().optional(),
  tipo: z.string().optional().nullable(),
  titulo: z.string().optional().nullable(),
  conteudo: z.string().min(10),
  importancia: z.coerce.number().min(1).max(10),
  origem: z.string().optional().nullable(),
  ativo: z.coerce.boolean().default(true),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3),
  cliente: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
  status: z.string().default("ACTIVE"),
});

export const agentSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3),
  descricao: z.string().optional().nullable(),
  prompt_base: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
  ativo: z.coerce.boolean().default(true),
});

export const settingsSchema = z.object({
  nome_agente: z.string().min(2),
  personalidade: z.string().min(10),
  modelo_chat: z.string().min(2),
  modelo_embedding: z.string().min(2),
  temperatura: z.coerce.number().min(0).max(1),
  max_tokens: z.coerce.number().min(256).max(32_000),
  ativo: z.coerce.boolean().default(true),
  memoria_ativa: z.coerce.boolean().default(true),
  retencao_dias: z.coerce.number().min(1).max(3650),
  especialistas_ativos: z.array(z.string()).default([]),
});
