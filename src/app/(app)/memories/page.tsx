import { PageIntro } from "@/components/common/page-intro";
import { EntityManager } from "@/components/forms/entity-manager";
import { MEMORY_TYPES } from "@/lib/knowledge-taxonomy";
import { loadMemoriesPage } from "@/services/server-loaders";

export default async function MemoriesPage() {
  const { memories } = await loadMemoriesPage();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Memorias"
        title="Memoria estruturada do agente"
        description="Visualizacao e manutencao de conhecimento persistente do KAIROS por tipo, origem, importancia e status."
        badge={`${memories.length} registros`}
      />

      <EntityManager
        endpoint="/api/memories"
        title="Knowledge Memory"
        description="Cadastre preferencias, clientes, decisoes e contexto permanente."
        items={memories as unknown as Array<Record<string, unknown>>}
        titleField="titulo"
        descriptionField="conteudo"
        fields={[
          { name: "titulo", label: "Titulo", type: "text", placeholder: "Cliente Desata" },
          {
            name: "tipo",
            label: "Tipo",
            type: "select",
            options: MEMORY_TYPES,
          },
          { name: "origem", label: "Origem", type: "text", placeholder: "Manual" },
          { name: "importancia", label: "Importancia", type: "number" },
          { name: "conteudo", label: "Conteudo", type: "textarea", placeholder: "Contexto, preferencias e fatos persistentes." },
          { name: "ativo", label: "Ativo", type: "boolean" },
        ]}
      />
    </div>
  );
}
