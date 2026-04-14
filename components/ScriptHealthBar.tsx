"use client";

import { ScriptHealthBarProps } from "@/components/types";
import {
  CAT_SHORT,
  CHAOS_LEVEL,
  EVIL_CATEGORIES,
  FEEL_COLOR,
  GOOD_CATEGORIES,
  INFO_LEVEL,
  LETHAL_LEVEL,
  ST_LEVEL
} from "@/constants/info";

function FeelBar({
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

export function ScriptHealthBar({ analysis }: ScriptHealthBarProps) {
  const { scriptFeel, nightComplexity, interactionHints, compositionWarnings, goodStrengthTotal, evilStrengthTotal } =
    analysis;
  const criticalCount = interactionHints.filter((h) => h.severity === "critical").length;
  const warnCount = compositionWarnings.filter((w) => w.severity !== "tip").length;

  return (
    <div className="bg-surface border-subtle flex flex-wrap items-center gap-5 rounded-[10px] border px-4 py-[10px]">
      {/* Script feel bars */}
      <div className="flex items-start gap-[14px]">
        <FeelBar label="Info" value={scriptFeel.infoLevel} levelMap={INFO_LEVEL} maxBars={4} />
        <FeelBar label="Lethal" value={scriptFeel.lethalityLevel} levelMap={LETHAL_LEVEL} maxBars={3} />
        <FeelBar label="Chaos" value={scriptFeel.chaosLevel} levelMap={CHAOS_LEVEL} maxBars={3} />
        <FeelBar label="ST Load" value={scriptFeel.stWorkload} levelMap={ST_LEVEL} maxBars={3} />
      </div>

      <div className="bg-subtle h-7 w-px shrink-0" />

      {/* Night complexity */}
      <div className="flex flex-col items-center gap-[2px]">
        <span className="text-muted font-mono text-[9px] tracking-[0.08em] uppercase">Night</span>
        <span className="font-display text-gold text-[11px]">{nightComplexity.complexityRating}</span>
        <span
          className="text-dim font-mono text-[9px]"
          title={`First night: ${nightComplexity.firstNightSteps} steps · Other nights: ${nightComplexity.otherNightSteps} steps`}
        >
          {nightComplexity.firstNightSteps}↓ {nightComplexity.otherNightSteps}↻
        </span>
      </div>

      <div className="bg-subtle h-7 w-px shrink-0" />

      {/* Strength totals */}
      <div className="flex flex-col gap-[2px]">
        <div className="flex items-center gap-2">
          <span className="text-good-blue font-mono text-[9px] uppercase">Good</span>
          <span className="text-good-blue font-mono text-[11px]">
            {goodStrengthTotal > 0 ? "+" : ""}
            {goodStrengthTotal}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blood-light font-mono text-[9px] uppercase">Evil</span>
          <span className="text-blood-light font-mono text-[11px]">{evilStrengthTotal}</span>
        </div>
      </div>

      <div className="bg-subtle h-7 w-px shrink-0" />

      {/* Warnings badges */}
      <div className="flex gap-[6px]">
        {criticalCount > 0 && (
          <span className="bg-blood text-parchment font-display rounded-[10px] px-2 py-[2px] text-[11px]">
            ⚠ {criticalCount} critical
          </span>
        )}
        {warnCount > 0 && (
          <span className="text-parchment font-display rounded-[10px] bg-[#5a4000] px-2 py-[2px] text-[11px]">
            ⚡ {warnCount} warnings
          </span>
        )}
        {criticalCount === 0 && warnCount === 0 && (
          <span className="text-dim font-body text-[11px]">No critical issues</span>
        )}
      </div>

      {/* Category coverage */}
      <div className="flex flex-wrap gap-1">
        {GOOD_CATEGORIES.map((cat) => {
          const present = !!analysis.categoryCoverage.good[cat];
          return (
            <span
              key={cat}
              title={present ? (analysis.categoryCoverage.good[cat] ?? []).join(", ") : `Missing: ${cat}`}
              className={[
                "cursor-default rounded-[3px] border px-[5px] py-[2px] font-mono text-[9px]",
                present ? "border-[#2d6a4f] bg-[#0d2a1a] text-[#4a9a6a]" : "text-dimmer border-[#2a2a2a] bg-[#1a1a1a]"
              ].join(" ")}
            >
              {present ? "✓" : "✗"} {CAT_SHORT[cat] ?? cat}
            </span>
          );
        })}
        {EVIL_CATEGORIES.map((cat) => {
          const present = !!analysis.categoryCoverage.evil[cat];
          return (
            <span
              key={cat}
              title={present ? (analysis.categoryCoverage.evil[cat] ?? []).join(", ") : `Missing: ${cat}`}
              className={[
                "cursor-default rounded-[3px] border px-[5px] py-[2px] font-mono text-[9px]",
                present ? "border-[#6a2d2d] bg-[#2a0d0d] text-[#c0604a]" : "text-dimmer border-[#2a2a2a] bg-[#1a1a1a]"
              ].join(" ")}
            >
              {present ? "✓" : "✗"} {CAT_SHORT[cat] ?? cat}
            </span>
          );
        })}
      </div>
    </div>
  );
}
