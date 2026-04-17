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
        <span className="text-dim text-3xs font-mono tracking-[0.05em] uppercase">{label}</span>
        <span className="text-3xs font-mono" style={{ color }}>
          {value}
          {suffix}
        </span>
      </div>
      <div className="bg-panel-dark h-0.75 overflow-hidden rounded-xs">
        <div className="h-full rounded-xs" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
