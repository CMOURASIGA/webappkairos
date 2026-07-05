import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-medium transition duration-300 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-cyan-400/40 bg-cyan-400/15 px-5 py-2.5 text-cyan-50 shadow-[0_0_28px_rgba(0,229,255,0.16)] hover:border-cyan-300/70 hover:bg-cyan-300/20",
        secondary:
          "border-white/10 bg-white/5 px-5 py-2.5 text-slate-200 hover:border-white/20 hover:bg-white/8",
        ghost:
          "border-transparent bg-transparent px-4 py-2 text-slate-300 hover:bg-white/6 hover:text-white",
        danger:
          "border-red-500/35 bg-red-500/15 px-5 py-2.5 text-red-100 hover:bg-red-500/20",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);

Button.displayName = "Button";
