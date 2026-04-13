"use client";

import { Character } from "@/lib/types";
import { InteractionFeedProps } from "@/components/types";
import { JINX_STYLE, SEVERITY_STYLES } from "@/constants/character";

export function InteractionFeed({ hints, characters, onDetail }: InteractionFeedProps) {
  if (hints.length === 0) {
    return (
      <div
        style={{
          padding: 20,
          color: "#555",
          textAlign: "center",
          fontFamily: "var(--font-garamond)",
          fontSize: 14
        }}
      >
        Add characters to see interaction warnings and tips.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "8px 0"
      }}
    >
      {hints.map((hint, i) => {
        const isJinx = hint.category === "jinx";
        const style = isJinx ? JINX_STYLE : SEVERITY_STYLES[hint.severity];
        const involvedChars = hint.involvedCharacters
          .map((id) => characters.find((c) => c.id === id))
          .filter(Boolean) as Character[];

        return (
          <div
            key={i}
            style={{
              border: `1px solid ${style.border}`,
              background: style.bg,
              borderRadius: 8,
              padding: "10px 12px",
              ...(isJinx && { borderStyle: "dashed" })
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 6
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{style.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  {isJinx && (
                    <span
                      style={{
                        fontFamily: "var(--font-cinzel)",
                        fontSize: 9,
                        color: "#b8965a",
                        background: "#2a1f00",
                        border: "1px solid #7a6200",
                        borderRadius: 3,
                        padding: "1px 5px",
                        letterSpacing: "0.05em",
                        flexShrink: 0
                      }}
                    >
                      ⚖ Djinn Jinx
                    </span>
                  )}
                  <div
                    style={{
                      fontFamily: "var(--font-cinzel)",
                      fontSize: 12,
                      color: "#e8dcc8"
                    }}
                  >
                    {hint.title}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    marginBottom: 6
                  }}
                >
                  {involvedChars.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onDetail(c.id)}
                      style={{
                        background: "#2a2a3a",
                        border: "none",
                        borderRadius: 4,
                        padding: "2px 6px",
                        fontSize: 11,
                        color: "#b8965a",
                        cursor: "pointer",
                        fontFamily: "var(--font-cinzel)"
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-garamond)",
                    fontSize: 13,
                    color: "#c8b89a",
                    lineHeight: 1.5
                  }}
                >
                  {hint.description}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
