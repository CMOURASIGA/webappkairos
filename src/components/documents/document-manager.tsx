"use client";

import { useRef, useState, useTransition } from "react";
import { RefreshCcw, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DOCUMENT_CATEGORIES, TaxonomyOption } from "@/lib/knowledge-taxonomy";
import { DocumentRecord } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { HologramCard } from "@/components/ui/hologram-card";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

export function DocumentManager({
  documents,
  categories = DOCUMENT_CATEGORIES,
}: {
  documents: DocumentRecord[];
  categories?: TaxonomyOption[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState(categories[0]?.value ?? "");

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("categoria", category);

    const response = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    setUploading(false);
    if (!response.ok) {
      toast.error(payload.error || "Falha no upload.");
      return;
    }

    toast.success("Documento enviado e processado.");
    router.refresh();
  };

  const reprocess = (id: string) => {
    startTransition(async () => {
      const response = await fetch(`/api/documents/${id}/reprocess`, {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error || "Falha ao reprocessar.");
        return;
      }
      toast.success("Documento reprocessado.");
      router.refresh();
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error || "Falha ao excluir.");
        return;
      }
      toast.success("Documento removido.");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <HologramCard className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">Pipeline documental</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Upload, extracao e indexacao</h3>
        </div>
        <p className="text-sm leading-7 text-slate-300">
          O fluxo envia para Supabase Storage, registra o documento, extrai texto, gera
          chunks e cria embeddings quando a OpenAI estiver configurada.
        </p>
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Classificacao documental</span>
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt,.csv,.xlsx"
          onChange={(event) => upload(event.target.files)}
        />
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          <UploadCloud className="h-4 w-4" />
          {uploading ? "Processando..." : "Enviar documento"}
        </Button>
      </HologramCard>

      <HologramCard className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">Base indexada</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Documentos e chunks</h3>
        </div>

        <div className="glass-scroll max-h-[720px] space-y-3 overflow-y-auto pr-1">
          {documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/12 bg-white/4 p-5 text-sm text-slate-400">
              Nenhum documento carregado ainda.
            </div>
          ) : null}

          {documents.map((document) => (
            <div key={document.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{document.nome_arquivo}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                    {document.status} · {document.categoria || "Sem categoria"} ·{" "}
                    {formatDate(document.created_at)}
                  </p>
                  <p className="mt-3 text-xs leading-6 text-slate-400">
                    {document.extraido_texto?.slice(0, 220) || "Sem resumo extraido."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
                    onClick={() => reprocess(document.id)}
                    disabled={isPending}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-red-500/20 p-2 text-red-200 transition hover:bg-red-500/12"
                    onClick={() => remove(document.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </HologramCard>
    </div>
  );
}
