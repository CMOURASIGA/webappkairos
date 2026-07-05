import { HologramCard } from "@/components/ui/hologram-card";

export function KnowledgeBaseSummary({
  totalMemories,
  totalInstructions,
  totalDocuments,
  totalProjects,
}: {
  totalMemories: number;
  totalInstructions: number;
  totalDocuments: number;
  totalProjects: number;
}) {
  const metrics = [
    { label: "Memorias", value: totalMemories },
    { label: "Orientacoes", value: totalInstructions },
    { label: "Documentos", value: totalDocuments },
    { label: "Projetos", value: totalProjects },
  ];

  return (
    <HologramCard className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">Base viva</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Resumo da base de conhecimento</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{metric.value}</p>
          </div>
        ))}
      </div>
    </HologramCard>
  );
}

