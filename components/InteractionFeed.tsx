"use client";

import { InteractionHint, Character } from "@/lib/types";

interface InteractionFeedProps {
  hints: InteractionHint[];
  characters: Character[];
  onDetail: (id: string) => void;
}

const SEVERITY_STYLES: Record<
  string,
  { border: string; bg: string; icon: string; label: string }
> = {
  critical: {
    border: "#8b1a1a",
    bg: "#1a0808",
    icon: "⚠",
    label: "Critical",
  },
  important: {
    border: "#7a5a00",
    bg: "#1a1500",
    icon: "⚡",
    label: "Important",
  },
  tip: { border: "#1a4a2e", bg: "#0a1a10", icon: "💡", label: "Tip" },
};

export function InteractionFeed({
  hints,
  characters,
  onDetail,
}: InteractionFeedProps) {
  if (hints.length === 0) {
    return (
      <div
        style={{
          padding: 20,
          color: "#555",
          textAlign: "center",
          fontFamily: "var(--font-garamond)",
          fontSize: 14,
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
        padding: "8px 0",
      }}
    >
      {hints.map((hint, i) => {
        const style = SEVERITY_STYLES[hint.severity];
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
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{style.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    fontSize: 12,
                    color: "#e8dcc8",
                    marginBottom: 2,
                  }}
                >
                  {hint.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    marginBottom: 6,
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
                        fontFamily: "var(--font-cinzel)",
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
                    lineHeight: 1.5,
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
