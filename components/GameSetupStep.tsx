"use client";

import { useMemo } from "react";
import { Character, Interaction } from "@/lib/types";
import { analyzeScript, calculateEffectiveStrength } from "@/lib/engine";
import { interactions as allInteractions } from "@/lib/data";
import playerCountsData from "@/data/playerCounts.json";
import { GameSetupStepProps } from "@/components/types";

const TEAM_ORDER = ["townsfolk", "outsider", "minion", "demon"] as const;
const TEAM_LABEL: Record<string, string> = {
  townsfolk: "Townsfolk",
  outsider: "Outsiders",
  minion: "Minions",
  demon: "Demons",
};
const TEAM_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  townsfolk: { text: "#5b9bd5", border: "#2a4a7f", bg: "#0d1a2e" },
  outsider: { text: "#9b7fd5", border: "#4a2a7f", bg: "#1a0d2e" },
  minion: { text: "#d5825b", border: "#7f2a2a", bg: "#2e0d0d" },
  demon: { text: "#d55b5b", border: "#7f1a1a", bg: "#2e0808" },
};

const EDITION_LABELS: Record<string, string> = {
  tb: "Trouble Brewing",
  bmr: "Bad Moon Rising",
  snv: "Sects & Violets",
  custom: "Custom Script",
};

const SETUP_MODIFIERS: Record<string, { townsfolk?: number; outsider?: number; label: string }> = {
  baron: { outsider: 2, townsfolk: -2, label: "Baron: +2 Outsiders, −2 Townsfolk" },
  godfather: { outsider: 1, townsfolk: -1, label: "Godfather: +1 Outsider, −1 Townsfolk" },
  vigormortis: { outsider: -1, townsfolk: 1, label: "Vigormortis: −1 Outsider, +1 Townsfolk" },
  fanggu: { outsider: 1, townsfolk: -1, label: "Fang Gu: +1 Outsider, −1 Townsfolk" },
  balloonist: { outsider: 1, townsfolk: -1, label: "Balloonist: +1 Outsider, −1 Townsfolk" },
};

const RAW_COUNTS = playerCountsData.counts as Record<
  string,
  { townsfolk: number; outsider: number; minion: number; demon: number }
>;

const FEEL_BARS: Array<{
  key: "infoLevel" | "lethalityLevel" | "chaosLevel" | "stWorkload";
  label: string;
  levels: string[];
}> = [
  { key: "infoLevel", label: "Info", levels: ["Blind", "Low", "Moderate", "High", "Flooded"] },
  { key: "lethalityLevel", label: "Lethal", levels: ["Gentle", "Standard", "Deadly", "Massacre"] },
  { key: "chaosLevel", label: "Chaos", levels: ["Orderly", "Moderate", "Chaotic", "Pandemonium"] },
  { key: "stWorkload", label: "ST Load", levels: ["Light", "Moderate", "Heavy", "Exhausting"] },
];
const FEEL_COLOR: Record<string, string> = {
  Blind: "#c0392b",
  Low: "#e67e22",
  Moderate: "#b8965a",
  High: "#2a7fd4",
  Flooded: "#1a5fa8",
  Gentle: "#2d6a4f",
  Standard: "#b8965a",
  Deadly: "#e67e22",
  Massacre: "#c0392b",
  Orderly: "#2d6a4f",
  Chaotic: "#e67e22",
  Pandemonium: "#c0392b",
  Light: "#2d6a4f",
  Heavy: "#e67e22",
  Exhausting: "#c0392b",
};

function getAdjustedReq(
  rawReq: { townsfolk: number; outsider: number; minion: number; demon: number },
  gameIds: string[]
) {
  let tf = rawReq.townsfolk;
  let os = rawReq.outsider;
  for (const [charId, mod] of Object.entries(SETUP_MODIFIERS)) {
    if (gameIds.includes(charId)) {
      tf += mod.townsfolk ?? 0;
      os += mod.outsider ?? 0;
    }
  }
  return {
    townsfolk: Math.max(0, tf),
    outsider: Math.max(0, os),
    minion: rawReq.minion,
    demon: rawReq.demon,
  };
}

// ─── Analysis sidebar ────────────────────────────────────────────────────────

