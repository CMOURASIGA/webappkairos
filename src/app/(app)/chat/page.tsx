import { PageIntro } from "@/components/common/page-intro";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { loadChatPage } from "@/services/server-loaders";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const params = await searchParams;
  const { conversations, messages, memories, instructions, documents, agents, activeConversation } =
    await loadChatPage(params.conversation);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Chat"
        title="Conversa contextual e voz realtime"
        description="Fluxo unico para texto e voz, sempre consultando orientacoes, memorias, documentos e historico antes da resposta."
        badge="RAG + Voice"
      />

      <ChatWorkspace
        conversations={conversations}
        initialMessages={messages}
        initialContext={{
          instructions: instructions.slice(0, 6).map((item) => item.titulo),
          memories: memories.slice(0, 6).map((item) => item.titulo || item.tipo || "Memoria"),
          documents: documents.slice(0, 6).map((item) => item.nome_arquivo),
        }}
        memories={memories}
        agents={agents}
        activeConversationId={activeConversation?.id ?? conversations[0]?.id}
      />
    </div>
  );
}
