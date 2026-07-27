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
        description="Cada projeto possui contexto, documentos, orientacoes e uma conversa exclusiva com o KAIROS."
        badge="Project Notebook"
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
          { name: "objetivo", label: "Objetivo", type: "textarea", placeholder: "Resultado que o projeto precisa entregar." },
          { name: "contexto", label: "Contexto de trabalho", type: "textarea", placeholder: "Premissas, restricoes, decisoes e informacoes relevantes." },
          { name: "prompt_base", label: "Orientacao do KAIROS no projeto", type: "textarea", placeholder: "Como o KAIROS deve apoiar este projeto." },
        ]}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {projects.map((project) => (
          <Link key={project.id} href={`/chat?project=${project.id}`} className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-5 transition hover:border-cyan-300/50">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Notebook do projeto</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{project.nome}</h3>
            <p className="mt-2 text-sm text-slate-300">Abrir conversa, documentos e contexto exclusivo.</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
import Link from "next/link";
