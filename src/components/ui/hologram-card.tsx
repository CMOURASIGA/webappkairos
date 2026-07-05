import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function HologramCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,14,28,0.82))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_16px_60px_rgba(2,12,27,0.55)] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
