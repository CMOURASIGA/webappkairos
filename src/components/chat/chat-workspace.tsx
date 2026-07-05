"use client";

import { useCallback, useState, useTransition } from "react";
import {
  Bot,
  Mic,
  MicOff,
  PanelRightClose,
  Pencil,
  Send,
  Square,
  Trash2,
  Volume2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AgentProfile, Conversation, Message } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { HologramCard } from "@/components/ui/hologram-card";
import { Input } from "@/components/ui/input";
import { ContextPanel } from "@/components/kairos/context-panel";
import { MemoryPanel } from "@/components/kairos/memory-panel";
import { OrbCore } from "@/components/kairos/orb-core";
import { VoiceVisualizer } from "@/components/kairos/voice-visualizer";
import { CommandConsole } from "@/components/kairos/command-console";
import { AgentPanel } from "@/components/kairos/agent-panel";
import { useVoiceSession } from "@/hooks/use-voice-session";
import { formatDate } from "@/lib/utils";

export function ChatWorkspace({
  conversations,
  initialMessages,
  initialContext,
  memories,
  agents,
  activeConversationId,
}: {
  conversations: Conversation[];
  initialMessages: Message[];
  initialContext: {
    instructions: string[];
    memories: string[];
    documents: string[];
    tokens?: number;
    model?: string;
    latency?: number;
  };
  memories: Array<{ id: string; titulo?: string | null; conteudo: string }>;
  agents: AgentProfile[];
  activeConversationId?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [context, setContext] = useState(initialContext);
  const [conversationId, setConversationId] = useState(activeConversationId);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isPending, startTransition] = useTransition();
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const submitMessage = useCallback(
    async (payload: { message: string; channel: "text" | "voice"; transcript?: string }) => {
      if (!payload.message.trim()) {
        return;
      }

      const optimisticUserMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: payload.message,
        conversation_id: conversationId ?? "new",
        created_at: new Date().toISOString(),
      };

      setMessages((current) => [...current, optimisticUserMessage]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: payload.message,
          conversationId,
          channel: payload.channel,
          transcript: payload.transcript,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        toast.error(body.error || "Falha ao consultar o KAIROS.");
        setMessages((current) => current.filter((item) => item.id !== optimisticUserMessage.id));
        return;
      }

      setConversationId(body.conversationId);
      setContext(body.context);
      setMessages((current) => [
        ...current.filter((item) => item.id !== optimisticUserMessage.id),
        optimisticUserMessage,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: body.answer,
          conversation_id: body.conversationId,
          created_at: new Date().toISOString(),
          model: body.context.model,
          tokens: body.context.tokens,
        },
      ]);
      router.refresh();
      return body.answer as string;
    },
    [conversationId, router],
  );

  const voice = useVoiceSession({
    onTranscript: setVoiceTranscript,
    onAnswer: async (transcript) => {
      const answer = await submitMessage({
        message: transcript,
        channel: "voice",
        transcript,
      });

      if (answer) {
        voice.speak(answer);
      }
    },
  });

  const sendTextMessage = () => {
    startTransition(async () => {
      const currentMessage = message;
      setMessage("");
      await submitMessage({
        message: currentMessage,
        channel: "text",
      });
    });
  };

  const renameConversation = (id: string) => {
    const nextTitle = window.prompt("Novo titulo da conversa:");
    if (!nextTitle) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: nextTitle }),
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error || "Falha ao renomear conversa.");
        return;
      }
      setRenamingId(null);
      router.refresh();
    });
  };

  const deleteCurrentConversation = (id: string) => {
    startTransition(async () => {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error || "Falha ao excluir conversa.");
        return;
      }
      toast.success("Conversa removida.");
      setMessages([]);
      setConversationId(undefined);
      router.push("/chat");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[290px_1fr_360px]">
      <div className="space-y-6">
        <HologramCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">Historico</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Conversas</h3>
            </div>
            <Button size="sm" variant="secondary" onClick={() => router.refresh()}>
              Atualizar
            </Button>
          </div>

          <div className="space-y-3">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className="w-full rounded-2xl border border-white/8 bg-white/4 p-4 text-left transition hover:border-cyan-300/20 hover:bg-white/7"
                onClick={() => {
                  setConversationId(conversation.id);
                  router.push(`/chat?conversation=${conversation.id}`);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {conversation.titulo || "Conversa sem titulo"}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                      {formatDate(conversation.updated_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className="rounded-full border border-white/8 p-2 text-slate-300"
                      onClick={(event) => {
                        event.stopPropagation();
                        setRenamingId(conversation.id);
                        renameConversation(conversation.id);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </span>
                    <span
                      className="rounded-full border border-red-500/20 p-2 text-red-200"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteCurrentConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </HologramCard>

        <AgentPanel agents={agents} />
      </div>

      <div className="space-y-6">
        <HologramCard className="space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <OrbCore state={voice.orbState} />
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">
                  Conversa Principal
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Chat com cerebro contextual
                </h3>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={voice.listening ? "danger" : "secondary"}
                onClick={() => (voice.listening ? voice.stop() : voice.start())}
                disabled={!voice.supported}
              >
                {voice.listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {voice.listening ? "Encerrar escuta" : "Conversar por voz"}
              </Button>
              <Button variant="ghost" onClick={voice.toggleMute}>
                {voice.muted ? <MicOff className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {voice.muted ? "Audio desligado" : "Audio ligado"}
              </Button>
              {conversationId ? (
                <Button
                  variant="ghost"
                  onClick={() => renameConversation(conversationId)}
                  disabled={isPending && renamingId === conversationId}
                >
                  <Pencil className="h-4 w-4" />
                  Renomear
                </Button>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-slate-950/65 p-4">
            <div className="glass-scroll max-h-[520px] space-y-4 overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/12 bg-white/4 p-6 text-sm text-slate-400">
                  Nenhuma mensagem ainda. Envie um prompt ou use a captura de voz.
                </div>
              ) : null}

              {messages.map((item) => (
                <div
                  key={`${item.id}-${item.created_at}`}
                  className={`flex ${item.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-[26px] px-4 py-3 text-sm leading-7 ${
                      item.role === "assistant"
                        ? "border border-cyan-300/15 bg-cyan-400/10 text-slate-100"
                        : "border border-white/10 bg-white/7 text-slate-100"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      {item.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : null}
                      {item.role}
                    </div>
                    <p>{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <Input
                placeholder="Pergunte ao KAIROS sobre projetos, clientes, memoria ou documentos..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendTextMessage();
                  }
                }}
              />
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                  Transcricao realtime
                </p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <span>{voiceTranscript || "Aguardando fala..."}</span>
                  <VoiceVisualizer active={voice.listening} />
                </div>
              </div>
            </div>
            <Button className="h-full min-h-12" onClick={sendTextMessage} disabled={isPending}>
              <Send className="h-4 w-4" />
              Enviar
            </Button>
          </div>
        </HologramCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <MemoryPanel memories={memories.map((item) => ({ ...item, created_at: "", updated_at: "", ativo: true, importancia: 0, profile_id: "", id: item.id }))} />
          <CommandConsole
            lines={[
              `voice.supported = ${voice.supported}`,
              `voice.listening = ${voice.listening}`,
              `context.instructions = ${context.instructions.length}`,
              `context.memories = ${context.memories.length}`,
              `context.documents = ${context.documents.length}`,
            ]}
          />
        </div>
      </div>

      <div className="space-y-6">
        <ContextPanel
          instructions={context.instructions}
          memories={context.memories}
          documents={context.documents}
          tokens={context.tokens}
          model={context.model}
          latency={context.latency}
        />

        <div className="fixed bottom-4 right-4 z-20 w-[320px] xl:hidden">
          <HologramCard className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <OrbCore size="sm" state={voice.orbState} />
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                    Assistente flutuante
                  </p>
                  <p className="text-sm text-slate-300">{voiceTranscript || "Modo compacto"}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 p-2"
                onClick={() => router.push("/chat")}
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => (voice.listening ? voice.stop() : voice.start())}
              >
                <Mic className="h-4 w-4" />
                Voz
              </Button>
              <Button variant="ghost" className="flex-1" onClick={voice.interrupt}>
                Interromper
              </Button>
            </div>
          </HologramCard>
        </div>
      </div>
    </div>
  );
}
