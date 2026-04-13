"use client";

import { Character } from "@/lib/types";
import playerCountsData from "@/data/playerCounts.json";
import { GamePanelProps } from "@/components/types";

const TEAM_ORDER = ["townsfolk", "outsider", "minion", "demon"] as const;
const TEAM_LABEL: Record<string, string> = {
  townsfolk: "Townsfolk",
  outsider: "Outsiders",
  minion: "Minions",
  demon: "Demons",
};
const TEAM_COLORS: Record<string, { text: string; border: string; bg: string; selected: string }> =
  {
    townsfolk: { text: "#5b9bd5", border: "#2a4a7f", bg: "#0d1a2e", selected: "#1a3060" },
    outsider: { text: "#9b7fd5", border: "#4a2a7f", bg: "#1a0d2e", selected: "#2e1a50" },
    minion: { text: "#d5825b", border: "#7f2a2a", bg: "#2e0d0d", selected: "#4a1a1a" },
    demon: { text: "#d55b5b", border: "#7f1a1a", bg: "#2e0808", selected: "#5a1010" },
  };

const RAW_COUNTS = playerCountsData.counts as Record<
  string,
  { townsfolk: number; outsider: number; minion: number; demon: number }
>;

function teamOf(id: string, chars: Character[]) {
  return chars.find((c) => c.id === id)?.team ?? "";
}