function AnalysisSidebar({
  gameIds,
  allCharacters,
}: {
  gameIds: string[];
  allCharacters: Character[];
}) {
  const analysis = useMemo(
    () => analyzeScript(gameIds, allCharacters, allInteractions, "game"),
    [gameIds, allCharacters]
  );

  const { goodStrengthTotal: good, evilStrengthTotal: evil } = analysis;
  const maxAbs = Math.max(Math.abs(good), Math.abs(evil), 1);

  // Only show non-tip interactions
  const keyHints = analysis.interactionHints.filter(
    (h) => h.severity !== "tip" || h.category === "jinx"
  );

  if (gameIds.length === 0) {
    return (
      <div
        style={{
          color: "#333",
          fontFamily: "var(--font-garamond)",
          fontSize: 13,
          textAlign: "center",
          padding: "40px 16px",
        }}
      >
        Select characters to see live analysis.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Strength */}
      <div>
        <div
          style={{
            fontFamily: "var(--font-cinzel)",
            fontSize: 10,
            color: "#b8965a",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Team Strength
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Good", value: good, color: "#2a7fd4" },
            { label: "Evil", value: evil, color: "#c0392b" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: 9,
                    color,
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 10, color }}>
                  {value > 0 ? "+" : ""}
                  {value}
                </span>
              </div>
              <div
                style={{ height: 6, background: "#1a1a2a", borderRadius: 3, overflow: "hidden" }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(Math.abs(value) / maxAbs) * 100}%`,
                    background: color,
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game feel */}
      {gameIds.length >= 3 && (
        <div>
          <div
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: 10,
              color: "#b8965a",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Game Feel
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {FEEL_BARS.map(({ key, label, levels }) => {
              const val = analysis.scriptFeel[key] as string;
              const idx = levels.indexOf(val);
              const color = FEEL_COLOR[val] ?? "#b8965a";
              return (
                <div key={key}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains)",
                        fontSize: 9,
                        color: "#555",
                        textTransform: "uppercase",
                      }}
                    >
                      {label}
                    </span>
                    <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 9, color }}>
                      {val}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    {levels.map((_, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 5,
                          borderRadius: 2,
                          background: i <= idx ? color : "#2a2a3a",
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactions */}
      {keyHints.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: 10,
              color: "#b8965a",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Interactions ({keyHints.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {keyHints.map((hint, i) => {
              const isJinx = hint.category === "jinx";
              const involvedChars = hint.involvedCharacters
                .map((id) => allCharacters.find((c) => c.id === id))
                .filter(Boolean) as Character[];
              const borderColor = isJinx
                ? "#7a6200"
                : hint.severity === "critical"
                  ? "#8b1a1a"
                  : "#7a5a00";
              const bgColor = isJinx
                ? "#1a1500"
                : hint.severity === "critical"
                  ? "#1a0808"
                  : "#1a1400";
              return (
                <div
                  key={i}
                  style={{
                    border: `1px solid ${borderColor}`,
                    borderStyle: isJinx ? "dashed" : "solid",
                    background: bgColor,
                    borderRadius: 6,
                    padding: "8px 10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    {isJinx && (
                      <span
                        style={{
                          fontFamily: "var(--font-cinzel)",
                          fontSize: 8,
                          color: "#b8965a",
                          background: "#2a1f00",
                          border: "1px solid #7a6200",
                          borderRadius: 3,
                          padding: "1px 4px",
                          flexShrink: 0,
                        }}
                      >
                        ⚖ Jinx
                      </span>
                    )}
                    {involvedChars.map((c) => (
                      <span
                        key={c.id}
                        style={{
                          fontFamily: "var(--font-cinzel)",
                          fontSize: 10,
                          color: "#b8965a",
                          background: "#2a2a3a",
                          borderRadius: 3,
                          padding: "1px 5px",
                        }}
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-cinzel)",
                      fontSize: 11,
                      color: "#e8dcc8",
                      marginBottom: 3,
                    }}
                  >
                    {hint.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-garamond)",
                      fontSize: 12,
                      color: "#c8b89a",
                      lineHeight: 1.5,
                    }}
                  >
                    {hint.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Composition issues */}
      {analysis.compositionWarnings.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: 10,
              color: "#b8965a",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Issues
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {analysis.compositionWarnings.map((w, i) => (
              <div
                key={i}
                style={{
                  background:
                    w.severity === "critical"
                      ? "#1a0808"
                      : w.severity === "important"
                        ? "#1a1400"
                        : "#0a1408",
                  border: `1px solid ${w.severity === "critical" ? "#8b1a1a" : w.severity === "important" ? "#7a5a00" : "#1a4a2e"}`,
                  borderRadius: 5,
                  padding: "6px 8px",
                  fontFamily: "var(--font-garamond)",
                  fontSize: 12,
                  color: "#c8b89a",
                  lineHeight: 1.5,
                }}
              >
                {w.severity === "critical" ? "⚠" : w.severity === "important" ? "⚡" : "💡"}{" "}
                {w.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Character strength list */}
      {gameIds.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: 10,
              color: "#b8965a",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Character Strengths
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {gameIds
              .map((id) => {
                const char = allCharacters.find((c) => c.id === id);
                if (!char) return null;
                const eff = calculateEffectiveStrength(id, gameIds, allCharacters, allInteractions);
                return { char, eff };
              })
              .filter(Boolean)
              .sort(
                (a, b) => Math.abs(b!.eff.effectiveStrength) - Math.abs(a!.eff.effectiveStrength)
              )
              .map((entry) => {
                if (!entry) return null;
                const { char, eff } = entry;
                const col = TEAM_COLORS[char.team];
                const s = eff.effectiveStrength;
                const barColor =
                  s > 30 ? "#2a7fd4" : s > 0 ? "#5b9bd5" : s > -30 ? "#c0392b" : "#8b1a1a";
                return (
                  <div key={char.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-cinzel)",
                        fontSize: 10,
                        color: col.text,
                        minWidth: 90,
                        flexShrink: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {char.name}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        background: "#1a1a2a",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(Math.abs(s) / 100) * 100}%`,
                          background: barColor,
                          borderRadius: 2,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-jetbrains)",
                        fontSize: 9,
                        color: barColor,
                        minWidth: 28,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {s > 0 ? "+" : ""}
                      {s}
                    </div>
                    {eff.modifier !== 0 && (
                      <div
                        style={{
                          fontFamily: "var(--font-jetbrains)",
                          fontSize: 8,
                          color: eff.modifier > 0 ? "#2a7fd4" : "#c0392b",
                          flexShrink: 0,
                        }}
                      >
                        ({eff.modifier > 0 ? "+" : ""}
                        {eff.modifier})
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GameSetupStep({
  scriptSource,
  scriptIds,
  playerCount,
  gameIds,
  allCharacters,
  editionTravelers,
  onSetPlayerCount,
  onToggleGameChar,
  onContinue,
  onBack,
  onDetail,
}: GameSetupStepProps) {
  const scriptChars = allCharacters.filter((c) => scriptIds.includes(c.id));
  const rawReq = playerCount ? RAW_COUNTS[String(playerCount)] : null;
  const req = rawReq ? getAdjustedReq(rawReq, gameIds) : null;

  const neededTravelers = playerCount && playerCount > 15 ? playerCount - 15 : 0;
  const travelerIdSet = new Set(editionTravelers.map((t) => t.id));
  const coreGameIds = gameIds.filter((id) => !travelerIdSet.has(id));
  const selectedTravelerIds = gameIds.filter((id) => travelerIdSet.has(id));

  const gameCounts = {
    townsfolk: coreGameIds.filter(
      (id) => allCharacters.find((c) => c.id === id)?.team === "townsfolk"
    ).length,
    outsider: coreGameIds.filter(
      (id) => allCharacters.find((c) => c.id === id)?.team === "outsider"
    ).length,
    minion: coreGameIds.filter((id) => allCharacters.find((c) => c.id === id)?.team === "minion")
      .length,
    demon: coreGameIds.filter((id) => allCharacters.find((c) => c.id === id)?.team === "demon")
      .length,
  };

  const totalNeeded = req ? req.townsfolk + req.outsider + req.minion + req.demon : 0;
  const coreComplete = req !== null && coreGameIds.length === totalNeeded;
  const travelersComplete = selectedTravelerIds.length === neededTravelers;
  const isComplete = coreComplete && travelersComplete;

  const activeModifiers = Object.entries(SETUP_MODIFIERS)
    .filter(([id]) => gameIds.includes(id))
    .map(([, mod]) => mod.label);

  return (
    <div
      style={{
        maxWidth: 1300,
        margin: "0 auto",
        padding: "28px 24px",
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: 20,
        alignItems: "start",
      }}
    >
      {/* ── Left: selection ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: 22,
                color: "#e8dcc8",
                margin: "0 0 6px",
                letterSpacing: "0.04em",
              }}
            >
              Step 2 — Set Up Your Game
            </h2>
            <div style={{ fontFamily: "var(--font-garamond)", fontSize: 13, color: "#555" }}>
              Script:{" "}
              <span style={{ color: "#b8965a" }}>{EDITION_LABELS[scriptSource ?? "custom"]}</span>
              {" · "}
              {scriptIds.length} characters available
            </div>
          </div>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "1px solid #2a2a3a",
              borderRadius: 5,
              padding: "6px 14px",
              color: "#666",
              cursor: "pointer",
              fontFamily: "var(--font-garamond)",
              fontSize: 13,
            }}
          >
            ← Change Script
          </button>
        </div>

        {/* Player count */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: 11,
              color: "#b8965a",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            How many players?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Array.from({ length: 16 }, (_, i) => i + 5).map((n) => {
              const active = playerCount === n;
              const isTraveler = n > 15;
              return (
                <button
                  key={n}
                  onClick={() => onSetPlayerCount(active ? null : n)}
                  style={{
                    background: active ? "#8b1a1a" : "#14141f",
                    border: `2px solid ${active ? "#8b1a1a" : isTraveler ? "#2a2a2a" : "#2a2a3a"}`,
                    borderRadius: 7,
                    padding: isTraveler ? "5px 10px" : "8px 14px",
                    color: active ? "#e8dcc8" : isTraveler ? "#555" : "#888",
                    cursor: "pointer",
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: isTraveler ? 11 : 14,
                    fontWeight: active ? 700 : 400,
                    transition: "all 0.1s ease",
                  }}
                  title={
                    isTraveler
                      ? `${n} players (${n - 15} traveler${n - 15 > 1 ? "s" : ""})`
                      : `${n} players`
                  }
                >
                  {n}
                  {isTraveler && (
                    <span
                      style={{
                        fontSize: 8,
                        color: active ? "#e8dcc8" : "#444",
                        display: "block",
                        lineHeight: 1,
                      }}
                    >
                      +{n - 15}T
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {neededTravelers > 0 && playerCount && (
            <div
              style={{
                fontFamily: "var(--font-garamond)",
                fontSize: 12,
                color: "#555",
                marginTop: 8,
              }}
            >
              Travelers fill the extra {neededTravelers} slot{neededTravelers > 1 ? "s" : ""} — they
              are not from your script.
            </div>
          )}
        </div>

        {/* Distribution + character selection */}
        {playerCount && req && (
          <>
            {/* Distribution */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid #2a2a3a",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    fontSize: 12,
                    color: "#b8965a",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {playerCount}-Player Distribution
                </div>
                {isComplete && (
                  <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, color: "#2d6a4f" }}>
                    ✓ Roster Complete
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {TEAM_ORDER.map((team) => {
                  const needed = req[team];
                  const have = gameCounts[team];
                  const done = have >= needed;
                  const c = TEAM_COLORS[team];
                  return (
                    <div
                      key={team}
                      style={{
                        flex: 1,
                        background: "#0a0a14",
                        border: `2px solid ${done ? c.border : "#2a2a3a"}`,
                        borderRadius: 8,
                        padding: "10px 6px",
                        textAlign: "center",
                        transition: "border-color 0.2s",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-jetbrains)",
                          fontSize: 22,
                          color: done ? c.text : "#333",
                          lineHeight: 1,
                        }}
                      >
                        {have}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-jetbrains)",
                          fontSize: 10,
                          color: "#333",
                          margin: "2px 0",
                        }}
                      >
                        / {needed}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-garamond)",
                          fontSize: 11,
                          color: "#555",
                          textTransform: "capitalize",
                        }}
                      >
                        {team}
                      </div>
                    </div>
                  );
                })}
                {neededTravelers > 0 && (
                  <div
                    style={{
                      flex: 1,
                      background: "#0a0a14",
                      border: `2px solid ${travelersComplete ? "#4a3a20" : "#2a2a3a"}`,
                      borderRadius: 8,
                      padding: "10px 6px",
                      textAlign: "center",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-jetbrains)",
                        fontSize: 22,
                        color: travelersComplete ? "#b8965a" : "#333",
                        lineHeight: 1,
                      }}
                    >
                      {selectedTravelerIds.length}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-jetbrains)",
                        fontSize: 10,
                        color: "#333",
                        margin: "2px 0",
                      }}
                    >
                      / {neededTravelers}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-garamond)",
                        fontSize: 11,
                        color: "#555",
                      }}
                    >
                      Travelers
                    </div>
                  </div>
                )}
              </div>
              {activeModifiers.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
                  {activeModifiers.map((note, i) => (
                    <div
                      key={i}
                      style={{ fontFamily: "var(--font-garamond)", fontSize: 12, color: "#d5825b" }}
                    >
                      ⚙ {note}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Character selection */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: 11,
                  color: "#b8965a",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Choose Characters for This Game
              </div>

              {TEAM_ORDER.map((team) => {
                const chars = scriptChars.filter((c) => c.team === team);
                const needed = req[team];
                const have = gameCounts[team];
                const isFull = have >= needed;
                const c = TEAM_COLORS[team];
                if (chars.length === 0) return null;

                return (
                  <div key={team}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-cinzel)",
                          fontSize: 12,
                          color: c.text,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {TEAM_LABEL[team]}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-jetbrains)",
                          fontSize: 11,
                          color: isFull ? c.text : "#555",
                          background: "#0a0a14",
                          border: `1px solid ${isFull ? c.border : "#2a2a3a"}`,
                          borderRadius: 10,
                          padding: "2px 10px",
                        }}
                      >
                        {have} / {needed}
                      </div>
                      {needed === 0 && (
                        <div
                          style={{
                            fontFamily: "var(--font-garamond)",
                            fontSize: 11,
                            color: "#444",
                          }}
                        >
                          (none needed at this count)
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {chars.map((char) => {
                        const inGame = gameIds.includes(char.id);
                        const blocked = !inGame && isFull;
                        // Counter badge: how many of this char's counters are in the game
                        const countersInGame = (char.counters ?? []).filter((id) =>
                          gameIds.includes(id)
                        ).length;
                        // Synergy badge: how many synergies this char has with already-selected game chars
                        const synergiesInGame = allInteractions.filter(
                          (i: Interaction) =>
                            i.type === "synergy" &&
                            ((i.a === char.id && gameIds.includes(i.b)) ||
                              (i.b === char.id && gameIds.includes(i.a)))
                        );
                        const synergySummary =
                          synergiesInGame.length > 0
                            ? synergiesInGame.map((i: Interaction) => i.title).join("\n")
                            : "";

                        return (
                          <div
                            key={char.id}
                            style={{
                              display: "flex",
                              border: `1px solid ${inGame ? c.border : synergiesInGame.length > 0 ? "#2a4a20" : "#2a2a3a"}`,
                              borderRadius: 7,
                              overflow: "hidden",
                              opacity: blocked ? 0.3 : 1,
                              transition: "all 0.1s ease",
                            }}
                          >
                            <button
                              onClick={() => onDetail(char.id)}
                              style={{
                                background: inGame
                                  ? c.bg
                                  : synergiesInGame.length > 0
                                    ? "#0d1a0d"
                                    : "#14141f",
                                border: "none",
                                borderRight: `1px solid ${inGame ? c.border : "#2a2a3a"}`,
                                padding: "6px 10px",
                                color: inGame ? c.text : "#666",
                                cursor: "pointer",
                                fontFamily: "var(--font-cinzel)",
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              {char.name}
                              {synergiesInGame.length > 0 && !inGame && (
                                <span
                                  title={synergySummary}
                                  style={{
                                    fontFamily: "var(--font-jetbrains)",
                                    fontSize: 8,
                                    color: "#4a9a4a",
                                    background: "#0d1a0d",
                                    border: "1px solid #2a4a20",
                                    borderRadius: 3,
                                    padding: "0 3px",
                                    cursor: "help",
                                  }}
                                >
                                  ✦{synergiesInGame.length}
                                </span>
                              )}
                              {countersInGame > 0 && (
                                <span
                                  style={{
                                    fontFamily: "var(--font-jetbrains)",
                                    fontSize: 8,
                                    color: "#b8965a",
                                    background: "#2a1a00",
                                    border: "1px solid #7a5a00",
                                    borderRadius: 3,
                                    padding: "0 3px",
                                  }}
                                >
                                  ⚔{countersInGame}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (!blocked) onToggleGameChar(char.id);
                              }}
                              disabled={blocked}
                              style={{
                                background: inGame ? c.bg : "#14141f",
                                border: "none",
                                padding: "6px 10px",
                                color: inGame ? c.text : "#555",
                                cursor: blocked ? "default" : "pointer",
                                fontSize: 13,
                              }}
                            >
                              {inGame ? "−" : "+"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Traveler picker — only when 16+ players and edition has travelers */}
            {neededTravelers > 0 && editionTravelers.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-cinzel)",
                      fontSize: 11,
                      color: "#b8965a",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Travelers
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: 11,
                      color: travelersComplete ? "#b8965a" : "#555",
                      background: "#0a0a14",
                      border: `1px solid ${travelersComplete ? "#4a3a20" : "#2a2a3a"}`,
                      borderRadius: 10,
                      padding: "2px 10px",
                    }}
                  >
                    {selectedTravelerIds.length} / {neededTravelers}
                  </div>
                  <div style={{ fontFamily: "var(--font-garamond)", fontSize: 11, color: "#444" }}>
                    (choose {neededTravelers} traveler{neededTravelers !== 1 ? "s" : ""})
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {editionTravelers.map((traveler) => {
                    const inGame = gameIds.includes(traveler.id);
                    const blocked = !inGame && travelersComplete;
                    return (
                      <div
                        key={traveler.id}
                        style={{
                          display: "flex",
                          border: `1px solid ${inGame ? "#4a3a20" : "#2a2a3a"}`,
                          borderRadius: 7,
                          overflow: "hidden",
                          opacity: blocked ? 0.3 : 1,
                          transition: "all 0.1s ease",
                        }}
                      >
                        <button
                          onClick={() => onDetail(traveler.id)}
                          style={{
                            background: inGame ? "#1a1500" : "#14141f",
                            border: "none",
                            borderRight: `1px solid ${inGame ? "#4a3a20" : "#2a2a3a"}`,
                            padding: "6px 10px",
                            color: inGame ? "#b8965a" : "#666",
                            cursor: "pointer",
                            fontFamily: "var(--font-cinzel)",
                            fontSize: 12,
                          }}
                        >
                          {traveler.name}
                        </button>
                        <button
                          onClick={() => {
                            if (!blocked) onToggleGameChar(traveler.id);
                          }}
                          disabled={blocked}
                          style={{
                            background: inGame ? "#1a1500" : "#14141f",
                            border: "none",
                            padding: "6px 10px",
                            color: inGame ? "#b8965a" : "#555",
                            cursor: blocked ? "default" : "pointer",
                            fontSize: 13,
                          }}
                        >
                          {inGame ? "−" : "+"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Continue */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
              <button
                onClick={onContinue}
                disabled={!isComplete}
                style={{
                  background: isComplete ? "#8b1a1a" : "#1a1a1a",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 28px",
                  color: isComplete ? "#e8dcc8" : "#333",
                  cursor: isComplete ? "pointer" : "default",
                  fontFamily: "var(--font-cinzel)",
                  fontSize: 13,
                  letterSpacing: "0.06em",
                }}
              >
                {isComplete
                  ? "View Dashboard →"
                  : coreComplete && neededTravelers > 0
                    ? `Select ${neededTravelers - selectedTravelerIds.length} more traveler${neededTravelers - selectedTravelerIds.length !== 1 ? "s" : ""}…`
                    : `Select ${totalNeeded - coreGameIds.length} more character${totalNeeded - coreGameIds.length !== 1 ? "s" : ""}…`}
              </button>
            </div>
          </>
        )}

        {!playerCount && (
          <div
            style={{
              color: "#444",
              fontFamily: "var(--font-garamond)",
              fontSize: 14,
              textAlign: "center",
              padding: "30px 0",
            }}
          >
            Choose a player count above to begin selecting characters.
          </div>
        )}
      </div>

      {/* ── Right: live analysis sidebar ── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid #2a2a3a",
          borderRadius: 10,
          padding: "14px 14px",
          position: "sticky",
          top: 16,
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-cinzel)",
            fontSize: 10,
            color: "#b8965a",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Live Analysis
        </div>
        <AnalysisSidebar gameIds={gameIds} allCharacters={allCharacters} />
      </div>
    </div>
  );
}
