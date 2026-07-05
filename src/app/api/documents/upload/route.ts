import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { DOCUMENT_CATEGORIES } from "@/lib/knowledge-taxonomy";
import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import { uploadAndProcessDocument } from "@/services/documents";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new Error("Arquivo nao enviado.");
    }

    const categoria = String(formData.get("categoria") ?? "").trim() || DOCUMENT_CATEGORIES[0].value;

    if (file.size > env.MAX_UPLOAD_SIZE) {
      throw new Error("Arquivo acima do limite permitido.");
    }

    const user = await getAuthenticatedUser();
    const profile = await ensureProfile(user);
    const document = await uploadAndProcessDocument(profile.id, file, categoria);
    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha no upload do documento." },
      { status: 400 },
    );
  }
}
