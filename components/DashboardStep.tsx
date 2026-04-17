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
    <div className="mx-auto flex max-w-325 flex-col gap-4 px-3 pt-4 pb-8 sm:gap-5 sm:px-6 sm:pt-6 sm:pb-12">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-parchment tracking-tight-wide text-lg sm:text-xl">{scriptDisplayName}</div>
          <div className="font-body text-muted mt-0.5 text-sm sm:text-base">
            {playerCount} players · {coreGameIds.length} characters
            {selectedTravelers.length > 0
              ? ` + ${selectedTravelers.length} traveler${selectedTravelers.length > 1 ? "s" : ""}`
              : ""}{" "}
            in play
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onBackToSetup} variant="ghost">
            ← Adjust Roster
          </Button>
          <div className="flex items-center gap-2">
            <select
              value={printMode}
              onChange={(e) => setPrintMode(e.target.value as PrintMode)}
              className="border-subtle text-parchment font-body cursor-pointer rounded-lg border bg-transparent px-3 py-2 text-sm sm:px-4 sm:text-base"
            >
              <option className="text-parchment bg-background" value="pretty">
                Print All (Pretty)
              </option>
              <option className="text-parchment bg-background" value="clean">
                Print All (Clean)
              </option>
              <option className="text-parchment bg-background" value="script-pretty">
                Print Script (Pretty)
              </option>
              <option className="text-parchment bg-background" value="script-clean">
                Print Script (Clean)
              </option>
            </select>
            <Button onClick={handlePrint} variant="primary">
              Print ⎙
            </Button>
          </div>
          <button
            onClick={onReset}
            className="text-blood border-demon-border font-body cursor-pointer rounded-md border bg-transparent px-3 py-1.75 text-sm sm:px-4 sm:text-base"
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
                  className="text-gold border-traveler-border bg-traveler-bg font-display flex cursor-pointer items-center gap-2 rounded-[5px] border px-2.5 py-1 text-xs"
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

      {/* Main grid: stacks on small, 2-column on md, 3-column on xl */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_360px]">
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

        {/* Right column — spans both columns on md so it sits below the 2-col stack */}
        <div className="flex flex-col gap-3.5 md:col-span-2 xl:col-span-1">
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
                const color = FEEL_COLOR[val] ?? "var(--gold)";
                return (
                  <div key={key}>
                    <div className="mb-0.75 flex justify-between">
                      <span className="text-muted text-2xs font-mono tracking-wider uppercase">{label}</span>
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
            <div className="border-panel-dark mt-3 border-t pt-3">
              <div className="text-muted text-2xs mb-2 font-mono tracking-wider uppercase">Role Coverage</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {COVERAGE_CATS.map(({ cat, side }) => {
                  const chars =
                    side === "good" ? analysis.categoryCoverage.good[cat] : analysis.categoryCoverage.evil[cat];
                  const covered = (chars?.length ?? 0) > 0;
                  const dotColor = covered
                    ? side === "good"
                      ? "var(--good-indicator)"
                      : "var(--blood-red-light)"
                    : "var(--color-dimmer)";
                  const textColor = covered
                    ? side === "good"
                      ? "var(--color-townsfolk)"
                      : "var(--color-demon)"
                    : "var(--color-dim)";
                  const countColor = side === "good" ? "var(--good-indicator-border)" : "var(--color-minion-border)";
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
                      w.severity === "critical" && "border-blood bg-severity-critical-bg",
                      w.severity === "important" && "border-severity-important bg-severity-important-bg",
                      w.severity === "tip" && "border-severity-tip bg-severity-tip-bg"
                    )}
                  >
                    {w.severity === "critical" ? "⚠" : w.severity === "important" ? "⚡" : "💡"} {w.message}
                  </div>
                ))}
                {jinxes.length > 0 && (
                  <div className="font-body text-gold border-jinx bg-jinx-bg rounded-[5px] border border-dashed px-2.25 py-1.5 text-sm">
                    ⚖ {jinxes.length} Djinn Jinx{jinxes.length > 1 ? "es" : ""} — see Interactions tab
                  </div>
                )}
              </div>
            </Panel>
          )}

          <Panel>
            <div className="mb-1 flex items-center justify-between">
              <SectionLabel>Demon Bluffs</SectionLabel>
              <div className={cn("text-2xs font-mono", selectedBluffs.length === 3 ? "text-demon" : "text-muted")}>
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
                        sel && "border-blood text-parchment bg-severity-critical-bg",
                        !sel && !blocked && "border-subtle text-muted hover:border-faint hover:text-parchment-muted",
                        blocked && "border-subtle text-dimmer cursor-default"
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