export function GamePanel({
  playerCount,
  onSetPlayerCount,
  gameCharacterIds,
  selectedIds,
  allCharacters,
  onToggleGameCharacter,
  onClearGame,
  onDetail,
}: GamePanelProps) {
  const scriptChars = allCharacters.filter((c) => selectedIds.includes(c.id));

  const hasBaron = gameCharacterIds.includes("baron");
  const rawReq = playerCount ? RAW_COUNTS[String(playerCount)] : null;
  const req = rawReq
    ? {
        townsfolk: rawReq.townsfolk - (hasBaron ? 2 : 0),
        outsider: rawReq.outsider + (hasBaron ? 2 : 0),
        minion: rawReq.minion,
        demon: rawReq.demon,
      }
    : null;

  const travelerCount = playerCount && playerCount > 15 ? playerCount - 15 : 0;

  const gameCounts = {
    townsfolk: gameCharacterIds.filter((id) => teamOf(id, allCharacters) === "townsfolk").length,
    outsider: gameCharacterIds.filter((id) => teamOf(id, allCharacters) === "outsider").length,
    minion: gameCharacterIds.filter((id) => teamOf(id, allCharacters) === "minion").length,
    demon: gameCharacterIds.filter((id) => teamOf(id, allCharacters) === "demon").length,
  };

  const totalGame = gameCharacterIds.length;
  const totalNeeded = req ? req.townsfolk + req.outsider + req.minion + req.demon : 0;
  const isComplete = req ? totalGame === totalNeeded : false;

  function handlePrint() {
    window.print();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Player count selector */}
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
          Player Count
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {Array.from({ length: 16 }, (_, i) => i + 5).map((n) => {
            const isSelected = playerCount === n;
            const isTraveler = n > 15;
            return (
              <button
                key={n}
                onClick={() => onSetPlayerCount(isSelected ? null : n)}
                style={{
                  background: isSelected ? "#8b1a1a" : "#14141f",
                  border: `1px solid ${isSelected ? "#8b1a1a" : "#2a2a3a"}`,
                  borderRadius: 5,
                  padding: "5px 9px",
                  color: isSelected ? "#e8dcc8" : isTraveler ? "#666" : "#888",
                  cursor: "pointer",
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: 12,
                  position: "relative",
                  transition: "all 0.1s ease",
                }}
                title={isTraveler ? `${n - 15} traveler${n - 15 > 1 ? "s" : ""}` : `${n} players`}
              >
                {n}
                {isTraveler && (
                  <span
                    style={{
                      position: "absolute",
                      top: 1,
                      right: 2,
                      fontSize: 6,
                      color: isSelected ? "#e8dcc8" : "#555",
                    }}
                  >
                    +T
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {travelerCount > 0 && playerCount && (
          <div
            style={{
              fontFamily: "var(--font-garamond)",
              fontSize: 12,
              color: "#666",
              marginTop: 6,
            }}
          >
            Base 15-player distribution + {travelerCount} traveler{travelerCount > 1 ? "s" : ""}.
            Travelers are not part of the script.
          </div>
        )}
      </div>

      {playerCount && req && (
        <>
          {/* Distribution summary */}
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
              Game Distribution — {playerCount} Players
              {hasBaron && (
                <span style={{ color: "#d5825b", marginLeft: 8, fontSize: 9 }}>
                  (Baron: +2 OS, −2 TF)
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {TEAM_ORDER.map((team) => {
                const needed = req[team];
                const have = gameCounts[team];
                const done = have >= needed;
                const colors = TEAM_COLORS[team];
                return (
                  <div
                    key={team}
                    style={{
                      flex: 1,
                      background: "#14141f",
                      border: `1px solid ${done ? colors.border : "#2a2a3a"}`,
                      borderRadius: 6,
                      padding: "6px 8px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-jetbrains)",
                        fontSize: 18,
                        color: done ? colors.text : "#555",
                        lineHeight: 1,
                      }}
                    >
                      {have}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-jetbrains)",
                        fontSize: 9,
                        color: "#444",
                      }}
                    >
                      / {needed}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-garamond)",
                        fontSize: 10,
                        color: "#555",
                        textTransform: "capitalize",
                        marginTop: 2,
                      }}
                    >
                      {team}
                    </div>
                  </div>
                );
              })}
            </div>
            {isComplete && (
              <div
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: 12,
                  color: "#2d6a4f",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                ✓ Game roster complete — {totalNeeded} characters selected
              </div>
            )}
          </div>

          {/* Character selection per team */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: 10,
                color: "#b8965a",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Select Characters for This Game
            </div>

            {TEAM_ORDER.map((team) => {
              const chars = scriptChars.filter((c) => c.team === team);
              const needed = req[team];
              const have = gameCounts[team];
              const colors = TEAM_COLORS[team];
              if (chars.length === 0) return null;
              return (
                <div key={team}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-cinzel)",
                        fontSize: 10,
                        color: colors.text,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {TEAM_LABEL[team]}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-jetbrains)",
                        fontSize: 10,
                        color: have >= needed ? colors.text : "#666",
                        background: "#14141f",
                        border: `1px solid ${have >= needed ? colors.border : "#2a2a3a"}`,
                        borderRadius: 10,
                        padding: "1px 8px",
                      }}
                    >
                      {have} / {needed}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {chars.map((c) => {
                      const inGame = gameCharacterIds.includes(c.id);
                      const overLimit = !inGame && have >= needed;
                      return (
                        <div key={c.id} style={{ display: "flex", gap: 0 }}>
                          <button
                            onClick={() => onDetail(c.id)}
                            style={{
                              background: inGame ? colors.bg : "#14141f",
                              border: `1px solid ${inGame ? colors.border : "#2a2a3a"}`,
                              borderRight: "none",
                              borderRadius: "5px 0 0 5px",
                              padding: "4px 8px",
                              color: inGame ? colors.text : overLimit ? "#333" : "#666",
                              cursor: "pointer",
                              fontFamily: "var(--font-cinzel)",
                              fontSize: 11,
                              transition: "all 0.1s ease",
                            }}
                          >
                            {c.name}
                          </button>
                          <button
                            onClick={() => {
                              if (!overLimit || inGame) onToggleGameCharacter(c.id);
                            }}
                            title={
                              inGame
                                ? "Remove from game"
                                : overLimit
                                  ? "Team slot full"
                                  : "Add to game"
                            }
                            style={{
                              background: inGame ? colors.selected : "#14141f",
                              border: `1px solid ${inGame ? colors.border : "#2a2a3a"}`,
                              borderRadius: "0 5px 5px 0",
                              padding: "4px 7px",
                              color: inGame ? colors.text : overLimit ? "#2a2a2a" : "#444",
                              cursor: overLimit && !inGame ? "default" : "pointer",
                              fontSize: 12,
                              transition: "all 0.1s ease",
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

          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClearGame}
              style={{
                background: "none",
                border: "1px solid #2a2a3a",
                borderRadius: 5,
                padding: "6px 14px",
                color: "#555",
                cursor: "pointer",
                fontFamily: "var(--font-garamond)",
                fontSize: 13,
              }}
            >
              Clear Selection
            </button>
            <button
              onClick={handlePrint}
              disabled={!isComplete}
              style={{
                background: isComplete ? "#2a4a2a" : "#14141f",
                border: `1px solid ${isComplete ? "#2d6a4f" : "#2a2a3a"}`,
                borderRadius: 5,
                padding: "6px 14px",
                color: isComplete ? "#4a9a6a" : "#333",
                cursor: isComplete ? "pointer" : "default",
                fontFamily: "var(--font-cinzel)",
                fontSize: 11,
                letterSpacing: "0.05em",
              }}
              title={!isComplete ? "Complete game roster first" : "Print game script"}
            >
              Print Game Script
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
            padding: "16px 0",
          }}
        >
          Select a player count to configure a specific game session.
        </div>
      )}

      {/* Print-only area — hidden on screen, shown when printing */}
      {isComplete && (
        <div className="print-only" style={{ display: "none" }}>
          <div style={{ fontFamily: "Georgia, serif", padding: 24 }}>
            <h1
              style={{
                fontSize: 22,
                marginBottom: 4,
                borderBottom: "2px solid #000",
                paddingBottom: 8,
              }}
            >
              Blood on the Clocktower — Game Script
            </h1>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 20 }}>
              {playerCount} players · {new Date().toLocaleDateString()}
            </p>
            {TEAM_ORDER.map((team) => {
              const chars = allCharacters
                .filter((c) => gameCharacterIds.includes(c.id) && c.team === team)
                .sort((a, b) => a.name.localeCompare(b.name));
              if (chars.length === 0) return null;
              return (
                <div key={team} style={{ marginBottom: 20 }}>
                  <h2
                    style={{
                      fontSize: 14,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      borderBottom: "1px solid #ccc",
                      paddingBottom: 4,
                      marginBottom: 10,
                    }}
                  >
                    {TEAM_LABEL[team]} ({chars.length})
                  </h2>
                  {chars.map((c) => (
                    <div key={c.id} style={{ marginBottom: 10, pageBreakInside: "avoid" }}>
                      <strong style={{ fontSize: 13 }}>{c.name}</strong>
                      <div style={{ fontSize: 11, color: "#444", marginTop: 2, lineHeight: 1.5 }}>
                        {c.ability}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
