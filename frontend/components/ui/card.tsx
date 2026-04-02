import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-white/[0.06] bg-white/[0.03]",
        "backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.55)]",
        className,
      )}
      {...props}
    />
  );
}
