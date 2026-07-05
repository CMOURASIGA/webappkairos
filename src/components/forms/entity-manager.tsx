"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { HologramCard } from "@/components/ui/hologram-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { formatDate } from "@/lib/utils";

type Field =
  | {
      name: string;
      label: string;
      type: "text" | "number";
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      type: "textarea";
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      type: "select";
      options: Array<{ label: string; value: string }>;
    }
  | {
      name: string;
      label: string;
      type: "boolean";
    };

export function EntityManager({
  endpoint,
  title,
  description,
  items,
  fields,
  titleField,
  descriptionField,
}: {
  endpoint: string;
  title: string;
  description: string;
  items: Array<Record<string, unknown>>;
  fields: Field[];
  titleField: string;
  descriptionField: string;
}) {
  const router = useRouter();
  const initialDraft = useMemo(() => {
    const entries = fields.map((field) => {
      if (field.type === "boolean") {
        return [field.name, true];
      }
      if (field.type === "number") {
        return [field.name, 5];
      }
      if (field.type === "select") {
        return [field.name, field.options[0]?.value ?? ""];
      }
      return [field.name, ""];
    });

    return Object.fromEntries(entries);
  }, [fields]);

  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Record<string, unknown>>(initialDraft);

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  const reset = () => setDraft(initialDraft);

  const save = () => {
    startTransition(async () => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error || "Falha ao salvar.");
        return;
      }

      toast.success("Registro salvo.");
      reset();
      router.refresh();
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      const response = await fetch(`${endpoint}/${id}`, {
        method: "DELETE",
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error || "Falha ao excluir.");
        return;
      }

      toast.success("Registro removido.");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <HologramCard className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">{title}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{description}</h3>
        </div>

        <div className="grid gap-4">
          {fields.map((field) => {
            const value = draft[field.name];

            if (field.type === "textarea") {
              return (
                <label key={field.name} className="space-y-2">
                  <span className="text-sm text-slate-300">{field.label}</span>
                  <Textarea
                    placeholder={field.placeholder}
                    value={String(value ?? "")}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                  />
                </label>
              );
            }

            if (field.type === "select") {
              return (
                <label key={field.name} className="space-y-2">
                  <span className="text-sm text-slate-300">{field.label}</span>
                  <Select
                    value={String(value ?? field.options[0]?.value ?? "")}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </label>
              );
            }

            if (field.type === "boolean") {
              return (
                <div key={field.name} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 p-4">
                  <span className="text-sm text-slate-300">{field.label}</span>
                  <Toggle
                    checked={Boolean(value)}
                    onChange={(next) => setDraft((current) => ({ ...current, [field.name]: next }))}
                  />
                </div>
              );
            }

            return (
              <label key={field.name} className="space-y-2">
                <span className="text-sm text-slate-300">{field.label}</span>
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={String(value ?? "")}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [field.name]:
                        field.type === "number"
                          ? Number(event.target.value)
                          : event.target.value,
                    }))
                  }
                />
              </label>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={save} disabled={isPending}>
            <Save className="h-4 w-4" />
            Salvar
          </Button>
          <Button variant="secondary" onClick={reset} disabled={isPending}>
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>
      </HologramCard>

      <HologramCard className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">Registros</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Persistencia ativa</h3>
        </div>

        <div className="glass-scroll max-h-[720px] space-y-3 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/12 bg-white/4 p-5 text-sm text-slate-400">
              Nenhum registro encontrado. O modulo esta pronto para receber dados.
            </div>
          ) : null}

          {items.map((item) => (
            <div key={String(item.id)} className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{String(item[titleField] ?? "-")}</p>
                  <p className="mt-2 text-xs leading-6 text-slate-400">
                    {String(item[descriptionField] ?? "Sem descricao")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
                    onClick={() => setDraft(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-red-500/20 p-2 text-red-200 transition hover:bg-red-500/12"
                    onClick={() => remove(String(item.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Atualizado em {formatDate(String(item.updated_at || item.created_at || ""))}
              </p>
            </div>
          ))}
        </div>
      </HologramCard>
    </div>
  );
}
