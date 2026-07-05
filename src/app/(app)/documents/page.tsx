import { PageIntro } from "@/components/common/page-intro";
import { DocumentManager } from "@/components/documents/document-manager";
import { DOCUMENT_CATEGORIES } from "@/lib/knowledge-taxonomy";
import { loadDocumentsPage } from "@/services/server-loaders";

export default async function DocumentsPage() {
  const { documents } = await loadDocumentsPage();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Documentos"
        title="Pipeline documental com chunking e embeddings"
        description="Upload, extração de texto, segmentacao e preparo para busca semantica com suporte a PDF, DOCX, TXT, CSV e XLSX."
        badge={`${documents.length} itens`}
      />

      <DocumentManager documents={documents} categories={DOCUMENT_CATEGORIES} />
    </div>
  );
}
