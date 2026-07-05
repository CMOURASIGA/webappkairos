import { HologramCard } from "@/components/ui/hologram-card";

export function CommandConsole({ lines }: { lines: string[] }) {
  return (
    <HologramCard className="space-y-2">
      <div className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">
        Command Console
      </div>
      <div className="space-y-2 font-mono text-xs text-slate-300">
        {lines.map((line) => (
          <div key={line} className="rounded-xl bg-white/4 px-3 py-2">
            {line}
          </div>
        ))}
      </div>
    </HologramCard>
  );
}
