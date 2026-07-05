"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertTriangle, KeyRound, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HologramCard } from "@/components/ui/hologram-card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { OrbCore } from "@/components/kairos/orb-core";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const bootstrapProfile = async () => {
    await fetch("/api/auth/bootstrap", { method: "POST" });
  };

  const login = () => {
    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          toast.error("Credenciais invalidas. Verifique email e senha.");
          return;
        }

        toast.error(error.message);
        return;
      }

      await bootstrapProfile();
      toast.success("Acesso liberado.");
      router.replace("/dashboard");
      router.refresh();
    });
  };

  const signUp = () => {
    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        await bootstrapProfile();
        toast.success("Conta criada e acesso liberado.");
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      toast.success("Conta criada. Confirme o email para ativar o acesso.");
    });
  };

  const resetPassword = () => {
    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Email de recuperacao enviado.");
    });
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="absolute inset-0 holographic-grid opacity-30" />
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[110px]" />
      <HologramCard className="relative w-full max-w-5xl overflow-hidden p-0">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.12),transparent_50%)] p-8 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-center py-6">
              <OrbCore size="lg" state="Listening" />
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
              Neural Access
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-white">
              Entre no nucleo operacional do KAIROS
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              Acesso ao agente pessoal com memoria persistente, documentos indexados,
              recomendacoes e conversacao por voz.
            </p>

            <div className="mt-8 space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                <Mail className="h-4 w-4 text-cyan-300" />
                Login com email e senha do Supabase Auth.
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                <KeyRound className="h-4 w-4 text-cyan-300" />
                Perfil criado automaticamente na primeira sessao valida.
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                <AlertTriangle className="h-4 w-4 text-cyan-300" />
                Variaveis do `.env.local` sao respeitadas com fallback seguro.
              </div>
            </div>
          </div>

          <div className="space-y-6 p-8 lg:p-10">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">
                Authentication
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Acesso controlado</h2>
            </div>

            <div className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Email</span>
                <Input
                  type="email"
                  placeholder="christian@empresa.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Senha</span>
                <Input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={login} disabled={isPending}>
                Entrar no KAIROS
              </Button>
              <Button variant="secondary" onClick={signUp} disabled={isPending}>
                Criar conta
              </Button>
              <Button variant="secondary" onClick={resetPassword} disabled={isPending || !email}>
                Esqueci minha senha
              </Button>
            </div>
          </div>
        </div>
      </HologramCard>
    </div>
  );
}
