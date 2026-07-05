import { AgentProfile } from "@/types/domain";
import { HologramCard } from "@/components/ui/hologram-card";
import { Badge } from "@/components/ui/badge";

export function AgentPanel({ agents }: { agents: AgentProfile[] }) {
  return (
    <HologramCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">
            Especialistas
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">Estrutura preparada</h3>
        </div>
        <Badge>{agents.filter((agent) => agent.ativo).length} ativos</Badge>
      </div>
      <div className="space-y-3">
        {agents.map((agent) => (
          <div key={agent.id} className="rounded-2xl border border-white/8 bg-white/4 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">{agent.nome}</p>
              <Badge className={agent.ativo ? "text-emerald-200" : "text-slate-400"}>
                {agent.ativo ? "Online" : "Offline"}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {agent.descricao || "Especialista base para expansao futura."}
            </p>
          </div>
        ))}
      </div>
    </HologramCard>
  );
}
