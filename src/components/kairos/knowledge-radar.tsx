"use client";

import { motion } from "framer-motion";

export function KnowledgeRadar() {
  return (
    <div className="relative h-64 overflow-hidden rounded-[28px] border border-cyan-400/15 bg-[radial-gradient(circle_at_center,rgba(0,174,239,0.12),rgba(2,6,23,0.96)_60%)]">
      <div className="absolute inset-8 rounded-full border border-cyan-300/15" />
      <div className="absolute inset-16 rounded-full border border-cyan-300/10" />
      <div className="absolute inset-24 rounded-full border border-cyan-300/10" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-300/15" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-300/15" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 origin-center"
      >
        <div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 -translate-y-full bg-gradient-to-t from-cyan-300/0 via-cyan-300/80 to-cyan-300/0" />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.16, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.8, repeat: Infinity }}
        className="absolute left-[62%] top-[38%] h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(0,229,255,0.8)]"
      />
    </div>
  );
}
