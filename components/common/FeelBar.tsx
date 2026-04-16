"use client";

import { FEEL_COLOR } from "@/constants/info";

export function FeelBar({
  label,
  value,
  levelMap,
  maxBars = 4
}: {
  label: string;
  value: string;
  levelMap: Record<string, number>;
  maxBars?: number;
}) {
  const color = FEEL_COLOR[value] ?? "#b8965a";
  const filled = levelMap[value] ?? 0;

  return (
    <div className="flex flex-col items-center gap-[3px]">
      <span className="text-muted font-mono text-[9px] tracking-[0.08em] whitespace-nowrap uppercase">{label}</span>
      <div className="flex gap-[2px]">
        {Array.from({ length: maxBars }, (_, i) => (
          <div key={i} className="h-2 w-2 rounded-[1px]" style={{ background: i <= filled ? color : "#2a2a3a" }} />
        ))}
      </div>
      <span className="font-display text-[9px] whitespace-nowrap" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
