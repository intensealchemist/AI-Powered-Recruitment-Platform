import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  showValue?: boolean;
  label?: string;
}

export function Progress({ value, className, showValue, label }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          {label && <span>{label}</span>}
          {showValue && <span className="font-mono tabular-nums">{clamped}%</span>}
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full progress-shimmer transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
