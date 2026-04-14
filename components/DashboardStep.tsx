"use client";

import { useMemo } from "react";
import { analyzeScript, calculateStrengthTotals } from "@/lib/engine";
import { NightOrder } from "./NightOrder";
import { InteractionFeed } from "./InteractionFeed";
import { DashboardStepProps } from "@/components/types";
import { EDITIONS, FEEL_BARS, FEEL_COLOR } from "@/constants/info";
import { TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";

export function DashboardStep({
  scriptSource,
  playerCount,
  gameIds,
  allCharacters,
  editionTravelers,
  interactions,
  nightPhase,
  onNightPhaseChange,
  onDetail,
  onBackToSetup,
  onReset
}: DashboardStepProps) {
  const travelerIdSet = new Set(editionTravelers.map((t) => t.id));
  const coreGameIds = gameIds.filter((id) => !travelerIdSet.has(id));
  const selectedTravelers = editionTravelers.filter((t) => gameIds.includes(t.id));
  const gameChars = allCharacters.filter((c) => coreGameIds.includes(c.id));

  const analysis = useMemo(
    () => analyzeScript(coreGameIds, allCharacters, interactions, "game"),
    [coreGameIds, allCharacters, interactions]
  );

  const { good: goodTotal, evil: evilTotal } = useMemo(
    () => calculateStrengthTotals(coreGameIds, allCharacters),
    [coreGameIds, allCharacters]
  );

  const strengthRange = Math.max(Math.abs(goodTotal), Math.abs(evilTotal), 100);
  const goodPct = Math.round((Math.abs(goodTotal) / strengthRange) * 100);
  const evilPct = Math.round((Math.abs(evilTotal) / strengthRange) * 100);

  const criticals = analysis.interactionHints.filter((h) => h.severity === "critical");
  const important = analysis.interactionHints.filter((h) => h.severity === "important" && h.category !== "jinx");
  const jinxes = analysis.interactionHints.filter((h) => h.category === "jinx");

  const nightSteps = nightPhase === "first" ? analysis.nightOrder.first : analysis.nightOrder.other;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="mx-auto flex max-w-[1300px] flex-col gap-5 px-6 pt-6 pb-12">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-parchment text-[20px] tracking-[0.04em]">
            {EDITIONS[scriptSource ?? "custom"]}
          </div>
          <div className="font-body text-muted mt-0.5 text-[13px]">
            {playerCount} players · {coreGameIds.length} characters
            {selectedTravelers.length > 0
              ? ` + ${selectedTravelers.length} traveler${selectedTravelers.length > 1 ? "s" : ""}`
              : ""}{" "}
            in play
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBackToSetup}
            className="border-subtle text-muted font-body cursor-pointer rounded-[6px] border bg-transparent px-4 py-[7px] text-[13px]"
          >
            ← Adjust Roster
          </button>
          <button
            onClick={handlePrint}
            className="border-tip font-display cursor-pointer rounded-[6px] border bg-[#1a3a1a] px-4 py-[7px] text-[11px] tracking-[0.05em] text-[#4a9a6a]"
          >
            Print Script
          </button>
          <button
            onClick={onReset}
            className="text-blood font-body cursor-pointer rounded-[6px] border border-[#3a1a1a] bg-transparent px-4 py-[7px] text-[13px]"
          >
            New Game
          </button>
        </div>
      </div>

      {/* In-play character strip */}
      <div className="bg-surface border-subtle rounded-[10px] border px-4 py-3">
        <div className="font-display text-dim mb-[10px] text-[10px] tracking-[0.1em] uppercase">
          In Play — {gameIds.length} Characters
        </div>
        <div className="flex flex-col gap-[10px]">
          {TEAM_ORDER.map((team) => {
            const chars = gameChars.filter((c) => c.team === team);
            if (chars.length === 0) return null;
            const col = TEAM_COLORS[team];
            return (
              <div key={team} className="flex flex-wrap items-center gap-2">
                <div
                  style={{ color: col.text }}
                  className="font-display min-w-16 shrink-0 text-[9px] tracking-[0.1em] uppercase"
                >
                  {TEAM_LABEL[team]}
                </div>
                {chars.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onDetail(c.id)}
                    style={{ background: col.bg, borderColor: col.border, color: col.text }}
                    className="font-display cursor-pointer rounded-[5px] border px-[10px] py-1 text-[11px]"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            );
          })}
          {selectedTravelers.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-display text-gold min-w-16 shrink-0 text-[9px] tracking-[0.1em] uppercase">
                Travelers
              </div>
              {selectedTravelers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onDetail(c.id)}
                  className="text-gold font-display cursor-pointer rounded-[5px] border border-[#4a3a20] bg-[#1a1500] px-[10px] py-1 text-[11px]"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main 3-column grid */}
      <div className="grid grid-cols-[1fr_1fr_300px] gap-4">
        {/* Night Order */}
        <div className="bg-surface border-subtle flex flex-col rounded-[10px] border px-4 py-[14px]">
          <div className="font-display text-gold mb-[10px] text-[11px] tracking-[0.08em] uppercase">Night Order</div>
          <div className="max-h-[480px] flex-1 overflow-y-auto">
            <NightOrder steps={nightSteps} phase={nightPhase} onPhaseChange={onNightPhaseChange} />
          </div>
        </div>

        {/* Interactions */}
        <div className="bg-surface border-subtle flex flex-col rounded-[10px] border px-4 py-[14px]">
          <div className="font-display text-gold mb-[10px] text-[11px] tracking-[0.08em] uppercase">
            Interactions ({analysis.interactionHints.length})
          </div>
          <div className="max-h-[480px] flex-1 overflow-y-auto">
            <InteractionFeed hints={analysis.interactionHints} characters={allCharacters} onDetail={onDetail} />
          </div>
        </div>

        {/* Right column: Strength + Feel + Issues */}
        <div className="flex flex-col gap-[14px]">
          {/* Team strength */}
          <div className="bg-surface border-subtle rounded-[10px] border px-4 py-[14px]">
            <div className="font-display text-gold mb-3 text-[11px] tracking-[0.08em] uppercase">Team Strength</div>

            <div className="flex flex-col gap-[10px]">
              {/* Good */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-townsfolk font-mono text-[10px] uppercase">Good</span>
                  <span className="text-townsfolk font-mono text-[11px]">
                    {goodTotal > 0 ? "+" : ""}
                    {goodTotal}
                  </span>
                </div>
                <div className="bg-surface h-2 overflow-hidden rounded-[4px]">
                  <div
                    style={{ width: `${goodPct}%` }}
                    className="bg-good-blue h-full rounded-[4px] transition-[width] duration-300"
                  />
                </div>
              </div>
              {/* Evil */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-demon font-mono text-[10px] uppercase">Evil</span>
                  <span className="text-demon font-mono text-[11px]">{evilTotal}</span>
                </div>
                <div className="bg-surface h-2 overflow-hidden rounded-[4px]">
                  <div
                    style={{ width: `${evilPct}%` }}
                    className="bg-blood-light h-full rounded-[4px] transition-[width] duration-300"
                  />
                </div>
              </div>
              <div className="font-body text-dim mt-0.5 text-center text-[11px]">
                {goodTotal > Math.abs(evilTotal) * 1.2
                  ? "Good has a strong advantage"
                  : Math.abs(evilTotal) > goodTotal * 1.2
                    ? "Evil has a strong advantage"
                    : "Roughly balanced"}
              </div>
            </div>
          </div>

          {/* Script feel */}
          <div className="bg-surface border-subtle rounded-[10px] border px-4 py-[14px]">
            <div className="font-display text-gold mb-3 text-[11px] tracking-[0.08em] uppercase">Game Feel</div>
            <div className="flex flex-col gap-2">
              {FEEL_BARS.map(({ key, label, levels }) => {
                const val = analysis.scriptFeel[key] as string;
                const idx = levels.indexOf(val);
                const color = FEEL_COLOR[val] ?? "#b8965a";
                return (
                  <div key={key}>
                    <div className="mb-[3px] flex justify-between">
                      <span className="text-dim font-mono text-[9px] tracking-[0.06em] uppercase">{label}</span>
                      <span style={{ color }} className="font-display text-[9px]">
                        {val}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {levels.map((_, i) => (
                        <div
                          key={i}
                          style={{ background: i <= idx ? color : undefined }}
                          className={`h-[6px] flex-1 rounded-[2px]${i <= idx ? "" : "bg-subtle"}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-dimmer mt-[10px] text-center font-mono text-[9px]">
              Night: {analysis.nightComplexity.complexityRating}
              {" · "}
              {analysis.nightOrder.first.length}↓ {analysis.nightOrder.other.length}↻
            </div>
          </div>

          {/* Issues */}
          {(analysis.compositionWarnings.length > 0 || criticals.length > 0) && (
            <div className="bg-surface border-subtle rounded-[10px] border px-4 py-[14px]">
              <div className="font-display text-gold mb-[10px] text-[11px] tracking-[0.08em] uppercase">Issues</div>
              <div className="flex flex-col gap-[6px]">
                {analysis.compositionWarnings.map((w, i) => (
                  <div
                    key={i}
                    className={`font-body text-parchment-muted rounded-[5px] border px-[9px] py-[6px] text-[12px] leading-[1.5] ${
                      w.severity === "critical"
                        ? "border-blood bg-[#1a0808]"
                        : w.severity === "important"
                          ? "border-[#7a5a00] bg-[#1a1400]"
                          : "border-[#1a4a2e] bg-[#0a1408]"
                    }`}
                  >
                    {w.severity === "critical" ? "⚠" : w.severity === "important" ? "⚡" : "💡"} {w.message}
                  </div>
                ))}
                {jinxes.length > 0 && (
                  <div className="font-body text-gold rounded-[5px] border border-dashed border-[#7a6200] bg-[#1a1500] px-[9px] py-[6px] text-[12px]">
                    ⚖ {jinxes.length} Djinn Jinx{jinxes.length > 1 ? "es" : ""} — see Interactions tab
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print-only area */}
      <div className="print-only hidden">
        <div className="p-8 font-[Georgia,serif] text-black">
          <h1 className="mb-1 border-b-2 border-black pb-2 text-[24px]">
            Blood on the Clocktower — {EDITIONS[scriptSource ?? "custom"]}
          </h1>
          <p className="mb-6 text-[12px] text-[#666]">
            {playerCount} players · {new Date().toLocaleDateString()}
          </p>

          {/* Night order */}
          <h2 className="mb-3 border-b border-[#ccc] pb-1 text-[16px]">Night Order</h2>
          <div className="mb-6 grid grid-cols-2 gap-x-6">
            <div>
              <h3 className="mb-2 text-[13px] text-[#333]">First Night</h3>
              {analysis.nightOrder.first.map((s, i) => (
                <div key={s.character.id} className="mb-1 text-[11px]">
                  <strong>
                    {i + 1}. {s.character.name}
                  </strong>
                  {s.reminder && <div className="ml-3 text-[10px] text-[#666]">{s.reminder}</div>}
                </div>
              ))}
            </div>
            <div>
              <h3 className="mb-2 text-[13px] text-[#333]">Other Nights</h3>
              {analysis.nightOrder.other.map((s, i) => (
                <div key={s.character.id} className="mb-1 text-[11px]">
                  <strong>
                    {i + 1}. {s.character.name}
                  </strong>
                  {s.reminder && <div className="ml-3 text-[10px] text-[#666]">{s.reminder}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Characters by team */}
          <h2 className="mb-3 border-b border-[#ccc] pb-1 text-[16px] [page-break-before:always]">
            Characters in Play
          </h2>
          {TEAM_ORDER.map((team) => {
            const chars = gameChars.filter((c) => c.team === team);
            if (chars.length === 0) return null;
            return (
              <div key={team} className="mb-5">
                <h3 className="mb-[10px] border-b border-[#eee] pb-1 text-[14px] tracking-[0.08em] uppercase">
                  {TEAM_LABEL[team]} ({chars.length})
                </h3>
                {chars
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => (
                    <div key={c.id} className="mb-[10px] [page-break-inside:avoid]">
                      <strong className="text-[13px]">{c.name}</strong>
                      <div className="text-dimmer mt-0.5 text-[11px] leading-[1.5]">{c.ability}</div>
                      {c.firstNightReminder && (
                        <div className="mt-0.5 text-[10px] text-[#888]">1st Night: {c.firstNightReminder}</div>
                      )}
                      {c.otherNightReminder && (
                        <div className="text-[10px] text-[#888]">Other Nights: {c.otherNightReminder}</div>
                      )}
                    </div>
                  ))}
              </div>
            );
          })}

          {/* Key interactions */}
          {criticals.concat(important).length > 0 && (
            <>
              <h2 className="mb-3 border-b border-[#ccc] pb-1 text-[16px] [page-break-before:always]">
                Key Interactions
              </h2>
              {criticals.concat(important).map((h, i) => (
                <div key={i} className="mb-[10px] text-[11px]">
                  <strong>{h.title}</strong>
                  <div className="text-dim mt-0.5">{h.description}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
