import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const baseInput = [
  "w-full rounded-[12px]",
  "border border-white/[0.08] bg-white/[0.04]",
  "px-4 text-sm text-slate-100 placeholder:text-slate-500",
  "outline-none caret-[var(--primary)]",
  "transition-all duration-200",
  "focus:border-[var(--primary)] focus:bg-white/[0.07]",
  "focus:shadow-[0_0_0_3px_rgba(99,102,241,0.18),0_0_16px_rgba(99,102,241,0.1)]",
  "disabled:opacity-40 disabled:cursor-not-allowed",
].join(" ");

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(baseInput, "h-11", className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(baseInput, "min-h-[100px] py-3 leading-relaxed resize-none", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";
