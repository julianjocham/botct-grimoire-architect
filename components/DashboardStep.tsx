"use client";

import { useMemo, useState } from "react";
import { DashboardStepProps } from "@/types";
import { analyzeScript } from "@/lib/engine";
import { NightOrder } from "./NightOrder";
import { InteractionFeed } from "./InteractionFeed";
import { PrintPortal } from "@/components/features/PrintPortal";
import { FEEL_BARS, FEEL_COLOR, CAT_SHORT } from "@/constants/info";
import { AbilityCategory } from "@/types";
import { TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";
import { calculateStrengthTotals } from "@/lib/strength/calculate";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CharacterIcon } from "@/components/ui/CharacterIcon";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

type PrintMode = "pretty" | "clean" | "script-pretty" | "script-clean";

const COVERAGE_CATS: { cat: AbilityCategory; side: "good" | "evil" }[] = [
  { cat: "info-start", side: "good" },
  { cat: "info-recurring", side: "good" },
  { cat: "once-per-game", side: "good" },
  { cat: "protection", side: "good" },
  { cat: "day-ability", side: "good" },
  { cat: "info-disruption", side: "evil" },
  { cat: "demon-resilience", side: "evil" }
];

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

  function handlePrint() {
    window.print();
  }

  const [selectedBluffs, setSelectedBluffs] = useState<string[]>([]);
  function toggleBluff(id: string) {
    setSelectedBluffs((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }
  const bluffOptions = useMemo(
    () =>
      allCharacters.filter((c) => c.team === "townsfolk" && scriptIds.includes(c.id) && !coreGameIds.includes(c.id)),
    [allCharacters, scriptIds, coreGameIds]
  );

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
          <Button onClick={onBackToSetup} variant="ghost">
            ← Adjust Roster
          </Button>
          <div className="flex items-center gap-2">
            <select
              value={printMode}
              onChange={(e) => setPrintMode(e.target.value as PrintMode)}
              className="border-subtle text-parchment font-body cursor-pointer rounded-lg border bg-transparent px-4 py-2 text-base"
            >
              <option className="text-parchment bg-[#0a0a0f]" value="pretty">
                Print All (Pretty)
              </option>
              <option className="text-parchment bg-[#0a0a0f]" value="clean">
                Print All (Clean)
              </option>
              <option className="text-parchment bg-[#0a0a0f]" value="script-pretty">
                Print Script (Pretty)
              </option>
              <option className="text-parchment bg-[#0a0a0f]" value="script-clean">
                Print Script (Clean)
              </option>
            </select>
            <Button onClick={handlePrint} variant="primary">
              Print ⎙
            </Button>
          </div>
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
      <div className="grid grid-cols-[1fr_1fr_360px] gap-4">
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
              <div className="font-body text-muted mt-0.5 text-center text-xs">
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
                      <span className="text-muted text-2xs font-mono tracking-[0.06em] uppercase">{label}</span>
                      <span style={{ color }} className="font-display text-2xs">
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
            <div className="text-muted text-2xs mt-2.5 text-center font-mono">
              Night: {analysis.nightComplexity.complexityRating}
              {" · "}
              {analysis.nightOrder.first.length}↓ {analysis.nightOrder.other.length}↻
            </div>
            <div className="mt-3 border-t border-[#1a1a2a] pt-3">
              <div className="text-muted text-2xs mb-2 font-mono tracking-[0.06em] uppercase">Role Coverage</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {COVERAGE_CATS.map(({ cat, side }) => {
                  const chars =
                    side === "good" ? analysis.categoryCoverage.good[cat] : analysis.categoryCoverage.evil[cat];
                  const covered = (chars?.length ?? 0) > 0;
                  const dotColor = covered ? (side === "good" ? "#4a9a4a" : "#c0392b") : "#444";
                  const textColor = covered ? (side === "good" ? "#7ab87a" : "#d47a7a") : "#666";
                  const countColor = side === "good" ? "#4a7a4a" : "#8b4a4a";
                  return (
                    <div key={cat} className="flex items-center gap-1">
                      <span className="text-2xs" style={{ color: dotColor }}>
                        ●
                      </span>
                      <span className="text-2xs font-mono" style={{ color: textColor }}>
                        {CAT_SHORT[cat]}
                      </span>
                      {covered && chars!.length > 1 && (
                        <span className="text-2xs font-mono" style={{ color: countColor }}>
                          ×{chars!.length}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
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

          <Panel>
            <div className="mb-1 flex items-center justify-between">
              <SectionLabel>Demon Bluffs</SectionLabel>
              <div className="text-2xs font-mono" style={{ color: selectedBluffs.length === 3 ? "#d55b5b" : "#888" }}>
                {selectedBluffs.length}/3
              </div>
            </div>
            <div className="font-body text-muted mb-2.5 text-xs leading-snug">
              Script townsfolk not assigned to a player — pick up to 3 for the demon.
            </div>

            {bluffOptions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {bluffOptions.map((c) => {
                  const sel = selectedBluffs.includes(c.id);
                  const blocked = !sel && selectedBluffs.length >= 3;
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleBluff(c.id)}
                      disabled={blocked}
                      className={cn(
                        "font-display flex cursor-pointer items-center gap-1.5 rounded-[5px] border px-2 py-1 text-xs transition-all",
                        sel && "border-blood text-parchment bg-[#1a0808]",
                        !sel && !blocked && "border-subtle text-muted hover:border-[#3a2a2a] hover:text-[#ccc]",
                        blocked && "cursor-default border-[#222] text-[#444]"
                      )}
                    >
                      <CharacterIcon
                        characterId={c.id}
                        edition={c.edition}
                        team={c.team}
                        alt={c.name}
                        variant="token"
                        className="size-4"
                      />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="font-body text-muted text-xs">All script townsfolk are in play.</div>
            )}
          </Panel>
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
