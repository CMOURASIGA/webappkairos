"use client";

import { motion } from "framer-motion";

export function ThinkingAnimation() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
          transition={{ delay: index * 0.12, duration: 1, repeat: Infinity }}
          className="h-2 w-2 rounded-full bg-cyan-300"
        />
      ))}
    </div>
  );
}
