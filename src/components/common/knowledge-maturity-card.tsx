import { HologramCard } from "@/components/ui/hologram-card";
import { KNOWLEDGE_LEVELS } from "@/lib/knowledge-taxonomy";

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function KnowledgeMaturityCard({
  memories,
  instructions,
  documents,
  projects,
}: {
  memories: number;
  instructions: number;
  documents: number;
  projects: number;
}) {
  const levels = KNOWLEDGE_LEVELS;

  const achievedLevels = levels
    .map((level, index) => ({
      index,
      achieved:
        memories >= level.memoryTarget &&
        instructions >= level.instructionTarget &&
        documents >= level.documentTarget &&
        projects >= level.projectTarget,
    }))
    .filter((item) => item.achieved);
  const achievedIndex = achievedLevels.length ? achievedLevels[achievedLevels.length - 1].index : -1;

  const currentLevel = achievedIndex >= 0 ? levels[achievedIndex] : null;
  const nextLevel = levels[achievedIndex + 1] ?? null;

  const progressBase = nextLevel ?? levels[0];
  const ratios = [
    progressBase.memoryTarget ? memories / progressBase.memoryTarget : null,
    progressBase.instructionTarget ? instructions / progressBase.instructionTarget : null,
    progressBase.documentTarget ? documents / progressBase.documentTarget : null,
    progressBase.projectTarget ? projects / progressBase.projectTarget : null,
  ].filter((value): value is number => value !== null);
  const overallProgress = clampProgress(
    (ratios.reduce((sum, value) => sum + clampProgress(value * 100), 0) / ratios.length) || 0,
  );

  const progressRows = [
    { label: "Memorias", value: memories, target: progressBase.memoryTarget },
    { label: "Orientacoes", value: instructions, target: progressBase.instructionTarget },
    { label: "Documentos", value: documents, target: progressBase.documentTarget },
    { label: "Projetos", value: projects, target: progressBase.projectTarget },
  ];

  return (
    <HologramCard className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">
            Base de conhecimento
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Maturidade da base</h3>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-right">
          <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">Nivel atual</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {currentLevel?.name ?? "Nenhum nivel"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-3 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300 transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
          <span>Progresso geral</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {progressRows.map((row) => {
          const rowProgress =
            row.target > 0 ? clampProgress((row.value / row.target) * 100) : 100;

          return (
            <div key={row.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-200">{row.label}</span>
                <span className="text-cyan-200">
                  {row.value}/{row.target || "-"}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-cyan-300/80"
                  style={{ width: `${rowProgress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Proximo nivel</p>
          <p className="mt-2 text-sm text-slate-200">{nextLevel?.name ?? "Base completa"}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Critério pendente</p>
          <p className="mt-2 text-sm text-slate-200">
            {nextLevel
              ? `Memorias ${nextLevel.memoryTarget}, orientacoes ${nextLevel.instructionTarget}, documentos ${nextLevel.documentTarget}, projetos ${nextLevel.projectTarget}.`
              : "Nenhum. O objetivo final da base foi atingido."}
          </p>
        </div>
      </div>
    </HologramCard>
  );
}
