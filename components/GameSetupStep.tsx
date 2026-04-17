"use client";

import { useMemo } from "react";
import { GameSetupStepProps, AbilityCategory } from "@/types";
import { RAW_COUNTS, SETUP_MODIFIERS, TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";
import { getCategoryCoverage } from "@/lib/analysis/coverage";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { AnalysisSidebar } from "@/components/features/AnalysisSidebar";
import { CharacterSelectCard } from "@/components/common/CharacterSelectCard";
import { cn } from "@/lib/cn";

function getAdjustedReq(
  rawReq: { townsfolk: number; outsider: number; minion: number; demon: number },
  gameIds: string[]
) {
  let tf = rawReq.townsfolk;
  let os = rawReq.outsider;
  for (const [charId, mod] of Object.entries(SETUP_MODIFIERS)) {
    if (gameIds.includes(charId)) {
      tf += mod.townsfolk ?? 0;
      os += mod.outsider ?? 0;
    }
  }
  return {
    townsfolk: Math.max(0, tf),
    outsider: Math.max(0, os),
    minion: rawReq.minion,
    demon: rawReq.demon
  };
}

export function GameSetupStep({
  scriptType,
  scriptDisplayName,
  scriptIds,
  playerCount,
  gameIds,
  allCharacters,
  editionTravelers,
  onSetPlayerCount,
  onToggleGameChar,
  onContinue,
  onBack,
  onDetail
}: GameSetupStepProps) {
  const scriptChars = allCharacters.filter((c) => scriptIds.includes(c.id));
  const rawReq = playerCount ? RAW_COUNTS[String(playerCount)] : null;
  const req = rawReq ? getAdjustedReq(rawReq, gameIds) : null;

  const neededTravelers = playerCount && playerCount > 15 ? playerCount - 15 : 0;
  const travelerIdSet = new Set(editionTravelers.map((t) => t.id));
  const coreGameIds = gameIds.filter((id) => !travelerIdSet.has(id));
  const selectedTravelerIds = gameIds.filter((id) => travelerIdSet.has(id));

  const gameCounts = {
    townsfolk: coreGameIds.filter((id) => allCharacters.find((c) => c.id === id)?.team === "townsfolk").length,
    outsider: coreGameIds.filter((id) => allCharacters.find((c) => c.id === id)?.team === "outsider").length,
    minion: coreGameIds.filter((id) => allCharacters.find((c) => c.id === id)?.team === "minion").length,
    demon: coreGameIds.filter((id) => allCharacters.find((c) => c.id === id)?.team === "demon").length
  };

  const totalNeeded = req ? req.townsfolk + req.outsider + req.minion + req.demon : 0;
  const coreComplete = req !== null && coreGameIds.length === totalNeeded;
  const travelersComplete = selectedTravelerIds.length === neededTravelers;
  const isComplete = coreComplete && travelersComplete;

  const activeModifiers = Object.entries(SETUP_MODIFIERS)
    .filter(([id]) => gameIds.includes(id))
    .map(([, mod]) => mod.label);

  const remainingCoreCount = totalNeeded - coreGameIds.length;
  const remainingTravelerCount = neededTravelers - selectedTravelerIds.length;

  const GOOD_GAP_CATS: AbilityCategory[] = [
    "info-start",
    "info-recurring",
    "once-per-game",
    "protection",
    "day-ability"
  ];
  const EVIL_GAP_CATS: AbilityCategory[] = ["info-disruption", "demon-resilience"];

  const coverage = useMemo(() => getCategoryCoverage(coreGameIds, allCharacters), [coreGameIds, allCharacters]);

  const missingGoodCats = useMemo(
    () => new Set<string>(GOOD_GAP_CATS.filter((cat) => !coverage.good[cat])),
    [coverage]
  );
  const missingEvilCats = useMemo(
    () => new Set<string>(EVIL_GAP_CATS.filter((cat) => !coverage.evil[cat])),
    [coverage]
  );

  const scriptModifiers = Object.entries(SETUP_MODIFIERS).filter(([id]) => scriptIds.includes(id));
  type SetupVariant = { label: string; tf: number; os: number; m: number; d: number; isBase: boolean };
  const setupVariants: SetupVariant[] = rawReq
    ? [
        { label: "Base", tf: rawReq.townsfolk, os: rawReq.outsider, m: rawReq.minion, d: rawReq.demon, isBase: true },
        ...scriptModifiers.map(([id, mod]) => ({
          label: allCharacters.find((c) => c.id === id)?.name ?? id,
          tf: Math.max(0, rawReq.townsfolk + (mod.townsfolk ?? 0)),
          os: Math.max(0, rawReq.outsider + (mod.outsider ?? 0)),
          m: rawReq.minion,
          d: rawReq.demon,
          isBase: false
        })),
        ...(scriptModifiers.length >= 2
          ? [
              {
                label: "All modifiers",
                tf: Math.max(0, rawReq.townsfolk + scriptModifiers.reduce((s, [, m]) => s + (m.townsfolk ?? 0), 0)),
                os: Math.max(0, rawReq.outsider + scriptModifiers.reduce((s, [, m]) => s + (m.outsider ?? 0), 0)),
                m: rawReq.minion,
                d: rawReq.demon,
                isBase: false
              }
            ]
          : [])
      ]
    : [];

  return (
    <div className="mx-auto grid max-w-325 grid-cols-1 items-start gap-4 px-3 py-5 sm:gap-6 sm:px-6 sm:py-8 lg:grid-cols-[1fr_320px]">
      {/* ── Left: selection ── */}
      <div className="flex flex-col gap-5 sm:gap-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-parchment tracking-tight-wide m-0 mb-1.5 text-xl sm:text-2xl">
              Step 2 — Set Up Your Game
            </h2>
            <div className="font-body text-dim text-base">
              Script: <span className="text-gold">{scriptDisplayName}</span>
              {" · "}
              {scriptIds.length} characters available
            </div>
          </div>
          <Button variant="ghost" onClick={onBack}>
            ← Change Script
          </Button>
        </div>

        {/* Continue button */}
        {playerCount && (
          <div className="flex justify-end pt-1">
            <button
              onClick={onContinue}
              disabled={!isComplete}
              className={cn(
                "font-display rounded-lg border-none px-5 py-2.5 text-sm tracking-wider sm:px-7 sm:py-3 sm:text-base",
                isComplete ? "bg-blood text-parchment cursor-pointer" : "bg-panel-dark text-dimmer cursor-default"
              )}
            >
              {isComplete
                ? "View Dashboard →"
                : coreComplete && neededTravelers > 0
                  ? `Select ${remainingTravelerCount} more traveler${remainingTravelerCount !== 1 ? "s" : ""}…`
                  : `Select ${remainingCoreCount} more character${remainingCoreCount !== 1 ? "s" : ""}…`}
            </button>
          </div>
        )}

        {/* Player count */}
        <div>
          <SectionLabel className="mb-2.5">How many players?</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: scriptType === "teensyville" ? 2 : 16 }, (_, i) => i + 5).map((n) => {
              const isActive = playerCount === n;
              const isTraveler = n > 15;
              return (
                <button
                  key={n}
                  onClick={() => onSetPlayerCount(isActive ? null : n)}
                  className={cn(
                    "cursor-pointer rounded-[7px] border-2 font-mono transition-all duration-100",
                    isTraveler ? "px-2.5 py-1.25 text-xs" : "text-md px-3 py-1.5 sm:px-3.5 sm:py-2",
                    isActive && "bg-blood border-blood text-parchment font-bold",
                    !isActive && isTraveler && "bg-surface text-dim border-subtle",
                    !isActive && !isTraveler && "bg-surface border-subtle text-muted"
                  )}
                  title={isTraveler ? `${n} players (${n - 15} traveler${n - 15 > 1 ? "s" : ""})` : `${n} players`}
                >
                  {n}
                  {isTraveler && (
                    <span className={cn("text-3xs block leading-none", isActive ? "text-parchment" : "text-dimmer")}>
                      +{n - 15}T
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {neededTravelers > 0 && playerCount && (
            <div className="font-body text-dim mt-2 text-sm">
              Travelers fill the extra {neededTravelers} slot{neededTravelers > 1 ? "s" : ""} — they are not from your
              script.
            </div>
          )}
        </div>

        {/* Distribution + character selection */}
        {playerCount && req && (
          <>
            <Panel className="shrink-0">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-display text-gold text-2xs tracking-wider uppercase">
                  {playerCount}p Distribution
                </div>
                {isComplete && <div className="font-display text-tip text-2xs">✓ Complete</div>}
              </div>
              <div className="flex gap-1.5">
                {TEAM_ORDER.map((team) => {
                  const needed = req[team];
                  const have = gameCounts[team];
                  const done = have >= needed;
                  const c = TEAM_COLORS[team];
                  return (
                    <div
                      key={team}
                      className="bg-deep flex-1 rounded-lg border-2 px-1 py-1.5 text-center transition-[border-color] duration-200"
                      style={{ borderColor: done ? c.border : "var(--border-subtle)" }}
                    >
                      <div
                        className="font-mono text-lg leading-none"
                        style={{ color: done ? c.text : "var(--color-dimmer)" }}
                      >
                        {have}
                      </div>
                      <div className="text-dimmer text-2xs my-0.5 font-mono">/ {needed}</div>
                      <div className="font-body text-muted text-2xs capitalize">{team}</div>
                    </div>
                  );
                })}
                {neededTravelers > 0 && (
                  <div
                    className={cn(
                      "bg-deep flex-1 rounded-lg border-2 px-1 py-1.5 text-center transition-[border-color] duration-200",
                      travelersComplete ? "border-traveler-border" : "border-subtle"
                    )}
                  >
                    <div
                      className={cn("font-mono text-lg leading-none", travelersComplete ? "text-gold" : "text-dimmer")}
                    >
                      {selectedTravelerIds.length}
                    </div>
                    <div className="text-dimmer text-2xs my-0.5 font-mono">/ {neededTravelers}</div>
                    <div className="font-body text-muted text-2xs">Travelers</div>
                  </div>
                )}
              </div>
              {activeModifiers.length > 0 && (
                <div className="mt-1.5 flex flex-col gap-0.5">
                  {activeModifiers.map((note, i) => (
                    <div key={i} className="font-body text-minion text-2xs">
                      ⚙ {note}
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* Valid setups reference */}
            {scriptModifiers.length > 0 && req && (
              <Panel>
                <div className="font-display text-gold text-2xs mb-2.5 tracking-wider uppercase">
                  Valid Setups — {playerCount}p
                </div>
                <div className="flex flex-col gap-0.5">
                  {setupVariants.map((v, i) => {
                    const isCurrent = req.townsfolk === v.tf && req.outsider === v.os;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex flex-wrap items-center gap-3 rounded px-2 py-1",
                          isCurrent ? "border-severity-tip bg-severity-tip-bg border" : "border border-transparent"
                        )}
                      >
                        <div
                          className="font-display min-w-28 shrink-0 text-xs"
                          style={{ color: v.isBase ? "var(--color-dimmer)" : TEAM_COLORS.minion.text }}
                        >
                          {v.label}
                        </div>
                        <div className="flex gap-3">
                          {(
                            [
                              { n: v.tf, team: "townsfolk", abbr: "TF" },
                              { n: v.os, team: "outsider", abbr: "OS" },
                              { n: v.m, team: "minion", abbr: "M" },
                              { n: v.d, team: "demon", abbr: "D" }
                            ] as const
                          ).map(({ n, team, abbr }) => (
                            <div key={abbr} className="flex items-center gap-0.75">
                              <span
                                className="font-mono text-sm leading-none"
                                style={{ color: TEAM_COLORS[team].text }}
                              >
                                {n}
                              </span>
                              <span className="text-muted text-2xs font-mono">{abbr}</span>
                            </div>
                          ))}
                        </div>
                        {isCurrent && <div className="text-tip font-body text-2xs ml-auto">← current</div>}
                      </div>
                    );
                  })}
                </div>
              </Panel>
            )}

            {/* Character selection */}
            <div className="flex flex-col gap-3">
              <div className="font-display text-gold text-2xs tracking-widest uppercase">Choose Characters</div>
              {TEAM_ORDER.map((team) => {
                const chars = scriptChars.filter((c) => c.team === team).sort((a, b) => a.name.localeCompare(b.name));
                const needed = req[team];
                const have = gameCounts[team];
                const isFull = have >= needed;
                const c = TEAM_COLORS[team];
                if (chars.length === 0) return null;

                return (
                  <div key={team}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <div className="font-display text-xs tracking-wider uppercase" style={{ color: c.text }}>
                        {TEAM_LABEL[team]}
                      </div>
                      <div
                        className="text-2xs bg-deep rounded-lg px-1.5 py-px font-mono"
                        style={{
                          color: isFull ? c.text : "var(--color-dimmer)",
                          border: `1px solid ${isFull ? c.border : "var(--border-subtle)"}`
                        }}
                      >
                        {have} / {needed}
                      </div>
                      {needed === 0 && <div className="font-body text-dimmer text-2xs">(not needed)</div>}
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                      {chars.map((char) => {
                        const inGame = gameIds.includes(char.id);
                        const blocked = !inGame && isFull;
                        return (
                          <CharacterSelectCard
                            key={char.id}
                            character={char}
                            gameIds={gameIds}
                            allCharacters={allCharacters}
                            isBlocked={blocked}
                            onDetail={onDetail}
                            onToggle={onToggleGameChar}
                            missingGoodCats={missingGoodCats}
                            missingEvilCats={missingEvilCats}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Traveler picker */}
            {neededTravelers > 0 && editionTravelers.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="font-display text-gold text-2xs tracking-widest uppercase">Travelers</div>
                  <div
                    className={cn(
                      "text-2xs bg-deep rounded-lg px-1.5 py-px font-mono",
                      travelersComplete ? "text-gold border-traveler-border border" : "text-dim border-subtle border"
                    )}
                  >
                    {selectedTravelerIds.length} / {neededTravelers}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                  {editionTravelers.map((traveler) => {
                    const inGame = gameIds.includes(traveler.id);
                    const blocked = !inGame && travelersComplete;
                    return (
                      <CharacterSelectCard
                        key={traveler.id}
                        character={traveler}
                        gameIds={gameIds}
                        allCharacters={allCharacters}
                        isBlocked={blocked}
                        onDetail={onDetail}
                        onToggle={onToggleGameChar}
                        accentColor={{ bg: "#1a1500", border: "#4a3a20", text: "#d4a832" }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {!playerCount && (
          <div className="text-muted font-body text-md py-7.5 text-center">
            Choose a player count above to begin selecting characters.
          </div>
        )}
      </div>

      {/* ── Right: live analysis sidebar ── */}
      <div className="bg-surface border-subtle rounded-[10px] border p-3 sm:p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto">
        <SectionLabel className="mb-4">Live Analysis</SectionLabel>
        <AnalysisSidebar gameIds={gameIds} allCharacters={allCharacters} />
      </div>
    </div>
  );
}
