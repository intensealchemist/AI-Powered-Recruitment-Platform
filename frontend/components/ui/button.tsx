"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-full font-semibold text-sm",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.97] cursor-pointer select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--primary)] text-white",
          "shadow-[0_0_22px_rgba(99,102,241,0.32)]",
          "hover:bg-[var(--primary-light)] hover:-translate-y-0.5",
          "hover:shadow-[0_0_36px_rgba(99,102,241,0.48)]",
        ].join(" "),

        secondary: [
          "bg-white/[0.06] text-[var(--text-1)]",
          "border border-white/[0.1]",
          "hover:bg-white/[0.10] hover:border-white/[0.18]",
          "hover:-translate-y-0.5",
        ].join(" "),

        ghost: [
          "bg-transparent text-[var(--text-2)]",
          "hover:bg-white/[0.06] hover:text-[var(--text-1)]",
        ].join(" "),

        amber: [
          "bg-[var(--ai)] text-slate-950 font-bold",
          "shadow-[0_0_22px_rgba(251,191,36,0.28)]",
          "hover:bg-[var(--ai-light)] hover:-translate-y-0.5",
          "hover:shadow-[0_0_36px_rgba(251,191,36,0.44)]",
        ].join(" "),

        destructive: [
          "bg-rose-500/10 text-rose-400",
          "border border-rose-500/20",
          "hover:bg-rose-500/20 hover:border-rose-500/40",
        ].join(" "),
      },
      size: {
        default: "h-10 px-5",
        sm:      "h-8 px-3.5 text-xs",
        lg:      "h-12 px-7 text-base",
        icon:    "size-9 rounded-full",
        "icon-sm": "size-7 rounded-full text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export { Button, buttonVariants };
