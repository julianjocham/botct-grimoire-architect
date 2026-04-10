"use client";

import { CompositionWarning, ScriptRecommendation, Character } from "@/lib/types";

interface CompositionPanelProps {
  warnings: CompositionWarning[];
  recommendations: ScriptRecommendation[];
  allCharacters: Character[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onDetail: (id: string) => void;
}

export function CompositionPanel({
  warnings,
  recommendations,
  allCharacters,
  selectedIds,
  onToggle,
  onDetail,
}: CompositionPanelProps) {
  const counts = {
    townsfolk: selectedIds.filter((id) =>
      allCharacters.find((c) => c.id === id && c.team === "townsfolk")
    ).length,
    outsider: selectedIds.filter((id) =>
      allCharacters.find((c) => c.id === id && c.team === "outsider")
    ).length,
    minion: selectedIds.filter((id) =>
      allCharacters.find((c) => c.id === id && c.team === "minion")
    ).length,
    demon: selectedIds.filter((id) =>
      allCharacters.find((c) => c.id === id && c.team === "demon")
    ).length,
  };

  const TARGETS = { townsfolk: 13, outsider: 4, minion: 4, demon: 1 };
  const COLORS = {
    townsfolk: "#2a7fd4",
    outsider: "#9b7fd5",
    minion: "#d5825b",
    demon: "#d55b5b",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Count summary */}
      <div style={{ display: "flex", gap: 6 }}>
        {(Object.keys(counts) as Array<keyof typeof counts>).map((team) => (
          <div
            key={team}
            style={{
              flex: 1,
              background: "#14141f",
              border: `1px solid ${counts[team] >= TARGETS[team] ? COLORS[team] + "66" : "#2a2a3a"}`,
              borderRadius: 6,
              padding: "6px 8px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: 16,
                color: COLORS[team],
              }}
            >
              {counts[team]}
            </div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: 8,
                color: "#555",
                textTransform: "uppercase",
              }}
            >
              / {TARGETS[team]}
            </div>
            <div
              style={{
                fontFamily: "var(--font-garamond)",
                fontSize: 10,
                color: "#666",
                textTransform: "capitalize",
                marginTop: 2,
              }}
            >
              {team}
            </div>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: 10,
              color: "#b8965a",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Composition Warnings
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {warnings.map((w, i) => (
              <div
                key={i}
                style={{
                  background:
                    w.severity === "critical"
                      ? "#1a0808"
                      : w.severity === "important"
                      ? "#1a1500"
                      : "#0a140a",
                  border: `1px solid ${w.severity === "critical" ? "#8b1a1a" : w.severity === "important" ? "#7a5a00" : "#1a4a2e"}`,
                  borderRadius: 6,
                  padding: "8px 10px",
                  fontFamily: "var(--font-garamond)",
                  fontSize: 13,
                  color: "#c8b89a",
                  lineHeight: 1.5,
                }}
              >
                {w.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: 10,
              color: "#b8965a",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Recommendations
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recommendations.map((rec, i) => {
              const chars = rec.suggestedIds
                .map((id) => allCharacters.find((c) => c.id === id))
                .filter(Boolean) as Character[];
              return (
                <div
                  key={i}
                  style={{
                    background: "#0a1400",
                    border: "1px solid #2a3a1a",
                    borderRadius: 6,
                    padding: "8px 10px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-garamond)",
                      fontSize: 13,
                      color: "#c8b89a",
                      lineHeight: 1.5,
                      marginBottom: 6,
                    }}
                  >
                    💡 {rec.reason}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {chars.map((c) => (
                      <div key={c.id} style={{ display: "flex", gap: 2 }}>
                        <button
                          onClick={() => onDetail(c.id)}
                          style={{
                            background: "#1a2a1a",
                            border: "1px solid #2a4a2a",
                            borderRadius: "4px 0 0 4px",
                            padding: "2px 8px",
                            fontSize: 11,
                            color: "#4a9a6a",
                            cursor: "pointer",
                            fontFamily: "var(--font-cinzel)",
                          }}
                        >
                          {c.name}
                        </button>
                        <button
                          onClick={() => onToggle(c.id)}
                          style={{
                            background: selectedIds.includes(c.id) ? "#4a1a1a" : "#1a2a1a",
                            border: `1px solid ${selectedIds.includes(c.id) ? "#8b1a1a" : "#2a4a2a"}`,
                            borderRadius: "0 4px 4px 0",
                            padding: "2px 6px",
                            fontSize: 11,
                            color: selectedIds.includes(c.id) ? "#c0392b" : "#4a9a6a",
                            cursor: "pointer",
                          }}
                        >
                          {selectedIds.includes(c.id) ? "−" : "+"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {warnings.length === 0 && recommendations.length === 0 && (
        <div
          style={{
            color: "#555",
            textAlign: "center",
            padding: "20px",
            fontFamily: "var(--font-garamond)",
            fontSize: 14,
          }}
        >
          Add more characters to see composition analysis.
        </div>
      )}
    </div>
  );
}
