import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-14 rounded-full border transition",
        checked
          ? "border-cyan-300/60 bg-cyan-400/25"
          : "border-white/10 bg-white/8",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white transition",
          checked ? "left-7" : "left-0.5",
        )}
      />
    </button>
  );
}
