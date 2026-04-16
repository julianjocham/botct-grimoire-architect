"use client";

export function SubDimBar({
  label,
  value,
  min,
  max,
  color,
  suffix = "",
  tooltip
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  color: string;
  suffix?: string;
  tooltip: string;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div title={tooltip}>
      <div className="mb-0.5 flex justify-between">
        <span className="text-dim font-mono text-[9px] tracking-[0.05em] uppercase">{label}</span>
        <span className="font-mono text-[9px]" style={{ color }}>
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-[3px] overflow-hidden rounded-[2px] bg-[#1a1a2a]">
        <div className="h-full rounded-[2px]" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
