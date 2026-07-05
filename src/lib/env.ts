import { z } from "zod";

function firstDefined(keys: string[], fallback?: string) {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value;
    }
  }

  return fallback;
}

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Kairos Agent"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-5"),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-large"),
  STORAGE_PROVIDER: z.string().default("supabase"),
  SUPABASE_STORAGE_BUCKET: z.string().default("documents"),
  MAX_UPLOAD_SIZE: z.coerce.number().default(52_428_800),
  ALLOWED_EXTENSIONS: z.string().default("pdf,docx,txt,csv,xlsx"),
  VECTOR_DIMENSIONS: z.coerce.number().default(3072),
  CHUNK_SIZE: z.coerce.number().default(1000),
  CHUNK_OVERLAP: z.coerce.number().default(200),
  TOP_K_RESULTS: z.coerce.number().default(10),
  LOG_LEVEL: z.string().default("debug"),
  ENABLE_TRACING: z.coerce.boolean().default(true),
  ENABLE_REALTIME_VOICE: z.coerce.boolean().default(true),
  OPENAI_REALTIME_MODEL: z.string().default("gpt-4o-realtime-preview"),
  OPENAI_TRANSCRIPTION_MODEL: z.string().default("gpt-4o-mini-transcribe"),
  OPENAI_TTS_MODEL: z.string().default("gpt-4o-mini-tts"),
  VOICE_DEFAULT: z.string().default("alloy"),
  VOICE_LANGUAGE: z.string().default("pt-BR"),
  ENABLE_WAKE_WORD: z.coerce.boolean().default(false),
  WAKE_WORD: z.string().default("Kairos"),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "Kairos Agent",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: firstDefined([
    "SUPABASE_SERVICE_ROLE_KEY",
    "supabasesecret",
  ]),
  OPENAI_API_KEY: firstDefined(["OPENAI_API_KEY"]),
  OPENAI_MODEL: firstDefined(["OPENAI_MODEL"], "gpt-5"),
  OPENAI_EMBEDDING_MODEL: firstDefined(
    ["OPENAI_EMBEDDING_MODEL"],
    "text-embedding-3-large",
  ),
  STORAGE_PROVIDER: firstDefined(["STORAGE_PROVIDER"], "supabase"),
  SUPABASE_STORAGE_BUCKET: firstDefined(["SUPABASE_STORAGE_BUCKET"], "documents"),
  MAX_UPLOAD_SIZE: firstDefined(["MAX_UPLOAD_SIZE"], "52428800"),
  ALLOWED_EXTENSIONS: firstDefined(
    ["ALLOWED_EXTENSIONS"],
    "pdf,docx,txt,csv,xlsx",
  ),
  VECTOR_DIMENSIONS: firstDefined(["VECTOR_DIMENSIONS"], "3072"),
  CHUNK_SIZE: firstDefined(["CHUNK_SIZE"], "1000"),
  CHUNK_OVERLAP: firstDefined(["CHUNK_OVERLAP"], "200"),
  TOP_K_RESULTS: firstDefined(["TOP_K_RESULTS"], "10"),
  LOG_LEVEL: firstDefined(["LOG_LEVEL"], "debug"),
  ENABLE_TRACING: firstDefined(["ENABLE_TRACING"], "true"),
  ENABLE_REALTIME_VOICE: firstDefined(["ENABLE_REALTIME_VOICE"], "true"),
  OPENAI_REALTIME_MODEL: firstDefined(
    ["OPENAI_REALTIME_MODEL"],
    "gpt-4o-realtime-preview",
  ),
  OPENAI_TRANSCRIPTION_MODEL: firstDefined(
    ["OPENAI_TRANSCRIPTION_MODEL"],
    "gpt-4o-mini-transcribe",
  ),
  OPENAI_TTS_MODEL: firstDefined(["OPENAI_TTS_MODEL"], "gpt-4o-mini-tts"),
  VOICE_DEFAULT: firstDefined(["VOICE_DEFAULT"], "alloy"),
  VOICE_LANGUAGE: firstDefined(["VOICE_LANGUAGE"], "pt-BR"),
  ENABLE_WAKE_WORD: firstDefined(["ENABLE_WAKE_WORD"], "false"),
  WAKE_WORD: firstDefined(["WAKE_WORD"], "Kairos"),
});

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;

export const hasSupabase =
  Boolean(env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const hasSupabaseAdmin = hasSupabase && Boolean(env.SUPABASE_SERVICE_ROLE_KEY);

export const hasOpenAI = Boolean(env.OPENAI_API_KEY);
