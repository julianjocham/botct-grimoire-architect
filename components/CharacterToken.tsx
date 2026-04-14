"use client";

import { StrengthBar } from "./StrengthBar";
import { CharacterTokenProps } from "@/components/types";
import { TEAM_COLORS, TEAM_ICON } from "@/constants/team";

const COMPLEXITY_DOTS = (n: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className="mr-[1px] inline-block h-1 w-1 rounded-full"
      style={{ background: i < n ? "#b8965a" : "#2a2a3a" }}
    />
  ));

export function CharacterToken({
  character,
  selected = false,
  onToggle,
  onDetail,
  effectiveStrength,
  compact = false,
  countersOnScript = 0
}: CharacterTokenProps) {
  const colors = TEAM_COLORS[character.team] ?? TEAM_COLORS.townsfolk;
  const hasEnrichment = !!character.stAdvice;

  return (
    <div
      className={[
        "cursor-pointer rounded-lg border transition-all duration-150",
        compact ? "px-2 py-[6px]" : "px-[10px] py-2",
        hasEnrichment ? "opacity-100" : "opacity-70"
      ].join(" ")}
      style={{
        background: selected ? colors.bg : "var(--bg-surface)",
        borderColor: selected ? colors.border : "#2a2a3a"
      }}
      onClick={() => onDetail(character.id)}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: icon + name + complexity */}
        <div className="flex min-w-0 items-center gap-2">
          <span className={compact ? "text-[12px]" : "text-[14px]"}>{TEAM_ICON[character.team] ?? "?"}</span>
          <div className="min-w-0">
            <div
              className={[
                "font-display overflow-hidden text-ellipsis whitespace-nowrap",
                compact ? "text-[11px]" : "text-[12px]"
              ].join(" ")}
              style={{ color: colors.text }}
            >
              {character.name}
            </div>
            {!compact && <div className="mt-[2px]">{COMPLEXITY_DOTS(character.stComplexity ?? 2)}</div>}
          </div>
        </div>

        {/* Counter badge */}
        {countersOnScript > 0 && (
          <span
            title={`${countersOnScript} counter${countersOnScript !== 1 ? "s" : ""} on this script`}
            className="text-gold shrink-0 rounded-[3px] border border-[#7a5a00] bg-[#2a1a0a] px-1 py-[1px] font-mono text-[9px]"
          >
            ⚔ {countersOnScript}
          </span>
        )}

        {/* Right: add/remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(character.id);
          }}
          className={[
            "flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center rounded border-none text-[14px]",
            selected ? "text-white" : "text-[#888]"
          ].join(" ")}
          style={{ background: selected ? colors.border : "#2a2a3a" }}
          title={selected ? "Remove from script" : "Add to script"}
        >
          {selected ? "−" : "+"}
        </button>
      </div>

      {/* Strength bar */}
      {!compact && character.strength?.composite !== undefined && (
        <div className="mt-[6px]">
          <StrengthBar value={character.strength.composite} effectiveValue={effectiveStrength} small />
        </div>
      )}
    </div>
  );
}
