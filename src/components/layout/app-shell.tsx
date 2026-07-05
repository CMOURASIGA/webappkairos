"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Mic, Plus, Search } from "lucide-react";
import { useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { navigation } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { OrbCore } from "@/components/kairos/orb-core";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface AppShellProps {
  children: React.ReactNode;
  profileName: string;
}

export function AppShell({ children, profileName }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const signOut = () => {
    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      toast.success("Sessao encerrada");
      router.replace("/login");
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,174,239,0.18),transparent_26%),linear-gradient(180deg,#050A18_0%,#040816_60%,#020611_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1800px] gap-4 px-4 py-4 lg:px-6">
        <aside className="hidden w-[280px] shrink-0 flex-col rounded-[32px] border border-white/10 bg-slate-950/65 p-5 shadow-[0_20px_70px_rgba(2,12,27,0.55)] backdrop-blur-xl lg:flex">
          <div className="flex items-center gap-4">
            <OrbCore size="sm" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">
                KAIROS AGENT
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">{profileName}</h2>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-cyan-400/15 bg-cyan-400/8 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">
              Presence Layer
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Estado operacional sincronizado entre chat, contexto, voz e memoria.
            </p>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-2">
            {navigation.map((item, index) => {
              const active = pathname === item.href;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                      active
                        ? "border border-cyan-300/25 bg-cyan-400/12 text-white shadow-[0_0_28px_rgba(0,229,255,0.15)]"
                        : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full justify-start rounded-2xl"
              onClick={() => router.push("/chat")}
            >
              <Plus className="h-4 w-4" />
              Nova conversa
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-2xl"
              onClick={signOut}
              disabled={isPending}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="rounded-[32px] border border-white/10 bg-slate-950/55 p-4 shadow-[0_16px_55px_rgba(2,12,27,0.45)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                  Command Center
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Presenca, contexto e memoria em uma mesma interface
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  <Search className="h-4 w-4" />
                  Busca semantica ativa
                </div>
                <div className="flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/8 px-4 py-2 text-sm text-cyan-100">
                  <Mic className="h-4 w-4" />
                  Modo voz habilitado
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
