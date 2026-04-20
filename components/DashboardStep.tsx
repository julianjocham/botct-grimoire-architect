"use client";

import { useMemo, useState } from "react";
import { DashboardStepProps } from "@/types";
import { analyzeScript } from "@/lib/engine";
import { NightOrder } from "./NightOrder";
import { PrintPortal } from "@/components/features/PrintPortal";
import { TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CharacterIcon } from "@/components/ui/CharacterIcon";
import { CharacterRoleStats } from "@/components/common/CharacterRoleStats";
import { GameFeelRosterPanel } from "@/components/common/GameFeelRosterPanel";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/contexts/LanguageContext";

type PrintMode = "pretty" | "clean" | "script-pretty" | "script-clean";

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
  const { t } = useTranslation();
  const coreGameIds = useMemo(
    () => gameIds.filter((id) => !editionTravelers.some((tr) => tr.id === id)),
    [gameIds, editionTravelers]
  );
  const selectedTravelers = editionTravelers.filter((tr) => gameIds.includes(tr.id));
  const gameChars = allCharacters.filter((c) => coreGameIds.includes(c.id));
  const scriptChars = allCharacters.filter((c) => scriptIds.includes(c.id));

  const analysis = useMemo(
    () => analyzeScript(coreGameIds, allCharacters, interactions, "game"),
    [coreGameIds, allCharacters, interactions]
  );

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

  const travelerSuffix =
    selectedTravelers.length > 0
      ? t("dashboard.travelerSuffix", {
          n: selectedTravelers.length,
          r: selectedTravelers.length !== 1 ? "n" : ""
        })
      : "";

  return (
    <div className="mx-auto flex max-w-325 flex-col gap-4 px-3 pt-4 pb-8 sm:gap-5 sm:px-6 sm:pt-6 sm:pb-12">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-parchment tracking-tight-wide text-lg sm:text-xl">{scriptDisplayName}</div>
          <div className="font-body text-muted mt-0.5 text-sm sm:text-base">
            {t("dashboard.playersInPlay", {
              players: playerCount,
              characters: coreGameIds.length,
              travelers: travelerSuffix
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onBackToSetup} variant="ghost">
            {t("dashboard.adjustRoster")}
          </Button>
          <div className="flex items-center gap-2">
            <select
              value={printMode}
              onChange={(e) => setPrintMode(e.target.value as PrintMode)}
              className="border-subtle text-parchment font-body cursor-pointer rounded-lg border bg-transparent px-3 py-2 text-sm sm:px-4 sm:text-base"
            >
              <option className="text-parchment bg-background" value="pretty">
                {t("dashboard.printAllPretty")}
              </option>
              <option className="text-parchment bg-background" value="clean">
                {t("dashboard.printAllClean")}
              </option>
              <option className="text-parchment bg-background" value="script-pretty">
                {t("dashboard.printScriptPretty")}
              </option>
              <option className="text-parchment bg-background" value="script-clean">
                {t("dashboard.printScriptClean")}
              </option>
            </select>
            <Button onClick={handlePrint} variant="primary">
              {t("dashboard.print")}
            </Button>
          </div>
          <button
            onClick={onReset}
            className="text-blood border-demon-border font-body cursor-pointer rounded-md border bg-transparent px-3 py-1.75 text-sm sm:px-4 sm:text-base"
          >
            {t("dashboard.newGame")}
          </button>
        </div>
      </div>

      {/* In-play character strip */}
      <Panel className="py-3">
        <div className="font-display text-dim text-2xs mb-2.5 tracking-widest uppercase">
          {t("dashboard.inPlay", { count: gameIds.length })}
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
                    className="font-display flex cursor-pointer flex-col items-stretch gap-0.5 rounded-[5px] border px-2.5 py-1 text-left text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <CharacterIcon
                        characterId={c.id}
                        edition={c.edition}
                        team={c.team}
                        alt={c.name}
                        variant="token"
                        className="size-5 shrink-0"
                      />
                      {c.name}
                    </span>
                    <CharacterRoleStats character={c} variant="inline" />
                  </button>
                ))}
              </div>
            );
          })}
          {selectedTravelers.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-display text-gold text-3xs min-w-16 shrink-0 tracking-widest uppercase">
                {t("dashboard.travelers")}
              </div>
              {selectedTravelers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onDetail(c.id)}
                  className="text-gold border-traveler-border bg-traveler-bg font-display flex cursor-pointer flex-col items-stretch gap-0.5 rounded-[5px] border px-2.5 py-1 text-left text-xs"
                >
                  <span className="flex items-center gap-2">
                    <CharacterIcon
                      characterId={c.id}
                      edition={c.edition}
                      team={c.team}
                      alt={c.name}
                      variant="token"
                      className="size-5 shrink-0"
                    />
                    {c.name}
                  </span>
                  <CharacterRoleStats character={c} variant="inline" />
                </button>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <Panel className="flex flex-col">
          <SectionLabel className="mb-2.5">{t("dashboard.nightOrder")}</SectionLabel>
          <div className="max-h-120 flex-1 overflow-y-auto">
            <NightOrder
              steps={nightPhase === "first" ? analysis.nightOrder.first : analysis.nightOrder.other}
              phase={nightPhase}
              onPhaseChange={onNightPhaseChange}
            />
          </div>
        </Panel>

        <div className="flex flex-col gap-3.5">
          <Panel title={t("dashboard.gameFeel")}>
            <GameFeelRosterPanel feel={analysis.scriptFeel} />
            <div className="text-muted text-2xs mt-2.5 text-center font-mono">
              {t("dashboard.nightRating", {
                rating: analysis.nightComplexity.complexityRating,
                first: analysis.nightOrder.first.length,
                other: analysis.nightOrder.other.length
              })}
            </div>
          </Panel>

          <Panel>
            <div className="mb-1 flex items-center justify-between">
              <SectionLabel>{t("dashboard.demonBluffs")}</SectionLabel>
              <div className={cn("text-2xs font-mono", selectedBluffs.length === 3 ? "text-demon" : "text-muted")}>
                {selectedBluffs.length}/3
              </div>
            </div>
            <div className="font-body text-muted mb-2.5 text-xs leading-snug">
              {t("dashboard.demonBluffsDescription")}
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
                        "font-display flex cursor-pointer flex-col items-stretch gap-0.5 rounded-[5px] border px-2 py-1 text-left text-xs transition-all",
                        sel && "border-blood text-parchment bg-severity-critical-bg",
                        !sel && !blocked && "border-subtle text-muted hover:border-faint hover:text-parchment-muted",
                        blocked && "border-subtle text-dimmer cursor-default"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <CharacterIcon
                          characterId={c.id}
                          edition={c.edition}
                          team={c.team}
                          alt={c.name}
                          variant="token"
                          className="size-4 shrink-0"
                        />
                        {c.name}
                      </span>
                      <CharacterRoleStats character={c} variant="inline" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="font-body text-muted text-xs">{t("dashboard.allTownsfolkInPlay")}</div>
            )}
          </Panel>
        </div>
      </div>

      <PrintPortal scriptChars={scriptChars} analysis={analysis} printMode={printMode} />
    </div>
  );
}
