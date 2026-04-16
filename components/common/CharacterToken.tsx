"use client";

import { CharacterTokenProps } from "@/types";
import { StrengthBar } from "./StrengthBar";
import { TEAM_COLORS } from "@/constants/team";
import { CharacterIcon } from "@/components/ui/CharacterIcon";

const COMPLEXITY_DOTS = (n: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className="mr-px inline-block size-1 rounded-full"
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
        compact ? "px-2 py-1.5" : "px-2.5 py-2",
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
        <div className="flex min-w-0 items-center gap-2.5">
          <CharacterIcon
            characterId={character.id}
            edition={character.edition}
            team={character.team}
            alt={character.name}
            variant="token"
            className={compact ? "size-7 shrink-0" : "size-8 shrink-0"}
          />
          <div className="min-w-0">
            <div
              className={["font-display truncate", compact ? "text-xs" : "text-sm"].join(" ")}
              style={{ color: colors.text }}
            >
              {character.name}
            </div>
            {!compact && <div className="mt-0.5">{COMPLEXITY_DOTS(character.stComplexity ?? 2)}</div>}
          </div>
        </div>

        {/* Counter badge */}
        {countersOnScript > 0 && (
          <span
            title={`${countersOnScript} counter${countersOnScript !== 1 ? "s" : ""} on this script`}
            className="text-gold text-3xs shrink-0 rounded-[3px] border border-[#7a5a00] bg-[#2a1a0a] px-1 py-px font-mono"
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
            "text-md flex size-5.5 shrink-0 cursor-pointer items-center justify-center rounded border-none",
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
        <div className="mt-1.5">
          <StrengthBar value={character.strength.composite} effectiveValue={effectiveStrength} small />
        </div>
      )}
    </div>
  );
}
