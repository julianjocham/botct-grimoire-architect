import { StrengthBarProps } from "@/types";
import { cn } from "@/lib/cn";

function getBarColor(value: number): string {
  if (value >= 40) return "var(--strength-good)";
  if (value >= 10) return "var(--good-blue-light)";
  if (value >= -10) return "var(--strength-neutral)";
  if (value >= -40) return "var(--strength-evil)";
  return "var(--strength-evil-strong)";
}

export function StrengthBar({ value, showNumber = true, effectiveValue, small = false }: StrengthBarProps) {
  const displayValue = effectiveValue ?? value;
  const barWidth = `${Math.abs(displayValue)}%`;
  const isPositive = displayValue >= 0;
  const color = getBarColor(displayValue);

  return (
    <div className={cn("flex items-center", small ? "gap-0.5" : "gap-1")}>
      <div className={cn("flex flex-1 justify-end", small ? "h-1" : "h-1.5")}>
        <div
          className="h-full rounded-l-xs transition-[width] duration-200 ease-in-out"
          style={{ width: !isPositive ? barWidth : "0%", background: color }}
        />
      </div>

      <div className={cn("bg-faint w-px shrink-0", small ? "h-2" : "h-2.5")} />

      <div className={cn("flex-1", small ? "h-1" : "h-1.5")}>
        <div
          className="h-full rounded-r-xs transition-[width] duration-200 ease-in-out"
          style={{ width: isPositive ? barWidth : "0%", background: color }}
        />
      </div>

      {showNumber && (
        <span className={cn("min-w-8 text-right font-mono", small ? "text-2xs" : "text-xs")} style={{ color }}>
          {displayValue > 0 ? "+" : ""}
          {displayValue}
        </span>
      )}
    </div>
  );
}
