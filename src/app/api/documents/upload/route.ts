import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { DOCUMENT_CATEGORIES } from "@/lib/knowledge-taxonomy";
import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { uploadAndProcessDocument } from "@/services/documents";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((item): item is File => item instanceof File);
    // Compatibilidade com a versão anterior do formulário.
    const legacyFile = formData.get("file");
    if (files.length === 0 && legacyFile instanceof File) files.push(legacyFile);
    if (files.length === 0) {
      throw new Error("Arquivo nao enviado.");
    }

    const categoria = String(formData.get("categoria") ?? "").trim() || DOCUMENT_CATEGORIES[0].value;
    const projectId = String(formData.get("projectId") ?? "").trim() || undefined;

    for (const file of files) if (file.size > env.MAX_UPLOAD_SIZE) throw new Error(`Arquivo ${file.name} acima do limite permitido.`);

    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    // Sequencial para evitar múltiplas chamadas simultâneas de embeddings na função serverless.
    const documents: Awaited<ReturnType<typeof uploadAndProcessDocument>>[] = [];
    for (const file of files) documents.push(await uploadAndProcessDocument(profile.id, file, categoria, projectId));
    return NextResponse.json({ document: documents[0], documents });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha no upload do documento." },
      { status: 400 },
    );
  }
}
