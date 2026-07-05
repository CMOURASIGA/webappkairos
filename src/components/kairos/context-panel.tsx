import { HologramCard } from "@/components/ui/hologram-card";
import { Badge } from "@/components/ui/badge";

interface ContextPanelProps {
  instructions: string[];
  memories: string[];
  documents: string[];
  tokens?: number;
  model?: string;
  latency?: number;
}

export function ContextPanel({
  instructions,
  memories,
  documents,
  tokens,
  model,
  latency,
}: ContextPanelProps) {
  const sections = [
    { label: "Orientacoes", items: instructions },
    { label: "Memorias", items: memories },
    { label: "Documentos", items: documents },
  ];

  return (
    <HologramCard className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">
            Painel Contextual
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">Fontes da resposta</h3>
        </div>
        <Badge>{tokens ?? 0} tk</Badge>
      </div>
      <div className="grid gap-4">
        {sections.map((section) => (
          <div key={section.label} className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {section.label}
            </p>
            {section.items.length === 0 ? (
              <p className="text-sm text-slate-500">Sem itens utilizados.</p>
            ) : (
              section.items.map((item) => (
                <div
                  key={`${section.label}-${item}`}
                  className="rounded-2xl border border-white/8 bg-white/4 px-3 py-2 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Modelo</p>
          <p className="mt-1">{model ?? "-"}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Latencia</p>
          <p className="mt-1">{latency ? `${latency} ms` : "-"}</p>
        </div>
      </div>
    </HologramCard>
  );
}
