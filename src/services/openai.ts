import OpenAI from "openai";

import { env, hasOpenAI } from "@/lib/env";

let openai: OpenAI | null = null;

function getClient() {
  if (!hasOpenAI) {
    return null;
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  return openai;
}

export async function createEmbedding(input: string) {
  const client = getClient();
  if (!client) {
    return null;
  }

  const embedding = await client.embeddings.create({
    model: env.OPENAI_EMBEDDING_MODEL,
    input,
  });

  return embedding.data[0]?.embedding ?? null;
}

export async function generateAgentResponse(prompt: string, systemPrompt: string) {
  const client = getClient();

  if (!client) {
    return {
      text: [
        "OpenAI nao configurado no ambiente.",
        "Ainda assim, organizei o contexto disponivel para que a interface, o historico e o painel contextual continuem operando.",
        "",
        prompt.slice(0, 1600),
      ].join("\n"),
      usage: {
        total_tokens: 0,
      },
      model: "fallback-context-engine",
    };
  }

  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return {
    text: response.output_text,
    usage: response.usage,
    model: response.model,
  };
}
