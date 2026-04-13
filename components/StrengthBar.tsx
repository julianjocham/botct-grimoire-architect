"use client";

import { StrengthBarProps } from "@/components/types";

function getBarColor(value: number): string {
  if (value >= 40) return "#2a7fd4";
  if (value >= 10) return "#3a6abf";
  if (value >= -10) return "#555577";
  if (value >= -40) return "#8b2222";
  return "#c0392b";
}

export function StrengthBar({
  value,
  showNumber = true,
  effectiveValue,
  small = false,
}: StrengthBarProps) {
  const displayValue = effectiveValue ?? value;
  const barWidth = `${Math.abs(displayValue)}%`;
  const isPositive = displayValue >= 0;
  const color = getBarColor(displayValue);

  return (
    <div className={`flex items-center gap-1 ${small ? "gap-0.5" : ""}`}>
      {/* Negative side */}
      <div className="flex-1 flex justify-end" style={{ height: small ? 4 : 6 }}>
        <div
          style={{
            width: !isPositive ? barWidth : "0%",
            background: color,
            height: "100%",
            borderRadius: "2px 0 0 2px",
            transition: "width 0.2s ease",
          }}
        />
      </div>

      {/* Center line */}
      <div
        style={{
          width: 1,
          background: "#3a3a4a",
          height: small ? 8 : 10,
          flexShrink: 0,
        }}
      />

      {/* Positive side */}
      <div className="flex-1" style={{ height: small ? 4 : 6 }}>
        <div
          style={{
            width: isPositive ? barWidth : "0%",
            background: color,
            height: "100%",
            borderRadius: "0 2px 2px 0",
            transition: "width 0.2s ease",
          }}
        />
      </div>

      {showNumber && (
        <span
          style={{
            color: color,
            fontFamily: "var(--font-jetbrains)",
            fontSize: small ? 10 : 11,
            minWidth: 32,
            textAlign: "right",
          }}
        >
          {displayValue > 0 ? "+" : ""}
          {displayValue}
        </span>
      )}
    </div>
  );
}
