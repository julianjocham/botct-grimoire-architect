"use client";

import { NightStep } from "@/lib/types";

interface NightOrderProps {
  steps: NightStep[];
  phase: "first" | "other";
  onPhaseChange: (phase: "first" | "other") => void;
}

export function NightOrder({ steps, phase, onPhaseChange }: NightOrderProps) {
  return (
    <div>
      {/* Phase toggle */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 12,
          background: "var(--bg-base)",
          borderRadius: 6,
          padding: 3,
        }}
      >
        {(["first", "other"] as const).map((p) => (
          <button
            key={p}
            onClick={() => onPhaseChange(p)}
            style={{
              flex: 1,
              padding: "5px 0",
              borderRadius: 4,
              border: "none",
              background: phase === p ? "#2a4a7f" : "transparent",
              color: phase === p ? "#e8dcc8" : "#666",
              cursor: "pointer",
              fontFamily: "var(--font-cinzel)",
              fontSize: 11,
              letterSpacing: "0.05em",
            }}
          >
            {p === "first" ? "First Night" : "Other Nights"}
          </button>
        ))}
      </div>

      {steps.length === 0 && (
        <div
          style={{
            color: "#555",
            textAlign: "center",
            padding: "20px",
            fontFamily: "var(--font-garamond)",
            fontSize: 14,
          }}
        >
          No night actions for this phase.
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {steps.map((step, i) => (
          <div
            key={step.character.id}
            style={{
              display: "flex",
              gap: 10,
              position: "relative",
            }}
          >
            {/* Timeline line */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                width: 28,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#1a1a2e",
                  border: "1px solid #3a3a5a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: 10,
                  color: "#b8965a",
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {step.order}
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: 1,
                    flex: 1,
                    minHeight: 12,
                    background: "#2a2a3a",
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                paddingBottom: 12,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: 12,
                  color: "#e8dcc8",
                  marginBottom: 3,
                }}
              >
                {step.character.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-garamond)",
                  fontSize: 12,
                  color: "#888",
                  lineHeight: 1.4,
                  marginBottom: step.contextHints.length > 0 ? 6 : 0,
                }}
              >
                {step.reminder}
              </div>
              {step.contextHints.map((hint, j) => (
                <div
                  key={j}
                  style={{
                    fontFamily: "var(--font-garamond)",
                    fontSize: 12,
                    color: "#c8a840",
                    lineHeight: 1.4,
                    background: "#1a1500",
                    border: "1px solid #3a3000",
                    borderRadius: 4,
                    padding: "4px 8px",
                    marginTop: 4,
                  }}
                >
                  ⚡ {hint}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
