import { PageIntro } from "@/components/common/page-intro";
import { EntityManager } from "@/components/forms/entity-manager";
import { INSTRUCTION_CATEGORIES } from "@/lib/knowledge-taxonomy";
import { loadInstructionsPage } from "@/services/server-loaders";

export default async function InstructionsPage() {
  const { instructions } = await loadInstructionsPage();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Orientacoes"
        title="Regras e preferencia operacional"
        description="Ensine o KAIROS a responder do jeito certo, com prioridade, categoria e ativacao granular."
        badge={`${instructions.length} regras`}
      />

      <EntityManager
        endpoint="/api/instructions"
        title="Instruction Layer"
        description="Regras diretas que entram no prompt do agente."
        items={instructions as unknown as Array<Record<string, unknown>>}
        titleField="titulo"
        descriptionField="conteudo"
        fields={[
          { name: "titulo", label: "Titulo", type: "text", placeholder: "Gerenciamento de Projetos" },
          {
            name: "categoria",
            label: "Categoria",
            type: "select",
            options: INSTRUCTION_CATEGORIES,
          },
          { name: "prioridade", label: "Prioridade", type: "number" },
          { name: "conteudo", label: "Conteudo", type: "textarea", placeholder: "Sempre analisar prazo, custo, risco e impacto." },
          { name: "ativo", label: "Ativo", type: "boolean" },
        ]}
      />
    </div>
  );
}
