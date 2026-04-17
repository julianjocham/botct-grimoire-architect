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
    <div className="flex flex-col items-center gap-0.75">
      <span className="text-muted text-3xs font-mono tracking-[0.08em] whitespace-nowrap uppercase">{label}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: maxBars }, (_, i) => (
          <div
            key={i}
            className="size-2 rounded-[1px]"
            style={{ background: i <= filled ? color : "var(--border-subtle)" }}
          />
        ))}
      </div>
      <span className="font-display text-3xs whitespace-nowrap" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
