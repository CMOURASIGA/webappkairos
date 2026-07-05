"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { OrbState } from "@/types/domain";

const stateMap: Record<OrbState, string> = {
  Idle: "from-cyan-300/70 via-blue-500/35 to-cyan-500/60",
  Listening: "from-cyan-200 via-sky-400/50 to-cyan-500/70",
  Thinking: "from-cyan-300 via-indigo-500/70 to-blue-700/80",
  Searching: "from-sky-300 via-cyan-500/60 to-blue-500/80",
  Answering: "from-cyan-100 via-cyan-400/80 to-blue-500/70",
  Learning: "from-emerald-300 via-cyan-400/60 to-blue-500/70",
  Error: "from-red-300 via-orange-500/70 to-red-700/75",
};

export function OrbCore({
  state = "Idle",
  size = "md",
}: {
  state?: OrbState;
  size?: "sm" | "md" | "lg";
}) {
  const dimension = size === "sm" ? "h-24 w-24" : size === "lg" ? "h-52 w-52" : "h-36 w-36";

  return (
    <div className={cn("relative grid place-items-center", dimension)}>
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.06, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br opacity-80 blur-md",
          stateMap[state],
        )}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute inset-3 rounded-full border border-cyan-300/30"
      />
      <motion.div
        animate={{ scale: [0.94, 1.02, 0.94], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "relative h-2/3 w-2/3 rounded-full bg-gradient-to-br shadow-[0_0_60px_rgba(0,229,255,0.32)]",
          stateMap[state],
        )}
      >
        <div className="absolute inset-4 rounded-full border border-white/15 bg-slate-950/20" />
      </motion.div>
    </div>
  );
}
