import { cache } from "react";

import { ensureProfile, getAuthenticatedUser } from "@/services/auth";
import {
  getAgents,
  getAgentExecutions,
  getAgentSettings,
  getConversation,
  getConversationMessages,
  getConversations,
  getDashboardBundle,
  getDocuments,
  getInstructions,
  getMemories,
  getProjects,
} from "@/services/data";

export const loadAppContext = cache(async () => {
  const user = await getAuthenticatedUser();
  const profile = await ensureProfile(user);
  return { user, profile };
});

export async function loadDashboardPage() {
  const { profile } = await loadAppContext();
  const bundle = await getDashboardBundle(profile);
  return { profile, ...bundle };
}

export async function loadChatPage(conversationId?: string) {
  const { profile } = await loadAppContext();
  const [conversations, memories, instructions, documents, agents] = await Promise.all([
    getConversations(profile.id),
    getMemories(profile.id),
    getInstructions(profile.id),
    getDocuments(profile.id),
    getAgents(profile.id),
  ]);

  const selectedConversation =
    conversationId ? await getConversation(profile.id, conversationId) : null;
  const activeConversation = selectedConversation ?? conversations[0];
  const messages = activeConversation
    ? await getConversationMessages(activeConversation.id)
    : [];

  return {
    profile,
    conversations,
    activeConversation,
    messages,
    memories,
    instructions,
    documents,
    agents,
  };
}

export async function loadMemoriesPage() {
  const { profile } = await loadAppContext();
  const memories = await getMemories(profile.id);
  return { profile, memories };
}

export async function loadInstructionsPage() {
  const { profile } = await loadAppContext();
  const instructions = await getInstructions(profile.id);
  return { profile, instructions };
}

export async function loadDocumentsPage() {
  const { profile } = await loadAppContext();
  const documents = await getDocuments(profile.id);
  return { profile, documents };
}

export async function loadProjectsPage() {
  const { profile } = await loadAppContext();
  const projects = await getProjects(profile.id);
  return { profile, projects };
}

export async function loadAgentsPage() {
  const { profile } = await loadAppContext();
  const agents = await getAgents(profile.id);
  return { profile, agents };
}

export async function loadSettingsPage() {
  const { profile } = await loadAppContext();
  const [settings, executions, agents] = await Promise.all([
    getAgentSettings(profile.id),
    getAgentExecutions(profile.id),
    getAgents(profile.id),
  ]);
  return { profile, settings, executions, agents };
}
