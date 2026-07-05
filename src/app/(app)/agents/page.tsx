import { PageIntro } from "@/components/common/page-intro";
import { EntityManager } from "@/components/forms/entity-manager";
import { loadAgentsPage } from "@/services/server-loaders";

export default async function AgentsPage() {
  const { agents } = await loadAgentsPage();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Especialistas"
        title="Estrutura base de agentes internos"
        description="O MVP prepara cadastro, configuracao e ativacao. Nao implementa orquestracao, roteamento ou execucao multiagente."
        badge="ADR-001"
      />

      <EntityManager
        endpoint="/api/agents"
        title="Specialists Layer"
        description="Listagem e configuracao de agentes especialistas."
        items={agents as unknown as Array<Record<string, unknown>>}
        titleField="nome"
        descriptionField="descricao"
        fields={[
          { name: "nome", label: "Nome", type: "text", placeholder: "PM Agent" },
          { name: "modelo", label: "Modelo", type: "text", placeholder: "gpt-5-mini" },
          { name: "descricao", label: "Descricao", type: "textarea", placeholder: "Especialista em gestao de projetos." },
          { name: "prompt_base", label: "Prompt base", type: "textarea", placeholder: "Instrucoes base do especialista." },
          { name: "ativo", label: "Ativo", type: "boolean" },
        ]}
      />
    </div>
  );
}
