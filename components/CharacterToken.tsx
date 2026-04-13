"use client";

import { StrengthBar } from "./StrengthBar";
import { CharacterTokenProps } from "@/components/types";
import { TEAM_COLORS, TEAM_ICON } from "@/constants/team";

const COMPLEXITY_DOTS = (n: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      style={{
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: i < n ? "#b8965a" : "#2a2a3a",
        display: "inline-block",
        marginRight: 1,
      }}
    />
  ));

export function CharacterToken({
  character,
  selected = false,
  onToggle,
  onDetail,
  effectiveStrength,
  compact = false,
  countersOnScript = 0,
}: CharacterTokenProps) {
  const colors = TEAM_COLORS[character.team] ?? TEAM_COLORS.townsfolk;
  const hasEnrichment = !!character.stAdvice;

  return (
    <div
      style={{
        background: selected ? colors.bg : "var(--bg-surface)",
        border: `1px solid ${selected ? colors.border : "#2a2a3a"}`,
        borderRadius: 8,
        padding: compact ? "6px 8px" : "8px 10px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        opacity: hasEnrichment ? 1 : 0.7,
      }}
      onClick={() => onDetail(character.id)}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: icon + name + complexity */}
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ fontSize: compact ? 12 : 14 }}>{TEAM_ICON[character.team] ?? "?"}</span>
          <div className="min-w-0">
            <div
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: compact ? 11 : 12,
                color: colors.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {character.name}
            </div>
            {!compact && (
              <div style={{ marginTop: 2 }}>{COMPLEXITY_DOTS(character.stComplexity ?? 2)}</div>
            )}
          </div>
        </div>

        {/* Counter badge */}
        {countersOnScript > 0 && (
          <span
            title={`${countersOnScript} counter${countersOnScript !== 1 ? "s" : ""} on this script`}
            style={{
              background: "#2a1a0a",
              border: "1px solid #7a5a00",
              borderRadius: 3,
              padding: "1px 4px",
              fontSize: 9,
              color: "#b8965a",
              fontFamily: "var(--font-jetbrains)",
              flexShrink: 0,
            }}
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
          style={{
            background: selected ? colors.border : "#2a2a3a",
            border: "none",
            borderRadius: 4,
            color: selected ? "#fff" : "#888",
            cursor: "pointer",
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
          }}
          title={selected ? "Remove from script" : "Add to script"}
        >
          {selected ? "−" : "+"}
        </button>
      </div>

      {/* Strength bar */}
      {!compact && character.strength?.composite !== undefined && (
        <div style={{ marginTop: 6 }}>
          <StrengthBar
            value={character.strength.composite}
            effectiveValue={effectiveStrength}
            small
          />
        </div>
      )}
    </div>
  );
}
