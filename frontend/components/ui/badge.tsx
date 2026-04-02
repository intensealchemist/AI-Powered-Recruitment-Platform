import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full",
        "bg-white/[0.07] border border-white/[0.1]",
        "px-2.5 py-0.5 text-xs font-medium text-slate-300",
        "leading-5",
        className,
      )}
      {...props}
    />
  );
}
