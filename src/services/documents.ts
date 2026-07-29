import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import * as XLSX from "xlsx";

import { env, hasOpenAI } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createEmbedding } from "@/services/openai";

function extensionFromName(name: string) {
  const [, extension = "txt"] = name.toLowerCase().split(".").slice(-2);
  return extension;
}

export async function extractTextFromBuffer(name: string, buffer: Buffer) {
  const extension = extensionFromName(name);

  if (extension === "txt") {
    return buffer.toString("utf-8");
  }

  if (extension === "csv") {
    return buffer.toString("utf-8");
  }

  if (extension === "pdf") {
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    return parsed.text;
  }

  if (extension === "docx") {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value;
  }

  if (extension === "xlsx") {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    return workbook.SheetNames.map((sheetName) =>
      XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]),
    ).join("\n");
  }

  throw new Error(`Extensao nao suportada: ${extension}`);
}

export async function extractTextFromFile(file: File) {
  return extractTextFromBuffer(file.name, Buffer.from(await file.arrayBuffer()));
}

export function createChunks(content: string) {
  const chunks: Array<{ chunk_index: number; content: string }> = [];
  const size = env.CHUNK_SIZE;
  const overlap = env.CHUNK_OVERLAP;

  let start = 0;
  let index = 0;

  while (start < content.length) {
    const end = Math.min(content.length, start + size);
    const slice = content.slice(start, end).trim();

    if (slice.length > 0) {
      chunks.push({ chunk_index: index, content: slice });
      index += 1;
    }

    if (end === content.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

export async function uploadAndProcessDocument(
  profileId: string,
  file: File,
  categoria?: string,
  projectId?: string,
) {
  const admin = getSupabaseAdminClient();
  const timestamp = Date.now();
  const storagePath = `${profileId}/${timestamp}-${file.name}`;

  const { data: document, error: documentError } = await admin
    .from("documents")
    .insert({ profile_id: profileId, project_id: projectId ?? null, nome_arquivo: file.name, categoria: categoria ?? null, mime_type: file.type, tamanho: file.size, storage_path: storagePath, status: "PROCESSING" })
    .select("*").single();
  if (documentError) throw documentError;

  try {
    const content = await extractTextFromFile(file);
    if (!content.trim()) throw new Error("Não foi possível extrair texto do arquivo. PDFs digitalizados precisam de OCR.");
    const chunks = createChunks(content);

    const { error: uploadError } = await admin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: true,
    });

    if (uploadError) throw uploadError;
    const { error: updateError } = await admin.from("documents").update({ status: "READY", extraido_texto: content, processing_error: null }).eq("id", document.id);
    if (updateError) throw updateError;

  if (chunks.length > 0) {
    const rows = await Promise.all(
      chunks.map(async (chunk) => ({
        document_id: document.id,
        chunk_index: chunk.chunk_index,
        content: chunk.content,
        metadata: {
          source: file.name,
          profile_id: profileId,
          generated_at: new Date().toISOString(),
        },
        embedding: hasOpenAI ? await createEmbedding(chunk.content) : null,
      })),
    );

    const { error: chunksError } = await admin.from("document_chunks").insert(rows);
    if (chunksError) {
      throw chunksError;
    }
  }

    return { ...document, status: "READY", extraido_texto: content, processing_error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha desconhecida no processamento.";
    await admin.from("documents").update({ status: "ERROR", processing_error: message }).eq("id", document.id);
    return { ...document, status: "ERROR", processing_error: message };
  }
}

export async function reprocessDocument(profileId: string, documentId: string) {
  const admin = getSupabaseAdminClient();
  const { data: document, error } = await admin
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("profile_id", profileId)
    .single();

  if (error) {
    throw error;
  }

  let text = (document.extraido_texto as string | null) ?? "";
  if (document.storage_path) {
    const { data: stored, error: downloadError } = await admin.storage.from(env.SUPABASE_STORAGE_BUCKET).download(document.storage_path as string);
    if (downloadError) throw downloadError;
    text = await extractTextFromBuffer(document.nome_arquivo as string, Buffer.from(await stored.arrayBuffer()));
  }
  if (!text.trim()) throw new Error("Não há texto extraível neste arquivo. PDFs digitalizados precisam de OCR.");
  const chunks = createChunks(text);

  await admin.from("document_chunks").delete().eq("document_id", documentId);

  const rows = await Promise.all(
    chunks.map(async (chunk) => ({
      document_id: documentId,
      chunk_index: chunk.chunk_index,
      content: chunk.content,
      metadata: {
        source: document.nome_arquivo,
        profile_id: profileId,
        regenerated_at: new Date().toISOString(),
      },
      embedding: hasOpenAI ? await createEmbedding(chunk.content) : null,
    })),
  );

  if (rows.length > 0) {
    await admin.from("document_chunks").insert(rows);
  }

  await admin
    .from("documents")
    .update({ status: "READY", extraido_texto: text, processing_error: null })
    .eq("id", documentId)
    .eq("profile_id", profileId);
}
