"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AgentExecution, AgentProfile, AgentSettings } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { HologramCard } from "@/components/ui/hologram-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { formatDate } from "@/lib/utils";

export function SettingsForm({
  initialSettings,
  executions,
  agents,
}: {
  initialSettings: AgentSettings;
  executions: AgentExecution[];
  agents: AgentProfile[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    nome_agente: initialSettings.nome_agente || "KAIROS",
    personalidade:
      initialSettings.personalidade || "Clara, direta, pratica e estrategica.",
    modelo_chat: initialSettings.modelo_chat || "gpt-5",
    modelo_embedding: initialSettings.modelo_embedding || "text-embedding-3-large",
    temperatura: initialSettings.temperatura,
    max_tokens: initialSettings.max_tokens,
    ativo: initialSettings.ativo,
    memoria_ativa: Boolean(initialSettings.memoria_ativa),
    retencao_dias: initialSettings.retencao_dias || 90,
    especialistas_ativos:
      initialSettings.especialistas_ativos?.length
        ? initialSettings.especialistas_ativos
        : agents.filter((agent) => agent.ativo).map((agent) => agent.nome),
  });

  const toggleSpecialist = (name: string) => {
    setForm((current) => ({
      ...current,
      especialistas_ativos: current.especialistas_ativos.includes(name)
        ? current.especialistas_ativos.filter((item) => item !== name)
        : [...current.especialistas_ativos, name],
    }));
  };

  const save = () => {
    startTransition(async () => {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error || "Falha ao salvar configuracoes.");
        return;
      }

      toast.success("Configuracoes atualizadas.");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <HologramCard className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">Agent Settings</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Comportamento do KAIROS</h3>
        </div>

        <label className="space-y-2">
          <span className="text-sm text-slate-300">Nome do agente</span>
          <Input
            value={form.nome_agente}
            onChange={(event) => setForm((current) => ({ ...current, nome_agente: event.target.value }))}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-300">Personalidade</span>
          <Textarea
            value={form.personalidade}
            onChange={(event) => setForm((current) => ({ ...current, personalidade: event.target.value }))}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-slate-300">Modelo de chat</span>
            <Input
              value={form.modelo_chat}
              onChange={(event) => setForm((current) => ({ ...current, modelo_chat: event.target.value }))}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-slate-300">Modelo de embedding</span>
            <Input
              value={form.modelo_embedding}
              onChange={(event) =>
                setForm((current) => ({ ...current, modelo_embedding: event.target.value }))
              }
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-slate-300">Temperatura</span>
            <Input
              type="number"
              value={form.temperatura}
              onChange={(event) =>
                setForm((current) => ({ ...current, temperatura: Number(event.target.value) }))
              }
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-slate-300">Max tokens</span>
            <Input
              type="number"
              value={form.max_tokens}
              onChange={(event) =>
                setForm((current) => ({ ...current, max_tokens: Number(event.target.value) }))
              }
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 p-4">
            <span className="text-sm text-slate-300">Agente ativo</span>
            <Toggle
              checked={form.ativo}
              onChange={(next) => setForm((current) => ({ ...current, ativo: next }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 p-4">
            <span className="text-sm text-slate-300">Memoria ativa</span>
            <Toggle
              checked={form.memoria_ativa}
              onChange={(next) => setForm((current) => ({ ...current, memoria_ativa: next }))}
            />
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-sm text-slate-300">Retencao em dias</span>
          <Input
            type="number"
            value={form.retencao_dias}
            onChange={(event) =>
              setForm((current) => ({ ...current, retencao_dias: Number(event.target.value) }))
            }
          />
        </label>

        <div className="space-y-3">
          <p className="text-sm text-slate-300">Especialistas ativos</p>
          <div className="flex flex-wrap gap-2">
            {agents.map((agent) => {
              const active = form.especialistas_ativos.includes(agent.nome);
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => toggleSpecialist(agent.nome)}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    active
                      ? "border-cyan-300/30 bg-cyan-400/12 text-white"
                      : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  {agent.nome}
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={save} disabled={isPending}>
          Salvar configuracoes
        </Button>
      </HologramCard>

      <HologramCard className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">Execution Logs</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Historico operacional</h3>
        </div>

        <div className="glass-scroll max-h-[760px] space-y-3 overflow-y-auto pr-1">
          {executions.map((execution) => (
            <div key={execution.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-sm font-medium text-white">{execution.pergunta}</p>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                {(execution.resposta || "").slice(0, 220)}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                <span>{execution.modelo || "-"}</span>
                <span>{execution.tempo_execucao_ms || 0} ms</span>
                <span>{formatDate(execution.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </HologramCard>
    </div>
  );
}
