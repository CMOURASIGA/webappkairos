import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function PageIntro({
  eyebrow,
  title,
  description,
  badge,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-slate-950/55 p-6 shadow-[0_16px_55px_rgba(2,12,27,0.45)] backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">{eyebrow}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-3xl font-semibold text-white">{title}</h2>
          {badge ? <Badge>{badge}</Badge> : null}
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
