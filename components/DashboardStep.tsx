"use client";

import { useMemo } from "react";
import { Character, Interaction, EditionKey } from "@/lib/types";
import { analyzeScript, calculateStrengthTotals } from "@/lib/engine";
import { NightOrder } from "./NightOrder";
import { InteractionFeed } from "./InteractionFeed";

interface DashboardStepProps {
  scriptSource: EditionKey | null;
  scriptIds: string[];
  playerCount: number;
  gameIds: string[];
  allCharacters: Character[];
  interactions: Interaction[];
  nightPhase: "first" | "other";
  onNightPhaseChange: (p: "first" | "other") => void;
  onDetail: (id: string) => void;
  onBackToSetup: () => void;
  onReset: () => void;
}

const EDITION_LABELS: Record<string, string> = {
  tb: "Trouble Brewing",
  bmr: "Bad Moon Rising",
  snv: "Sects & Violets",
  custom: "Custom Script",
};

const TEAM_ORDER = ["townsfolk", "outsider", "minion", "demon"] as const;
const TEAM_LABEL: Record<string, string> = {
  townsfolk: "Townsfolk",
  outsider: "Outsiders",
  minion: "Minions",
  demon: "Demons",
};
const TEAM_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  townsfolk: { text: "#5b9bd5", border: "#2a4a7f", bg: "#0d1a2e" },
  outsider:  { text: "#9b7fd5", border: "#4a2a7f", bg: "#1a0d2e" },
  minion:    { text: "#d5825b", border: "#7f2a2a", bg: "#2e0d0d" },
  demon:     { text: "#d55b5b", border: "#7f1a1a", bg: "#2e0808" },
};

const FEEL_BARS: Array<{
  key: "infoLevel" | "lethalityLevel" | "chaosLevel" | "stWorkload";
  label: string;
  levels: string[];
}> = [
  { key: "infoLevel",     label: "Info",     levels: ["Blind","Low","Moderate","High","Flooded"] },
  { key: "lethalityLevel",label: "Lethality",levels: ["Gentle","Standard","Deadly","Massacre"] },
  { key: "chaosLevel",    label: "Chaos",    levels: ["Orderly","Moderate","Chaotic","Pandemonium"] },
  { key: "stWorkload",    label: "ST Load",  levels: ["Light","Moderate","Heavy","Exhausting"] },
];
const FEEL_COLOR: Record<string, string> = {
  Blind:"#c0392b",Low:"#e67e22",Moderate:"#b8965a",High:"#2a7fd4",Flooded:"#1a5fa8",
  Gentle:"#2d6a4f",Standard:"#b8965a",Deadly:"#e67e22",Massacre:"#c0392b",
  Orderly:"#2d6a4f",Chaotic:"#e67e22",Pandemonium:"#c0392b",
  Light:"#2d6a4f",Heavy:"#e67e22",Exhausting:"#c0392b",
};

