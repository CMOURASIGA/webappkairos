"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function VoiceVisualizer({ active = false }: { active?: boolean }) {
  return (
    <div className="flex h-10 items-end gap-1">
      {Array.from({ length: 12 }).map((_, index) => (
        <motion.span
          key={index}
          animate={
            active
              ? { height: [12, 30 - (index % 4) * 4, 10 + (index % 5) * 3] }
              : { height: 10 }
          }
          transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.04 }}
          className={cn(
            "w-1.5 rounded-full bg-cyan-300/80",
            !active && "opacity-30",
          )}
        />
      ))}
    </div>
  );
}
