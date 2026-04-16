"use client";

import { useMemo } from "react";
import { DashboardStepProps } from "@/types";
import { analyzeScript } from "@/lib/engine";
import { NightOrder } from "./NightOrder";
import { InteractionFeed } from "./InteractionFeed";
import { EDITIONS, FEEL_BARS, FEEL_COLOR } from "@/constants/info";
import { TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";
import { calculateStrengthTotals } from "@/lib/strength/calculate";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";

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
    <div className="mx-auto flex max-w-325 flex-col gap-5 px-6 pt-6 pb-12">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-parchment text-xl tracking-[0.04em]">
            {EDITIONS.find((ed) => ed.key === scriptSource)?.name ?? "Custom Script"}
          </div>
          <div className="font-body text-muted mt-0.5 text-base">
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
            className="border-subtle text-muted font-body cursor-pointer rounded-md border bg-transparent px-4 py-1.75 text-base"
          >
            ← Adjust Roster
          </button>
          <button
            onClick={handlePrint}
            className="border-tip font-display cursor-pointer rounded-md border bg-[#1a3a1a] px-4 py-1.75 text-xs tracking-[0.05em] text-[#4a9a6a]"
          >
            Print Script
          </button>
          <button
            onClick={onReset}
            className="text-blood font-body cursor-pointer rounded-md border border-[#3a1a1a] bg-transparent px-4 py-1.75 text-base"
          >
            New Game
          </button>
        </div>
      </div>

      {/* In-play character strip */}
      <Panel className="py-3">
        <div className="font-display text-dim text-2xs mb-2.5 tracking-widest uppercase">
          In Play — {gameIds.length} Characters
        </div>
        <div className="flex flex-col gap-2.5">
          {TEAM_ORDER.map((team) => {
            const chars = gameChars.filter((c) => c.team === team);
            if (chars.length === 0) return null;
            const col = TEAM_COLORS[team];
            return (
              <div key={team} className="flex flex-wrap items-center gap-2">
                <div
                  style={{ color: col.text }}
                  className="font-display text-3xs min-w-16 shrink-0 tracking-widest uppercase"
                >
                  {TEAM_LABEL[team]}
                </div>
                {chars.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onDetail(c.id)}
                    style={{ background: col.bg, borderColor: col.border, color: col.text }}
                    className="font-display cursor-pointer rounded-[5px] border px-2.5 py-1 text-xs"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            );
          })}
          {selectedTravelers.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-display text-gold text-3xs min-w-16 shrink-0 tracking-widest uppercase">
                Travelers
              </div>
              {selectedTravelers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onDetail(c.id)}
                  className="text-gold font-display cursor-pointer rounded-[5px] border border-[#4a3a20] bg-[#1a1500] px-2.5 py-1 text-xs"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Main 3-column grid */}
      <div className="grid grid-cols-[1fr_1fr_300px] gap-4">
        {/* Night Order */}
        <Panel className="flex flex-col">
          <SectionLabel className="mb-2.5">Night Order</SectionLabel>
          <div className="max-h-120 flex-1 overflow-y-auto">
            <NightOrder steps={nightSteps} phase={nightPhase} onPhaseChange={onNightPhaseChange} />
          </div>
        </Panel>

        {/* Interactions */}
        <Panel className="flex flex-col">
          <SectionLabel className="mb-2.5">Interactions ({analysis.interactionHints.length})</SectionLabel>
          <div className="max-h-120 flex-1 overflow-y-auto">
            <InteractionFeed hints={analysis.interactionHints} characters={allCharacters} onDetail={onDetail} />
          </div>
        </Panel>

        {/* Right column: Strength + Feel + Issues */}
        <div className="flex flex-col gap-3.5">
          {/* Team strength */}
          <Panel title="Team Strength">

            <div className="flex flex-col gap-2.5">
              {/* Good */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-townsfolk text-2xs font-mono uppercase">Good</span>
                  <span className="text-townsfolk font-mono text-xs">
                    {goodTotal > 0 ? "+" : ""}
                    {goodTotal}
                  </span>
                </div>
                <div className="bg-surface h-2 overflow-hidden rounded-sm">
                  <div
                    style={{ width: `${goodPct}%` }}
                    className="bg-good-blue h-full rounded-sm transition-[width] duration-300"
                  />
                </div>
              </div>
              {/* Evil */}
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-demon text-2xs font-mono uppercase">Evil</span>
                  <span className="text-demon font-mono text-xs">{evilTotal}</span>
                </div>
                <div className="bg-surface h-2 overflow-hidden rounded-sm">
                  <div
                    style={{ width: `${evilPct}%` }}
                    className="bg-blood-light h-full rounded-sm transition-[width] duration-300"
                  />
                </div>
              </div>
              <div className="font-body text-dim mt-0.5 text-center text-xs">
                {goodTotal > Math.abs(evilTotal) * 1.2
                  ? "Good has a strong advantage"
                  : Math.abs(evilTotal) > goodTotal * 1.2
                    ? "Evil has a strong advantage"
                    : "Roughly balanced"}
              </div>
            </div>
          </Panel>

          {/* Script feel */}
          <Panel title="Game Feel">
            <div className="flex flex-col gap-2">
              {FEEL_BARS.map(({ key, label, levels }) => {
                const val = analysis.scriptFeel[key] as string;
                const idx = levels.indexOf(val);
                const color = FEEL_COLOR[val] ?? "#b8965a";
                return (
                  <div key={key}>
                    <div className="mb-0.75 flex justify-between">
                      <span className="text-dim text-3xs font-mono tracking-[0.06em] uppercase">{label}</span>
                      <span style={{ color }} className="font-display text-3xs">
                        {val}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {levels.map((_, i) => (
                        <div
                          key={i}
                          style={{ background: i <= idx ? color : undefined }}
                          className={`h-1.5 flex-1 rounded-[2px]${i <= idx ? "" : "bg-subtle"}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-dimmer text-3xs mt-2.5 text-center font-mono">
              Night: {analysis.nightComplexity.complexityRating}
              {" · "}
              {analysis.nightOrder.first.length}↓ {analysis.nightOrder.other.length}↻
            </div>
          </Panel>

          {/* Issues */}
          {(analysis.compositionWarnings.length > 0 || criticals.length > 0) && (
            <Panel>
              <SectionLabel className="mb-2.5">Issues</SectionLabel>
              <div className="flex flex-col gap-1.5">
                {analysis.compositionWarnings.map((w, i) => (
                  <div
                    key={i}
                    className={`font-body text-parchment-muted rounded-[5px] border px-2.25 py-1.5 text-sm leading-normal ${
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
                  <div className="font-body text-gold rounded-[5px] border border-dashed border-[#7a6200] bg-[#1a1500] px-2.25 py-1.5 text-sm">
                    ⚖ {jinxes.length} Djinn Jinx{jinxes.length > 1 ? "es" : ""} — see Interactions tab
                  </div>
                )}
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* Print-only area */}
      <div className="print-only hidden">
        <div className="p-8 font-[Georgia,serif] text-black">
          <h1 className="mb-1 border-b-2 border-black pb-2 text-[24px]">
            Blood on the Clocktower — {EDITIONS.find((ed) => ed.key === scriptSource)?.name ?? "Custom Script"}
          </h1>
          <p className="text-muted mb-6 text-sm">
            {playerCount} players · {new Date().toLocaleDateString()}
          </p>

          {/* Night order */}
          <h2 className="mb-3 border-b border-[#ccc] pb-1 text-[16px]">Night Order</h2>
          <div className="mb-6 grid grid-cols-2 gap-x-6">
            <div>
              <h3 className="mb-2 text-base text-[#333]">First Night</h3>
              {analysis.nightOrder.first.map((s, i) => (
                <div key={s.character.id} className="mb-1 text-xs">
                  <strong>
                    {i + 1}. {s.character.name}
                  </strong>
                  {s.reminder && <div className="text-2xs text-muted ml-3">{s.reminder}</div>}
                </div>
              ))}
            </div>
            <div>
              <h3 className="mb-2 text-base text-[#333]">Other Nights</h3>
              {analysis.nightOrder.other.map((s, i) => (
                <div key={s.character.id} className="mb-1 text-xs">
                  <strong>
                    {i + 1}. {s.character.name}
                  </strong>
                  {s.reminder && <div className="text-2xs text-muted ml-3">{s.reminder}</div>}
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
                <h3 className="text-md mb-2.5 border-b border-[#eee] pb-1 tracking-[0.08em] uppercase">
                  {TEAM_LABEL[team]} ({chars.length})
                </h3>
                {chars
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => (
                    <div key={c.id} className="mb-2.5 [page-break-inside:avoid]">
                      <strong className="text-base">{c.name}</strong>
                      <div className="text-dimmer mt-0.5 text-xs leading-normal">{c.ability}</div>
                      {c.firstNightReminder && (
                        <div className="text-2xs mt-0.5 text-[#888]">1st Night: {c.firstNightReminder}</div>
                      )}
                      {c.otherNightReminder && (
                        <div className="text-2xs text-[#888]">Other Nights: {c.otherNightReminder}</div>
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
                <div key={i} className="mb-2.5 text-xs">
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
