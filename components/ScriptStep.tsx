"use client";

import { Character } from "@/lib/types";
import { CharacterToken } from "./CharacterToken";
import { calculateEffectiveStrength, getSupportedPlayerCounts } from "@/lib/engine";
import { ScriptStepProps } from "@/components/types";
import { EDITIONS } from "@/constants/info";
import { TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";

function teamCount(chars: Character[], team: string) {
  return chars.filter((c) => c.team === team).length;
}

function scriptIsValid(scriptIds: string[], allCharacters: Character[]) {
  const chars = allCharacters.filter((c) => scriptIds.includes(c.id));
  return (
    chars.filter((c) => c.team === "demon").length >= 1 &&
    chars.filter((c) => c.team === "townsfolk").length >= 9 &&
    chars.filter((c) => c.team === "minion").length >= 1
  );
}

export function ScriptStep({
  scriptSource,
  scriptIds,
  allCharacters,
  editionPools,
  searchQuery,
  onSelectEdition,
  onSelectCustom,
  onToggleScriptChar,
  onContinue,
  onSearch,
  onDetail
}: ScriptStepProps) {
  const isCustom = scriptSource === "custom";

  // Script character counts for custom builder
  const scriptChars = allCharacters.filter((c) => scriptIds.includes(c.id));
  const counts = {
    townsfolk: teamCount(scriptChars, "townsfolk"),
    outsider: teamCount(scriptChars, "outsider"),
    minion: teamCount(scriptChars, "minion"),
    demon: teamCount(scriptChars, "demon")
  };
  const hasBaron = scriptIds.includes("baron");
  // Baron shifts 2 TF to OS, so targets adjust accordingly
  const TARGETS = {
    townsfolk: hasBaron ? 11 : 13,
    outsider: hasBaron ? 6 : 4,
    minion: 4,
    demon: 1
  };
  const tfMin = hasBaron ? 7 : 9; // minimum TF needed for a 7-player game

  const valid = isCustom ? scriptIsValid(scriptIds, allCharacters) : scriptSource !== null;

  // Custom builder: filtered pool
  const filteredPool = isCustom
    ? allCharacters.filter(
        (c) =>
          !searchQuery ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.ability.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 32
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: "var(--font-cinzel)",
            fontSize: 22,
            color: "#e8dcc8",
            margin: "0 0 6px",
            letterSpacing: "0.04em"
          }}
        >
          Step 1 — Choose Your Script
        </h2>
        <p
          style={{
            fontFamily: "var(--font-garamond)",
            fontSize: 14,
            color: "#555",
            margin: 0
          }}
        >
          A script is the set of characters available to appear in your game. Choose a pre-made script or build your
          own.
        </p>
      </div>

      {/* Edition cards */}
      {!isCustom && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {EDITIONS.map((ed) => {
              const pool = editionPools[ed.key];
              const isSelected = scriptSource === ed.key;
              return (
                <div
                  key={ed.key}
                  onClick={() =>
                    onSelectEdition(
                      ed.key,
                      pool.map((c) => c.id)
                    )
                  }
                  style={{
                    background: isSelected ? "#1a0f0f" : "var(--bg-surface)",
                    border: `2px solid ${isSelected ? "#8b1a1a" : "#2a2a3a"}`,
                    borderRadius: 12,
                    padding: "20px 22px",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 10
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-cinzel)",
                        fontSize: 15,
                        color: isSelected ? "#e8dcc8" : "#b8965a",
                        letterSpacing: "0.04em"
                      }}
                    >
                      {ed.name}
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-garamond)",
                        fontSize: 10,
                        color: ed.diffColor,
                        border: `1px solid ${ed.diffColor}44`,
                        borderRadius: 3,
                        padding: "2px 7px",
                        flexShrink: 0
                      }}
                    >
                      {ed.difficulty}
                    </span>
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-garamond)",
                      fontSize: 13,
                      color: "#666",
                      lineHeight: 1.5,
                      marginBottom: 16,
                      minHeight: 40
                    }}
                  >
                    {ed.tagline}
                  </div>

                  {/* Character count grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "4px 12px",
                      marginBottom: 16
                    }}
                  >
                    {TEAM_ORDER.map((team) => {
                      const n = teamCount(pool, team);
                      if (n === 0) return null;
                      const c = TEAM_COLORS[team];
                      return (
                        <div
                          key={team}
                          style={{
                            fontFamily: "var(--font-jetbrains)",
                            fontSize: 11,
                            color: c.text
                          }}
                        >
                          {n} {TEAM_LABEL[team]}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEdition(
                        ed.key,
                        pool.map((c) => c.id)
                      );
                    }}
                    style={{
                      width: "100%",
                      background: isSelected ? "#8b1a1a" : "#2a2a3a",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 0",
                      color: isSelected ? "#e8dcc8" : "#888",
                      cursor: "pointer",
                      fontFamily: "var(--font-cinzel)",
                      fontSize: 11,
                      letterSpacing: "0.05em",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {isSelected ? "✓ Selected" : "Select Script"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Custom option */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "2px dashed #2a2a3a",
              borderRadius: 12,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: 14,
                  color: "#b8965a",
                  marginBottom: 4
                }}
              >
                Custom Script
              </div>
              <div
                style={{
                  fontFamily: "var(--font-garamond)",
                  fontSize: 13,
                  color: "#555",
                  lineHeight: 1.5
                }}
              >
                Mix characters from all editions. Aim for 13+ Townsfolk, 4 Outsiders, 4 Minions, and at least 1 Demon to
                support all player counts.
              </div>
            </div>
            <button
              onClick={onSelectCustom}
              style={{
                background: "#14141f",
                border: "1px solid #b8965a",
                borderRadius: 6,
                padding: "8px 18px",
                color: "#b8965a",
                cursor: "pointer",
                fontFamily: "var(--font-cinzel)",
                fontSize: 11,
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
                flexShrink: 0
              }}
            >
              Build Custom →
            </button>
          </div>

          {/* Continue button for edition selection */}
          {scriptSource && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={onContinue}
                style={{
                  background: "#8b1a1a",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 28px",
                  color: "#e8dcc8",
                  cursor: "pointer",
                  fontFamily: "var(--font-cinzel)",
                  fontSize: 13,
                  letterSpacing: "0.06em"
                }}
              >
                Set Up Game →
              </button>
            </div>
          )}
        </>
      )}

      {/* Custom script builder */}
      {isCustom && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, minHeight: 600 }}>
          {/* Left: character pool */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid #2a2a3a",
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "10px 12px", borderBottom: "1px solid #2a2a3a" }}>
              <input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-base)",
                  border: "1px solid #3a3a4a",
                  borderRadius: 6,
                  padding: "6px 10px",
                  color: "var(--parchment)",
                  fontFamily: "var(--font-garamond)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "8px 10px",
                display: "flex",
                flexDirection: "column",
                gap: 10
              }}
            >
              {TEAM_ORDER.map((team) => {
                const chars = filteredPool.filter((c) => c.team === team);
                if (chars.length === 0) return null;
                return (
                  <div key={team}>
                    <div
                      style={{
                        fontFamily: "var(--font-cinzel)",
                        fontSize: 10,
                        color: "#b8965a",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 5,
                        paddingBottom: 3,
                        borderBottom: "1px solid #2a2a3a"
                      }}
                    >
                      {TEAM_LABEL[team]} ({chars.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {chars.map((c) => {
                        const eff = calculateEffectiveStrength(c.id, scriptIds, allCharacters);
                        return (
                          <CharacterToken
                            key={c.id}
                            character={c}
                            selected={scriptIds.includes(c.id)}
                            onToggle={onToggleScriptChar}
                            onDetail={onDetail}
                            effectiveStrength={eff.effectiveStrength}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: script summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Back button */}
            <button
              onClick={() =>
                onSelectEdition(
                  "tb",
                  editionPools.tb.map((c) => c.id)
                )
              }
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: "1px solid #2a2a3a",
                borderRadius: 5,
                padding: "5px 12px",
                color: "#666",
                cursor: "pointer",
                fontFamily: "var(--font-garamond)",
                fontSize: 13
              }}
            >
              ← Back to Script Selection
            </button>

            {/* Count dashboard */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid #2a2a3a",
                borderRadius: 10,
                padding: "14px 16px"
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: 12,
                  color: "#b8965a",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 12
                }}
              >
                Your Script — {scriptIds.length} characters
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {TEAM_ORDER.map((team) => {
                  const have = counts[team];
                  const need = TARGETS[team];
                  const ok = have >= need;
                  const c = TEAM_COLORS[team];
                  return (
                    <div
                      key={team}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        background: "#0a0a14",
                        border: `1px solid ${ok ? c.border : "#2a2a3a"}`,
                        borderRadius: 7,
                        padding: "8px 4px"
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-jetbrains)",
                          fontSize: 20,
                          color: ok ? c.text : "#444"
                        }}
                      >
                        {have}
                      </div>
                      <div style={{ fontFamily: "var(--font-jetbrains)", fontSize: 8, color: "#444" }}>/ {need}</div>
                      <div
                        style={{
                          fontFamily: "var(--font-garamond)",
                          fontSize: 10,
                          color: "#555",
                          textTransform: "capitalize",
                          marginTop: 3
                        }}
                      >
                        {team}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hint messages */}
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                {counts.demon === 0 && (
                  <div style={{ fontFamily: "var(--font-garamond)", fontSize: 12, color: "#c0392b" }}>
                    ⚠ You need at least 1 Demon.
                  </div>
                )}
                {counts.townsfolk < tfMin && (
                  <div style={{ fontFamily: "var(--font-garamond)", fontSize: 12, color: "#d4a017" }}>
                    ⚡ Add more Townsfolk —{" "}
                    {hasBaron
                      ? "7 minimum with Baron in play (Baron replaces 2 TF with Outsiders)."
                      : "9 minimum to support a 7-player game, 12 for a full script (9 + 3 bluffs)."}
                  </div>
                )}
                {counts.minion === 0 && (
                  <div style={{ fontFamily: "var(--font-garamond)", fontSize: 12, color: "#d4a017" }}>
                    ⚡ Add at least 1 Minion.
                  </div>
                )}
                {hasBaron && counts.townsfolk >= tfMin && (
                  <div style={{ fontFamily: "var(--font-garamond)", fontSize: 12, color: "#9b7fd5" }}>
                    ⚙ Baron shifts 2 Townsfolk slots to Outsiders in every game — target 11 TF and 6 OS for full
                    coverage.
                  </div>
                )}
                {counts.demon > 1 && (
                  <div style={{ fontFamily: "var(--font-garamond)", fontSize: 12, color: "#666" }}>
                    💡 Multiple demons ({counts.demon}) — each game uses exactly 1. More options is fine.
                  </div>
                )}
                {valid && (
                  <div style={{ fontFamily: "var(--font-garamond)", fontSize: 12, color: "#2d6a4f" }}>
                    ✓ Script is playable.
                    {counts.townsfolk < TARGETS.townsfolk
                      ? ` Add ${TARGETS.townsfolk - counts.townsfolk} more Townsfolk for full player range.`
                      : " Ready for all player counts."}
                  </div>
                )}
              </div>

              {/* Player count support grid */}
              {scriptIds.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-cinzel)",
                      fontSize: 9,
                      color: "#555",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: 6
                    }}
                  >
                    Supported Player Counts
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {getSupportedPlayerCounts(scriptIds, allCharacters).map((entry) => (
                      <div
                        key={entry.playerCount}
                        title={
                          entry.supported
                            ? `${entry.playerCount}p: ${entry.required.townsfolk}TF ${entry.required.outsider}OS ${entry.required.minion}Mn ${entry.required.demon}Dm`
                            : `${entry.playerCount}p: not enough characters`
                        }
                        style={{
                          fontFamily: "var(--font-jetbrains)",
                          fontSize: 10,
                          width: 26,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 4,
                          background: entry.supported ? "#0d1a0d" : "#0a0a14",
                          border: `1px solid ${entry.supported ? "#2d6a4f" : "#222"}`,
                          color: entry.supported ? "#4a9a6a" : "#333"
                        }}
                      >
                        {entry.playerCount}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Script character list */}
            {scriptIds.length > 0 && (
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid #2a2a3a",
                  borderRadius: 10,
                  padding: "14px 16px",
                  flex: 1,
                  overflowY: "auto"
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    fontSize: 12,
                    color: "#b8965a",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 12
                  }}
                >
                  Script Contents
                </div>
                {TEAM_ORDER.map((team) => {
                  const chars = scriptChars.filter((c) => c.team === team);
                  if (chars.length === 0) return null;
                  const c = TEAM_COLORS[team];
                  return (
                    <div key={team} style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-cinzel)",
                          fontSize: 10,
                          color: c.text,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: 5
                        }}
                      >
                        {TEAM_LABEL[team]} ({chars.length})
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {chars.map((char) => (
                          <button
                            key={char.id}
                            onClick={() => onToggleScriptChar(char.id)}
                            title={`Remove ${char.name} from script`}
                            style={{
                              background: "#1a1a2a",
                              border: `1px solid ${c.border}`,
                              borderRadius: 4,
                              padding: "3px 8px",
                              color: c.text,
                              cursor: "pointer",
                              fontFamily: "var(--font-cinzel)",
                              fontSize: 11
                            }}
                          >
                            {char.name} ×
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Continue */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={onContinue}
                disabled={!valid}
                style={{
                  background: valid ? "#8b1a1a" : "#1a1a1a",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 28px",
                  color: valid ? "#e8dcc8" : "#333",
                  cursor: valid ? "pointer" : "default",
                  fontFamily: "var(--font-cinzel)",
                  fontSize: 13,
                  letterSpacing: "0.06em"
                }}
              >
                Set Up Game →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
