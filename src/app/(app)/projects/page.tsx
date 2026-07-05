import { PageIntro } from "@/components/common/page-intro";
import { EntityManager } from "@/components/forms/entity-manager";
import { loadProjectsPage } from "@/services/server-loaders";

export default async function ProjectsPage() {
  const { projects } = await loadProjectsPage();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Projetos"
        title="Estrutura base do modulo Projetos"
        description="Escopo do MVP limitado a persistencia, CRUD e interface. Sem cronograma, Gantt, riscos automatizados ou IA especializada."
        badge="ADR-001"
      />

      <EntityManager
        endpoint="/api/projects"
        title="Projects Base"
        description="Base pronta para expansao futura."
        items={projects as unknown as Array<Record<string, unknown>>}
        titleField="nome"
        descriptionField="descricao"
        fields={[
          { name: "nome", label: "Nome", type: "text", placeholder: "Implantacao Kairos" },
          { name: "cliente", label: "Cliente", type: "text", placeholder: "Desata" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "ACTIVE", value: "ACTIVE" },
              { label: "PAUSED", value: "PAUSED" },
              { label: "DONE", value: "DONE" },
            ],
          },
          { name: "descricao", label: "Descricao", type: "textarea", placeholder: "Resumo do projeto e escopo atual." },
        ]}
      />
    </div>
  );
}
