import { LucideIcon } from "lucide-react";

import { HologramCard } from "@/components/ui/hologram-card";

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <HologramCard className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">{label}</p>
        <Icon className="h-5 w-5 text-cyan-300" />
      </div>
      <div>
        <p className="font-display text-4xl text-white">{value}</p>
        <p className="mt-2 text-sm text-slate-400">{hint}</p>
      </div>
    </HologramCard>
  );
}
