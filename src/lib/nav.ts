import type { Route } from "next";
import {
  Bot,
  BrainCircuit,
  FileStack,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Sparkles,
  WalletCards,
} from "lucide-react";

export const navigation = [
  {
    href: "/dashboard" as Route,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/chat" as Route,
    label: "Chat",
    icon: MessagesSquare,
  },
  {
    href: "/memories" as Route,
    label: "Memorias",
    icon: BrainCircuit,
  },
  {
    href: "/instructions" as Route,
    label: "Orientacoes",
    icon: Sparkles,
  },
  {
    href: "/documents" as Route,
    label: "Documentos",
    icon: FileStack,
  },
  {
    href: "/projects" as Route,
    label: "Projetos",
    icon: WalletCards,
  },
  {
    href: "/agents" as Route,
    label: "Especialistas",
    icon: Bot,
  },
  {
    href: "/settings" as Route,
    label: "Configuracoes",
    icon: Settings,
  },
];
