import { PageIntro } from "@/components/common/page-intro";
import { DocumentManager } from "@/components/documents/document-manager";
import { DOCUMENT_CATEGORIES } from "@/lib/knowledge-taxonomy";
import { loadDocumentsPage } from "@/services/server-loaders";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const params = await searchParams;
  const { documents } = await loadDocumentsPage();
  const scopedDocuments = params.project ? documents.filter((document) => document.project_id === params.project) : documents;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Documentos"
        title="Pipeline documental com chunking e embeddings"
        description="Upload, extração de texto, segmentacao e preparo para busca semantica com suporte a PDF, DOCX, TXT, CSV e XLSX."
        badge={`${scopedDocuments.length} itens`}
      />

      <DocumentManager documents={scopedDocuments} categories={DOCUMENT_CATEGORIES} projectId={params.project} />
    </div>
  );
}
