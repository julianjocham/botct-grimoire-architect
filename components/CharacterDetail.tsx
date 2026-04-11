"use client";

import { Character } from "@/lib/types";
import { EffectiveStrength } from "@/lib/types";
import { StrengthBar } from "./StrengthBar";

interface CharacterDetailProps {
  character: Character;
  effectiveStrength: EffectiveStrength;
  allCharacters: Character[];
  selectedIds: string[];
  onClose: () => void;
  onToggle: (id: string) => void;
  onNavigate: (id: string) => void;
}

const COMPLEXITY_LABEL = ["", "Passive", "Simple", "Recurring", "State-tracking", "Multi-state"];

function SubDimBar({
  label,
  value,
  min,
  max,
  color,
  suffix = "",
  tooltip,
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
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: 9,
            color: "#555",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 9, color }}>
          {value}
          {suffix}
        </span>
      </div>
      <div style={{ height: 3, background: "#1a1a2a", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

export function CharacterDetail({
  character,
  effectiveStrength,
  allCharacters,
  selectedIds,
  onClose,
  onToggle,
  onNavigate,
}: CharacterDetailProps) {
  const isSelected = selectedIds.includes(character.id);
  const { baseStrength, modifier, effectiveStrength: eff, reasons } = effectiveStrength;

  // Fun interactions: characters NOT on script that interact with this one
  const countersOnScript = character.counters
    .map((id) => allCharacters.find((c) => c.id === id))
    .filter((c) => c && selectedIds.includes(c.id)) as Character[];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: 340,
        background: "#0f0f1a",
        border: "1px solid #2a2a3a",
        borderRight: "none",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #2a2a3a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: 15,
              color: "#e8dcc8",
              marginBottom: 2,
            }}
          >
            {character.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-garamond)",
              fontSize: 12,
              color: "#666",
              textTransform: "capitalize",
            }}
          >
            {character.team} · {character.edition?.toUpperCase() || "Experimental"} · ST Complexity:{" "}
            {COMPLEXITY_LABEL[character.stComplexity ?? 2]}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#666",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Ability text */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: 10,
              color: "#666",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Ability
          </div>
          <div
            style={{
              fontFamily: "var(--font-garamond)",
              fontSize: 13,
              color: "#c8b89a",
              lineHeight: 1.6,
              fontStyle: "italic",
              background: "#14141f",
              border: "1px solid #2a2a3a",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            &ldquo;{character.ability}&rdquo;
          </div>
        </div>

        {/* Strength */}
        {character.strength?.composite !== undefined && (
          <div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: 10,
                color: "#666",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Strength
            </div>
            <StrengthBar value={baseStrength} effectiveValue={eff} />
            {modifier !== 0 && (
              <div
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: 10,
                  color: modifier < 0 ? "#c0392b" : "#2a7fd4",
                  marginTop: 4,
                }}
              >
                Base {baseStrength > 0 ? "+" : ""}
                {baseStrength} → {modifier > 0 ? "+" : ""}
                {modifier} (context) → {eff > 0 ? "+" : ""}
                {eff}
              </div>
            )}
            {/* Sub-dimensions */}
            {(character.strength.peakPower !== undefined ||
              character.strength.reliability !== undefined ||
              character.strength.vulnerability !== undefined) && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                {character.strength.peakPower !== undefined && (
                  <SubDimBar
                    label="Peak Power"
                    value={character.strength.peakPower}
                    min={-20}
                    max={20}
                    color={character.strength.peakPower >= 0 ? "#2a7fd4" : "#c0392b"}
                    tooltip="Maximum impact in the best-case scenario (-20 to +20)"
                  />
                )}
                {character.strength.reliability !== undefined && (
                  <SubDimBar
                    label="Reliability"
                    value={Math.round(character.strength.reliability * 100)}
                    min={0}
                    max={100}
                    color="#b8965a"
                    suffix="%"
                    tooltip="How often the ability works as intended (0–100%)"
                  />
                )}
                {character.strength.vulnerability !== undefined && (
                  <SubDimBar
                    label="Vulnerability"
                    value={Math.round(character.strength.vulnerability * 100)}
                    min={0}
                    max={100}
                    color="#c0392b"
                    suffix="%"
                    tooltip="How exposed to disruption or countering the character is (0–100%)"
                  />
                )}
                {character.strength.scalingBonus !== undefined &&
                  character.strength.scalingBonus !== 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontFamily: "var(--font-jetbrains)",
                        fontSize: 9,
                        color: "#555",
                      }}
                    >
                      <span title="Bonus or penalty in larger games">Scaling</span>
                      <span
                        style={{
                          color: character.strength.scalingBonus > 0 ? "#2a7fd4" : "#c0392b",
                        }}
                      >
                        {character.strength.scalingBonus > 0 ? "+" : ""}
                        {character.strength.scalingBonus} large games
                      </span>
                    </div>
                  )}
              </div>
            )}
            {reasons.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {reasons.map((r) => {
                  const char = allCharacters.find((c) => c.id === r.characterId);
                  const impactColor = r.impact < 0 ? "#c0392b" : "#2a7fd4";
                  return (
                    <div
                      key={r.characterId}
                      style={{
                        background: r.impact < 0 ? "#150808" : "#080d15",
                        border: `1px solid ${r.impact < 0 ? "#3a1a1a" : "#1a2a3a"}`,
                        borderRadius: 5,
                        padding: "6px 8px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: r.description ? 4 : 0 }}>
                        <button
                          onClick={() => onNavigate(r.characterId)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#b8965a",
                            cursor: "pointer",
                            padding: 0,
                            fontSize: 11,
                            fontFamily: "var(--font-cinzel)",
                            textAlign: "left",
                          }}
                        >
                          {char?.name ?? r.characterId}
                        </button>
                        <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 11, color: impactColor, flexShrink: 0, marginLeft: 8 }}>
                          {r.impact > 0 ? "+" : ""}
                          {r.impact}
                        </span>
                      </div>
                      {r.description && (
                        <div style={{ fontFamily: "var(--font-garamond)", fontSize: 12, color: "#888", lineHeight: 1.45 }}>
                          {r.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ST Advice */}
        {character.stAdvice && (
          <div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: 10,
                color: "#666",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              ST Advice
            </div>
            <div
              style={{
                fontFamily: "var(--font-garamond)",
                fontSize: 13,
                color: "#c8b89a",
                lineHeight: 1.6,
              }}
            >
              {character.stAdvice}
            </div>
          </div>
        )}

        {/* New ST Warning */}
        {character.newStWarning && (
          <div
            style={{
              background: "#1a0a00",
              border: "1px solid #5a3000",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: 10,
                color: "#d4a017",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              ⚠ New ST Warning
            </div>
            <div
              style={{
                fontFamily: "var(--font-garamond)",
                fontSize: 12,
                color: "#c8a050",
                lineHeight: 1.5,
              }}
            >
              {character.newStWarning}
            </div>
          </div>
        )}

        {/* Official ST Reminder */}
        {(character.firstNightReminder || character.otherNightReminder) && (
          <div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: 10,
                color: "#666",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Official Reminders
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {character.firstNightReminder && (
                <div
                  style={{
                    fontFamily: "var(--font-garamond)",
                    fontSize: 12,
                    color: "#888",
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ color: "#555" }}>1st: </span>
                  {character.firstNightReminder}
                </div>
              )}
              {character.otherNightReminder && (
                <div
                  style={{
                    fontFamily: "var(--font-garamond)",
                    fontSize: 12,
                    color: "#888",
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ color: "#555" }}>Other: </span>
                  {character.otherNightReminder}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Counters on this script */}
        {countersOnScript.length > 0 && (
          <div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: 10,
                color: "#c0392b",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              ⚔ Counters on this script
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {countersOnScript.map((counter) => (
                <div
                  key={counter.id}
                  style={{
                    background: "#1a0808",
                    border: "1px solid #4a1a1a",
                    borderRadius: 6,
                    padding: "6px 10px",
                  }}
                >
                  <button
                    onClick={() => onNavigate(counter.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#d5825b",
                      cursor: "pointer",
                      padding: 0,
                      fontFamily: "var(--font-cinzel)",
                      fontSize: 12,
                      marginBottom: 2,
                    }}
                  >
                    {counter.name}
                  </button>
                  {character.counterDetail[counter.id] && (
                    <div
                      style={{
                        fontFamily: "var(--font-garamond)",
                        fontSize: 12,
                        color: "#888",
                        lineHeight: 1.4,
                      }}
                    >
                      {character.counterDetail[counter.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bluff advice */}
        {character.bluffAdvice && (
          <div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: 10,
                color: "#666",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Bluff Advice
            </div>
            <div
              style={{
                fontFamily: "var(--font-garamond)",
                fontSize: 13,
                color: "#c8b89a",
                lineHeight: 1.5,
              }}
            >
              {character.bluffAdvice}
            </div>
          </div>
        )}

        {/* Add/Remove button */}
        <button
          onClick={() => onToggle(character.id)}
          style={{
            background: isSelected ? "#8b1a1a" : "#1a3a6a",
            border: "none",
            borderRadius: 6,
            padding: "10px",
            color: "#e8dcc8",
            cursor: "pointer",
            fontFamily: "var(--font-cinzel)",
            fontSize: 12,
            letterSpacing: "0.05em",
          }}
        >
          {isSelected ? "Remove from Script" : "Add to Script"}
        </button>
      </div>
    </div>
  );
}
