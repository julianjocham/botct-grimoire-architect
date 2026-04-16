"use client";

import { StrengthBarProps } from "@/types";

function getBarColor(value: number): string {
  if (value >= 40) return "#2a7fd4";
  if (value >= 10) return "#3a6abf";
  if (value >= -10) return "#555577";
  if (value >= -40) return "#8b2222";
  return "#c0392b";
}

export function StrengthBar({ value, showNumber = true, effectiveValue, small = false }: StrengthBarProps) {
  const displayValue = effectiveValue ?? value;
  const barWidth = `${Math.abs(displayValue)}%`;
  const isPositive = displayValue >= 0;
  const color = getBarColor(displayValue);

  return (
    <div className={`flex items-center gap-1 ${small ? "gap-0.5" : ""}`}>
      {/* Negative side */}
      <div className={`flex flex-1 justify-end ${small ? "h-1" : "h-1.5"}`}>
        <div
          className="h-full rounded-l-[2px] transition-[width] duration-200 ease-in-out"
          style={{
            width: !isPositive ? barWidth : "0%",
            background: color
          }}
        />
      </div>

      {/* Center line */}
      <div className={`w-px shrink-0 bg-[#3a3a4a] ${small ? "h-2" : "h-2.5"}`} />

      {/* Positive side */}
      <div className={`flex-1 ${small ? "h-1" : "h-1.5"}`}>
        <div
          className="h-full rounded-r-[2px] transition-[width] duration-200 ease-in-out"
          style={{
            width: isPositive ? barWidth : "0%",
            background: color
          }}
        />
      </div>

      {showNumber && (
        <span className={`min-w-8 text-right font-mono ${small ? "text-[10px]" : "text-[11px]"}`} style={{ color }}>
          {displayValue > 0 ? "+" : ""}
          {displayValue}
        </span>
      )}
    </div>
  );
}
