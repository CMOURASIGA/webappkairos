import {
  Activity,
  BrainCircuit,
  FileStack,
  Lightbulb,
  MessagesSquare,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { PageIntro } from "@/components/common/page-intro";
import { MetricCard } from "@/components/common/metric-card";
import { AgentPanel } from "@/components/kairos/agent-panel";
import { CommandConsole } from "@/components/kairos/command-console";
import { KnowledgeRadar } from "@/components/kairos/knowledge-radar";
import { NeuralPulse } from "@/components/kairos/neural-pulse";
import { OrbCore } from "@/components/kairos/orb-core";
import { KnowledgeBaseSummary } from "@/components/common/knowledge-base-summary";
import { KnowledgeMaturityCard } from "@/components/common/knowledge-maturity-card";
import { HologramCard } from "@/components/ui/hologram-card";
import { formatDate } from "@/lib/utils";
import { loadDashboardPage } from "@/services/server-loaders";

export default async function DashboardPage() {
  const { profile, conversations, memories, instructions, documents, projects, agents, executions } =
    await loadDashboardPage();
  const readyDocuments = documents.filter((document) => document.status === "READY").length;
  const activeMemories = memories.filter((memory) => memory.ativo).length;
  const activeAgents = agents.filter((agent) => agent.ativo).length;

  const nextAction =
    instructions.length === 0
      ? "Cadastrar orientacoes operacionais para guiar o comportamento do agente."
      : readyDocuments === 0
        ? "Carregar documentos para habilitar consultas contextuais com base indexada."
        : conversations.length === 0
          ? "Iniciar a primeira conversa para gerar historico e logs reais de execucao."
          : "Refinar configuracoes e memoria com base no historico real de uso.";

  const operationalSignal = [
    `${instructions.length} orientacoes ativas`,
    `${readyDocuments} documentos prontos`,
    `${activeMemories} memorias utilizaveis`,
  ].join(", ");

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Dashboard"
        title={`Bem-vindo, ${profile.nome}`}
        description="Centro de comando do KAIROS com memoria, documentos, conversas recentes e sinais operacionais do agente."
        badge="MVP v1.0"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Conversas"
          value={conversations.length}
          hint="Historico persistente do agente."
          icon={MessagesSquare}
        />
        <MetricCard
          label="Memorias"
          value={memories.length}
          hint="Conhecimento estruturado reutilizavel."
          icon={BrainCircuit}
        />
        <MetricCard
          label="Documentos"
          value={documents.length}
          hint="Base indexada para RAG."
          icon={FileStack}
        />
        <MetricCard
          label="Projetos"
          value={projects.length}
          hint="Escopo base preparado para expansao."
          icon={WalletCards}
        />
      </div>

      <KnowledgeBaseSummary
        totalMemories={memories.length}
        totalInstructions={instructions.length}
        totalDocuments={documents.length}
        totalProjects={projects.length}
      />

      <KnowledgeMaturityCard
        memories={memories.length}
        instructions={instructions.length}
        documents={documents.length}
        projects={projects.length}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <HologramCard className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="grid place-items-center">
              <OrbCore size="lg" state="Thinking" />
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">
                Recomendacoes do KAIROS
              </p>
              <h3 className="text-2xl font-semibold text-white">
                O agente esta pronto para combinar memoria, orientacoes e documentos.
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Proxima acao
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    {nextAction}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Sinal operacional
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    {operationalSignal}.
                  </p>
                </div>
              </div>
            </div>
          </HologramCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <KnowledgeRadar />
            <NeuralPulse />
          </div>

          <CommandConsole
            lines={[
              `profile = ${profile.email}`,
              `conversations = ${conversations.length}`,
              `executions = ${executions.length}`,
              `specialists = ${activeAgents}`,
              `last_execution = ${executions[0] ? formatDate(executions[0].created_at) : "none"}`,
            ]}
          />
        </div>

        <div className="space-y-6">
          <HologramCard className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-cyan-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">
                  Atividades recentes
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">Ultimas execucoes</h3>
              </div>
            </div>
            <div className="space-y-3">
              {executions.slice(0, 5).map((execution) => (
                <div key={execution.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-sm font-medium text-white">{execution.pergunta}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    <span>{execution.modelo || "-"}</span>
                    <span>{execution.tempo_execucao_ms || 0} ms</span>
                    <span>{formatDate(execution.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </HologramCard>

          <AgentPanel agents={agents} />

          <HologramCard className="space-y-4">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-cyan-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">
                  Insights
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">Sinais do ambiente</h3>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
                {readyDocuments} documentos estao indexados e prontos para consulta contextual.
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
                {activeMemories} memorias ativas podem enriquecer o contexto do chat.
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
                {agents.length} especialistas foram preparados, sem orquestracao multiagente no MVP.
              </div>
            </div>
          </HologramCard>
        </div>
      </div>
    </div>
  );
}
