import { Memory } from "@/types/domain";
import { HologramCard } from "@/components/ui/hologram-card";
import { Badge } from "@/components/ui/badge";

export function MemoryPanel({ memories }: { memories: Memory[] }) {
  return (
    <HologramCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">
            Memorias Utilizadas
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">Contexto vivo</h3>
        </div>
        <Badge>{memories.length}</Badge>
      </div>
      <div className="space-y-3">
        {memories.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma memoria relevante nesta execucao.</p>
        ) : null}
        {memories.map((memory) => (
          <div key={memory.id} className="rounded-2xl border border-white/8 bg-white/4 p-3">
            <p className="text-sm font-medium text-slate-100">{memory.titulo || "Memoria"}</p>
            <p className="mt-1 text-xs text-slate-400">{memory.conteudo}</p>
          </div>
        ))}
      </div>
    </HologramCard>
  );
}