export function DashboardStep({
  scriptSource,
  playerCount,
  gameIds,
  allCharacters,
  interactions,
  nightPhase,
  onNightPhaseChange,
  onDetail,
  onBackToSetup,
  onReset,
}: DashboardStepProps) {
  const gameChars = allCharacters.filter((c) => gameIds.includes(c.id));

  const analysis = useMemo(
    () => analyzeScript(gameIds, allCharacters, interactions, "game"),
    [gameIds, allCharacters, interactions]
  );

  const { good: goodTotal, evil: evilTotal } = useMemo(
    () => calculateStrengthTotals(gameIds, allCharacters),
    [gameIds, allCharacters]
  );

  const strengthRange = Math.max(Math.abs(goodTotal), Math.abs(evilTotal), 100);
  const goodPct = Math.round((Math.abs(goodTotal) / strengthRange) * 100);
  const evilPct = Math.round((Math.abs(evilTotal) / strengthRange) * 100);

  const criticals = analysis.interactionHints.filter((h) => h.severity === "critical");
  const important = analysis.interactionHints.filter((h) => h.severity === "important" && h.category !== "jinx");
  const jinxes    = analysis.interactionHints.filter((h) => h.category === "jinx");

  const nightSteps = nightPhase === "first"
    ? analysis.nightOrder.first
    : analysis.nightOrder.other;

  function handlePrint() { window.print(); }

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "24px 24px 48px", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 20, color: "#e8dcc8", letterSpacing: "0.04em" }}>
            {EDITION_LABELS[scriptSource ?? "custom"]}
          </div>
          <div style={{ fontFamily: "var(--font-garamond)", fontSize: 13, color: "#666", marginTop: 2 }}>
            {playerCount} players · {gameIds.length} characters in play
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onBackToSetup}
            style={{ background: "none", border: "1px solid #2a2a3a", borderRadius: 6, padding: "7px 16px", color: "#666", cursor: "pointer", fontFamily: "var(--font-garamond)", fontSize: 13 }}
          >
            ← Adjust Roster
          </button>
          <button
            onClick={handlePrint}
            style={{ background: "#1a3a1a", border: "1px solid #2d6a4f", borderRadius: 6, padding: "7px 16px", color: "#4a9a6a", cursor: "pointer", fontFamily: "var(--font-cinzel)", fontSize: 11, letterSpacing: "0.05em" }}
          >
            Print Script
          </button>
          <button
            onClick={onReset}
            style={{ background: "none", border: "1px solid #3a1a1a", borderRadius: 6, padding: "7px 16px", color: "#8b1a1a", cursor: "pointer", fontFamily: "var(--font-garamond)", fontSize: 13 }}
          >
            New Game
          </button>
        </div>
      </div>

      {/* In-play character strip */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid #2a2a3a",
          borderRadius: 10,
          padding: "12px 16px",
        }}
      >
        <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
          In Play — {gameIds.length} Characters
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TEAM_ORDER.map((team) => {
            const chars = gameChars.filter((c) => c.team === team);
            if (chars.length === 0) return null;
            const col = TEAM_COLORS[team];
            return (
              <div key={team} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 9, color: col.text, textTransform: "uppercase", letterSpacing: "0.1em", minWidth: 64, flexShrink: 0 }}>
                  {TEAM_LABEL[team]}
                </div>
                {chars.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onDetail(c.id)}
                    style={{
                      background: col.bg,
                      border: `1px solid ${col.border}`,
                      borderRadius: 5,
                      padding: "4px 10px",
                      color: col.text,
                      cursor: "pointer",
                      fontFamily: "var(--font-cinzel)",
                      fontSize: 11,
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 3-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 16 }}>

        {/* Night Order */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid #2a2a3a",
            borderRadius: 10,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, color: "#b8965a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            Night Order
          </div>
          <div style={{ overflowY: "auto", maxHeight: 480, flex: 1 }}>
            <NightOrder
              steps={nightSteps}
              phase={nightPhase}
              onPhaseChange={onNightPhaseChange}
            />
          </div>
        </div>

        {/* Interactions */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid #2a2a3a",
            borderRadius: 10,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, color: "#b8965a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            Interactions ({analysis.interactionHints.length})
          </div>
          <div style={{ overflowY: "auto", maxHeight: 480, flex: 1 }}>
            <InteractionFeed
              hints={analysis.interactionHints}
              characters={allCharacters}
              onDetail={onDetail}
            />
          </div>
        </div>

        {/* Right column: Strength + Feel + Issues */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Team strength */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid #2a2a3a",
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, color: "#b8965a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Team Strength
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Good */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 10, color: "#5b9bd5", textTransform: "uppercase" }}>Good</span>
                  <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 11, color: "#5b9bd5" }}>
                    {goodTotal > 0 ? "+" : ""}{goodTotal}
                  </span>
                </div>
                <div style={{ height: 8, background: "#14141f", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${goodPct}%`, background: "#2a7fd4", borderRadius: 4, transition: "width 0.3s" }} />
                </div>
              </div>
              {/* Evil */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 10, color: "#d55b5b", textTransform: "uppercase" }}>Evil</span>
                  <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 11, color: "#d55b5b" }}>
                    {evilTotal}
                  </span>
                </div>
                <div style={{ height: 8, background: "#14141f", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${evilPct}%`, background: "#c0392b", borderRadius: 4, transition: "width 0.3s" }} />
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-garamond)", fontSize: 11, color: "#555", textAlign: "center", marginTop: 2 }}>
                {goodTotal > Math.abs(evilTotal) * 1.2
                  ? "Good has a strong advantage"
                  : Math.abs(evilTotal) > goodTotal * 1.2
                  ? "Evil has a strong advantage"
                  : "Roughly balanced"}
              </div>
            </div>
          </div>

          {/* Script feel */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid #2a2a3a",
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, color: "#b8965a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Game Feel
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FEEL_BARS.map(({ key, label, levels }) => {
                const val = analysis.scriptFeel[key] as string;
                const idx = levels.indexOf(val);
                const color = FEEL_COLOR[val] ?? "#b8965a";
                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
                      <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 9, color }}>{val}</span>
                    </div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {levels.map((_, i) => (
                        <div
                          key={i}
                          style={{ flex: 1, height: 6, borderRadius: 2, background: i <= idx ? color : "#2a2a3a" }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains)", fontSize: 9, color: "#444", marginTop: 10, textAlign: "center" }}>
              Night: {analysis.nightComplexity.complexityRating}
              {" · "}{analysis.nightOrder.first.length}↓ {analysis.nightOrder.other.length}↻
            </div>
          </div>

          {/* Issues */}
          {(analysis.compositionWarnings.length > 0 || criticals.length > 0) && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid #2a2a3a",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, color: "#b8965a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                Issues
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {analysis.compositionWarnings.map((w, i) => (
                  <div
                    key={i}
                    style={{
                      background: w.severity === "critical" ? "#1a0808" : w.severity === "important" ? "#1a1400" : "#0a1408",
                      border: `1px solid ${w.severity === "critical" ? "#8b1a1a" : w.severity === "important" ? "#7a5a00" : "#1a4a2e"}`,
                      borderRadius: 5,
                      padding: "6px 9px",
                      fontFamily: "var(--font-garamond)",
                      fontSize: 12,
                      color: "#c8b89a",
                      lineHeight: 1.5,
                    }}
                  >
                    {w.severity === "critical" ? "⚠" : w.severity === "important" ? "⚡" : "💡"} {w.message}
                  </div>
                ))}
                {jinxes.length > 0 && (
                  <div
                    style={{
                      background: "#1a1500",
                      border: "1px dashed #7a6200",
                      borderRadius: 5,
                      padding: "6px 9px",
                      fontFamily: "var(--font-garamond)",
                      fontSize: 12,
                      color: "#b8965a",
                    }}
                  >
                    ⚖ {jinxes.length} Djinn Jinx{jinxes.length > 1 ? "es" : ""} — see Interactions tab
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print-only area */}
      <div className="print-only" style={{ display: "none" }}>
        <div style={{ fontFamily: "Georgia, serif", padding: 32, color: "#000" }}>
          <h1 style={{ fontSize: 24, marginBottom: 4, borderBottom: "2px solid #000", paddingBottom: 8 }}>
            Blood on the Clocktower — {EDITION_LABELS[scriptSource ?? "custom"]}
          </h1>
          <p style={{ fontSize: 12, color: "#666", marginBottom: 24 }}>
            {playerCount} players · {new Date().toLocaleDateString()}
          </p>

          {/* Night order */}
          <h2 style={{ fontSize: 16, borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 12 }}>
            Night Order
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px", marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 13, marginBottom: 8, color: "#333" }}>First Night</h3>
              {analysis.nightOrder.first.map((s, i) => (
                <div key={s.character.id} style={{ fontSize: 11, marginBottom: 4 }}>
                  <strong>{i + 1}. {s.character.name}</strong>
                  {s.reminder && <div style={{ color: "#666", fontSize: 10, marginLeft: 12 }}>{s.reminder}</div>}
                </div>
              ))}
            </div>
            <div>
              <h3 style={{ fontSize: 13, marginBottom: 8, color: "#333" }}>Other Nights</h3>
              {analysis.nightOrder.other.map((s, i) => (
                <div key={s.character.id} style={{ fontSize: 11, marginBottom: 4 }}>
                  <strong>{i + 1}. {s.character.name}</strong>
                  {s.reminder && <div style={{ color: "#666", fontSize: 10, marginLeft: 12 }}>{s.reminder}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Characters by team */}
          <h2 style={{ fontSize: 16, borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 12, pageBreakBefore: "always" }}>
            Characters in Play
          </h2>
          {TEAM_ORDER.map((team) => {
            const chars = gameChars.filter((c) => c.team === team);
            if (chars.length === 0) return null;
            return (
              <div key={team} style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #eee", paddingBottom: 4, marginBottom: 10 }}>
                  {TEAM_LABEL[team]} ({chars.length})
                </h3>
                {chars.sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                  <div key={c.id} style={{ marginBottom: 10, pageBreakInside: "avoid" }}>
                    <strong style={{ fontSize: 13 }}>{c.name}</strong>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2, lineHeight: 1.5 }}>{c.ability}</div>
                    {c.firstNightReminder && (
                      <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>1st Night: {c.firstNightReminder}</div>
                    )}
                    {c.otherNightReminder && (
                      <div style={{ fontSize: 10, color: "#888" }}>Other Nights: {c.otherNightReminder}</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}

          {/* Key interactions */}
          {criticals.concat(important).length > 0 && (
            <>
              <h2 style={{ fontSize: 16, borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 12, pageBreakBefore: "always" }}>
                Key Interactions
              </h2>
              {criticals.concat(important).map((h, i) => (
                <div key={i} style={{ marginBottom: 10, fontSize: 11 }}>
                  <strong>{h.title}</strong>
                  <div style={{ color: "#555", marginTop: 2 }}>{h.description}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
