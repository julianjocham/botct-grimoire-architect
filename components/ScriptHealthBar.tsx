"use client";

import { ScriptHealthBarProps } from "@/components/types";
import {
  CAT_SHORT,
  CHAOS_LEVEL,
  EVIL_CATEGORIES,
  FEEL_COLOR,
  GOOD_CATEGORIES,
  INFO_LEVEL,
  LETHAL_LEVEL,
  ST_LEVEL,
} from "@/constants/info";

function FeelBar({
  label,
  value,
  levelMap,
  maxBars = 4,
}: {
  label: string;
  value: string;
  levelMap: Record<string, number>;
  maxBars?: number;
}) {
  const color = FEEL_COLOR[value] ?? "#b8965a";
  const filled = levelMap[value] ?? 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-jetbrains)",
          fontSize: 9,
          color: "#666",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: maxBars }, (_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 1,
              background: i <= filled ? color : "#2a2a3a",
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: "var(--font-cinzel)",
          fontSize: 9,
          color,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function ScriptHealthBar({ analysis }: ScriptHealthBarProps) {
  const {
    scriptFeel,
    nightComplexity,
    interactionHints,
    compositionWarnings,
    goodStrengthTotal,
    evilStrengthTotal,
  } = analysis;
  const criticalCount = interactionHints.filter((h) => h.severity === "critical").length;
  const warnCount = compositionWarnings.filter((w) => w.severity !== "tip").length;

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid #2a2a3a",
        borderRadius: 10,
        padding: "10px 16px",
        display: "flex",
        gap: 20,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* Script feel bars */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <FeelBar label="Info" value={scriptFeel.infoLevel} levelMap={INFO_LEVEL} maxBars={4} />
        <FeelBar
          label="Lethal"
          value={scriptFeel.lethalityLevel}
          levelMap={LETHAL_LEVEL}
          maxBars={3}
        />
        <FeelBar label="Chaos" value={scriptFeel.chaosLevel} levelMap={CHAOS_LEVEL} maxBars={3} />
        <FeelBar label="ST Load" value={scriptFeel.stWorkload} levelMap={ST_LEVEL} maxBars={3} />
      </div>

      <div style={{ width: 1, height: 28, background: "#2a2a3a", flexShrink: 0 }} />

      {/* Night complexity */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: 9,
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Night
        </span>
        <span
          style={{
            fontFamily: "var(--font-cinzel)",
            fontSize: 11,
            color: "#b8965a",
          }}
        >
          {nightComplexity.complexityRating}
        </span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: 9,
            color: "#555",
          }}
          title={`First night: ${nightComplexity.firstNightSteps} steps · Other nights: ${nightComplexity.otherNightSteps} steps`}
        >
          {nightComplexity.firstNightSteps}↓ {nightComplexity.otherNightSteps}↻
        </span>
      </div>

      <div style={{ width: 1, height: 28, background: "#2a2a3a", flexShrink: 0 }} />

      {/* Strength totals */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: 9,
              color: "#2a7fd4",
              textTransform: "uppercase",
            }}
          >
            Good
          </span>
          <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 11, color: "#2a7fd4" }}>
            {goodStrengthTotal > 0 ? "+" : ""}
            {goodStrengthTotal}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: 9,
              color: "#c0392b",
              textTransform: "uppercase",
            }}
          >
            Evil
          </span>
          <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 11, color: "#c0392b" }}>
            {evilStrengthTotal}
          </span>
        </div>
      </div>

      <div style={{ width: 1, height: 28, background: "#2a2a3a", flexShrink: 0 }} />

      {/* Warnings badges */}
      <div style={{ display: "flex", gap: 6 }}>
        {criticalCount > 0 && (
          <span
            style={{
              background: "#8b1a1a",
              borderRadius: 10,
              padding: "2px 8px",
              fontSize: 11,
              color: "#e8dcc8",
              fontFamily: "var(--font-cinzel)",
            }}
          >
            ⚠ {criticalCount} critical
          </span>
        )}
        {warnCount > 0 && (
          <span
            style={{
              background: "#5a4000",
              borderRadius: 10,
              padding: "2px 8px",
              fontSize: 11,
              color: "#e8dcc8",
              fontFamily: "var(--font-cinzel)",
            }}
          >
            ⚡ {warnCount} warnings
          </span>
        )}
        {criticalCount === 0 && warnCount === 0 && (
          <span
            style={{
              fontSize: 11,
              color: "#555",
              fontFamily: "var(--font-garamond)",
            }}
          >
            No critical issues
          </span>
        )}
      </div>

      {/* Category coverage */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {GOOD_CATEGORIES.map((cat) => {
          const present = !!analysis.categoryCoverage.good[cat];
          return (
            <span
              key={cat}
              title={
                present ? (analysis.categoryCoverage.good[cat] ?? []).join(", ") : `Missing: ${cat}`
              }
              style={{
                fontSize: 9,
                padding: "2px 5px",
                borderRadius: 3,
                background: present ? "#0d2a1a" : "#1a1a1a",
                border: `1px solid ${present ? "#2d6a4f" : "#2a2a2a"}`,
                color: present ? "#4a9a6a" : "#444",
                fontFamily: "var(--font-jetbrains)",
                cursor: "default",
              }}
            >
              {present ? "✓" : "✗"} {CAT_SHORT[cat] ?? cat}
            </span>
          );
        })}
        {EVIL_CATEGORIES.map((cat) => {
          const present = !!analysis.categoryCoverage.evil[cat];
          return (
            <span
              key={cat}
              title={
                present ? (analysis.categoryCoverage.evil[cat] ?? []).join(", ") : `Missing: ${cat}`
              }
              style={{
                fontSize: 9,
                padding: "2px 5px",
                borderRadius: 3,
                background: present ? "#2a0d0d" : "#1a1a1a",
                border: `1px solid ${present ? "#6a2d2d" : "#2a2a2a"}`,
                color: present ? "#c0604a" : "#444",
                fontFamily: "var(--font-jetbrains)",
                cursor: "default",
              }}
            >
              {present ? "✓" : "✗"} {CAT_SHORT[cat] ?? cat}
            </span>
          );
        })}
      </div>
    </div>
  );
}
