"use client";

import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { DashboardStepProps } from "@/types";
import { analyzeScript } from "@/lib/engine";
import { NightOrder } from "./NightOrder";
import { InteractionFeed } from "./InteractionFeed";
import { PrintPortal } from "@/components/features/PrintPortal";
import { FEEL_BARS, FEEL_COLOR } from "@/constants/info";
import { TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";
import { calculateStrengthTotals } from "@/lib/strength/calculate";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CharacterIcon } from "@/components/ui/CharacterIcon";
import { cn } from "@/lib/cn";

type PrintMode = "pretty" | "clean";

export function DashboardStep({
  scriptDisplayName,
  scriptIds,
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
  const coreGameIds = useMemo(
    () => gameIds.filter((id) => !editionTravelers.some((t) => t.id === id)),
    [gameIds, editionTravelers]
  );
  const selectedTravelers = editionTravelers.filter((t) => gameIds.includes(t.id));
  const gameChars = allCharacters.filter((c) => coreGameIds.includes(c.id));
  const scriptChars = allCharacters.filter((c) => scriptIds.includes(c.id));

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

  const jinxes = analysis.interactionHints.filter((h) => h.category === "jinx");

  const [printMode, setPrintMode] = useState<PrintMode>("pretty");

  function handlePrint(mode: PrintMode) {
    flushSync(() => setPrintMode(mode));
    window.print();
  }

  return (
    <div className="mx-auto flex max-w-325 flex-col gap-5 px-6 pt-6 pb-12">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-parchment text-xl tracking-[0.04em]">{scriptDisplayName}</div>
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
            onClick={() => handlePrint("pretty")}
            className="border-tip font-display cursor-pointer rounded-md border bg-[#1a3a1a] px-4 py-1.75 text-xs tracking-[0.05em] text-[#4a9a6a]"
          >
            Print (Pretty)
          </button>
          <button
            onClick={() => handlePrint("clean")}
            className="border-subtle font-display cursor-pointer rounded-md border bg-transparent px-4 py-1.75 text-xs tracking-[0.05em] text-[#7a9a7a]"
          >
            Print (Clean)
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
                    className="font-display flex cursor-pointer items-center gap-2 rounded-[5px] border px-2.5 py-1 text-xs"
                  >
                    <CharacterIcon
                      characterId={c.id}
                      edition={c.edition}
                      team={c.team}
                      alt={c.name}
                      variant="token"
                      className="size-5"
                    />
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
                  className="text-gold font-display flex cursor-pointer items-center gap-2 rounded-[5px] border border-[#4a3a20] bg-[#1a1500] px-2.5 py-1 text-xs"
                >
                  <CharacterIcon
                    characterId={c.id}
                    edition={c.edition}
                    team={c.team}
                    alt={c.name}
                    variant="token"
                    className="size-5"
                  />
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Main 3-column grid */}
      <div className="grid grid-cols-[1fr_1fr_300px] gap-4">
        <Panel className="flex flex-col">
          <SectionLabel className="mb-2.5">Night Order</SectionLabel>
          <div className="max-h-120 flex-1 overflow-y-auto">
            <NightOrder
              steps={nightPhase === "first" ? analysis.nightOrder.first : analysis.nightOrder.other}
              phase={nightPhase}
              onPhaseChange={onNightPhaseChange}
            />
          </div>
        </Panel>

        <Panel className="flex flex-col">
          <SectionLabel className="mb-2.5">Interactions ({analysis.interactionHints.length})</SectionLabel>
          <div className="max-h-120 flex-1 overflow-y-auto">
            <InteractionFeed hints={analysis.interactionHints} characters={allCharacters} onDetail={onDetail} />
          </div>
        </Panel>

        {/* Right column */}
        <div className="flex flex-col gap-3.5">
          <Panel title="Team Strength">
            <div className="flex flex-col gap-2.5">
              <StrengthRow
                label="Good"
                value={goodTotal}
                pct={goodPct}
                textClass="text-townsfolk"
                barClass="bg-good-blue"
              />
              <StrengthRow
                label="Evil"
                value={evilTotal}
                pct={evilPct}
                textClass="text-demon"
                barClass="bg-blood-light"
              />
              <div className="font-body text-dim mt-0.5 text-center text-xs">
                {goodTotal > Math.abs(evilTotal) * 1.2
                  ? "Good has a strong advantage"
                  : Math.abs(evilTotal) > goodTotal * 1.2
                    ? "Evil has a strong advantage"
                    : "Roughly balanced"}
              </div>
            </div>
          </Panel>

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
                          className={cn("h-1.5 flex-1 rounded-xs", i > idx && "bg-subtle")}
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

          {(analysis.compositionWarnings.length > 0 || jinxes.length > 0) && (
            <Panel>
              <SectionLabel className="mb-2.5">Issues</SectionLabel>
              <div className="flex flex-col gap-1.5">
                {analysis.compositionWarnings.map((w, i) => (
                  <div
                    key={i}
                    className={cn(
                      "font-body text-parchment-muted rounded-[5px] border px-2.25 py-1.5 text-sm leading-normal",
                      w.severity === "critical" ? "border-blood bg-[#1a0808]" : "",
                      w.severity === "important" ? "border-[#7a5a00] bg-[#1a1400]" : "",
                      w.severity === "tip" ? "border-[#1a4a2e] bg-[#0a1408]" : ""
                    )}
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

      <PrintPortal scriptChars={scriptChars} analysis={analysis} printMode={printMode} />
    </div>
  );
}

function StrengthRow({
  label,
  value,
  pct,
  textClass,
  barClass
}: {
  label: string;
  value: number;
  pct: number;
  textClass: string;
  barClass: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span className={cn("text-2xs font-mono uppercase", textClass)}>{label}</span>
        <span className={cn("font-mono text-xs", textClass)}>
          {value > 0 ? "+" : ""}
          {value}
        </span>
      </div>
      <div className="bg-surface h-2 overflow-hidden rounded-sm">
        <div
          style={{ width: `${pct}%` }}
          className={cn("h-full rounded-sm transition-[width] duration-300", barClass)}
        />
      </div>
    </div>
  );
}
