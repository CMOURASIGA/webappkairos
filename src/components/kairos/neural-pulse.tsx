"use client";

import { motion } from "framer-motion";

export function NeuralPulse() {
  return (
    <div className="relative h-28 overflow-hidden rounded-[24px] border border-cyan-400/15 bg-slate-950/70">
      <motion.div
        animate={{ x: ["-10%", "110%"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 h-full w-28 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.35),transparent_70%)] blur-md"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,229,255,0.06),transparent)]" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-300/20" />
      <div className="absolute inset-x-4 bottom-4 text-xs uppercase tracking-[0.28em] text-cyan-200/80">
        Neural Pulse
      </div>
    </div>
  );
}
