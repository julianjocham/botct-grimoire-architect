"use client";

import { Character, ScriptStepProps, ScriptType } from "@/types";
import { CharacterToken } from "./common/CharacterToken";
import { PremadeScriptCard } from "./common/PremadeScriptCard";
import { EDITIONS } from "@/constants/info";
import { TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";
import { calculateEffectiveStrength } from "@/lib/strength/calculate";
import { Panel } from "./ui/Panel";
import { premadeScripts } from "@/data/scripts";
import { CharacterIcon } from "@/components/ui/CharacterIcon";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/contexts/LanguageContext";

function teamCount(chars: Character[], team: string) {
  return chars.filter((c) => c.team === team).length;
}

function scriptIsValid(scriptIds: string[], allCharacters: Character[], scriptType: ScriptType) {
  const chars = allCharacters.filter((c) => scriptIds.includes(c.id));
  if (scriptType === "teensyville") {
    return (
      chars.filter((c) => c.team === "demon").length >= 1 &&
      chars.filter((c) => c.team === "townsfolk").length >= 5 &&
      chars.filter((c) => c.team === "outsider").length >= 1 &&
      chars.filter((c) => c.team === "minion").length >= 1
    );
  }
  return (
    chars.filter((c) => c.team === "demon").length >= 1 &&
    chars.filter((c) => c.team === "townsfolk").length >= 9 &&
    chars.filter((c) => c.team === "minion").length >= 1
  );
}

export function ScriptStep({
  scriptType,
  scriptSource,
  premadeScriptId,
  scriptIds,
  allCharacters,
  editionPools,
  searchQuery,
  onSetScriptType,
  onClearScriptSource,
  onSelectEdition,
  onSelectPremade,
  onSelectCustom,
  onToggleScriptChar,
  onContinue,
  onSearch,
  onDetail
}: ScriptStepProps) {
  const { t } = useTranslation();
  const isCustom = scriptSource === "custom";
  const isTeensyville = scriptType === "teensyville";

  const officialScripts = premadeScripts.filter((s) => s.type === "official");
  const teensyvilleScripts = premadeScripts.filter((s) => s.type === "teensyville");
  const fullPremadeScripts = premadeScripts.filter((s) => s.type === "full");

  const scriptChars = allCharacters.filter((c) => scriptIds.includes(c.id));
  const counts = {
    townsfolk: teamCount(scriptChars, "townsfolk"),
    outsider: teamCount(scriptChars, "outsider"),
    minion: teamCount(scriptChars, "minion"),
    demon: teamCount(scriptChars, "demon")
  };
  const hasBaron = scriptIds.includes("baron");
  const TARGETS = isTeensyville
    ? { townsfolk: 5, outsider: 1, minion: 1, demon: 1 }
    : { townsfolk: hasBaron ? 11 : 13, outsider: hasBaron ? 6 : 4, minion: 4, demon: 1 };
  const tfMin = isTeensyville ? 5 : hasBaron ? 7 : 9;

  const valid = isCustom ? scriptIsValid(scriptIds, allCharacters, scriptType) : scriptSource !== null;

  const filteredPool = isCustom
    ? allCharacters.filter(
        (c) =>
          !searchQuery ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.ability.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const continueButtonClass = cn(
    "font-display rounded-lg border-none px-5 py-2.5 text-sm tracking-wider sm:px-7 sm:py-3 sm:text-base",
    valid ? "bg-blood text-parchment cursor-pointer" : "bg-panel-dark text-dimmer cursor-default"
  );

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-6 px-3 py-5 sm:gap-9 sm:px-6 sm:py-8">
      <div>
        <h2 className="font-display text-parchment tracking-tight-wide m-0 mb-2 text-xl sm:text-2xl">
          {t("script.title")}
        </h2>
        <p className="font-body text-dim sm:text-md m-0 text-base">{t("script.description")}</p>
      </div>

      {/* Game type toggle + continue */}
      {!isCustom && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="border-subtle bg-deep flex gap-0 rounded-lg border p-1">
            {(["full", "teensyville"] as const).map((type) => {
              const active = scriptType === type;
              return (
                <button
                  key={type}
                  onClick={() => onSetScriptType(type)}
                  className={cn(
                    "font-display cursor-pointer rounded-md border-none px-3 py-1.5 text-xs tracking-wide transition-all duration-150 sm:px-4",
                    active ? "bg-blood text-parchment" : "text-dim hover:text-muted bg-transparent"
                  )}
                >
                  {type === "full" ? t("script.fullScript") : t("script.teensyville")}
                </button>
              );
            })}
          </div>
          <button onClick={onContinue} disabled={!valid} className={continueButtonClass}>
            {t("script.setUpGame")}
          </button>
        </div>
      )}

      {/* Edition cards — full scripts only */}
      {!isCustom && !isTeensyville && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {EDITIONS.map((ed) => {
              const pool = editionPools[ed.key];
              const isSelected = scriptSource === ed.key;
              return (
                <div
                  key={ed.key}
                  onClick={() =>
                    onSelectEdition(
                      ed.key,
                      pool.map((c) => c.id)
                    )
                  }
                  className={cn(
                    "cursor-pointer rounded-xl border-2 px-4 py-4 transition-all duration-150 ease-[ease] sm:px-5.5 sm:py-5",
                    isSelected ? "border-blood bg-severity-critical-bg" : "bg-surface border-subtle"
                  )}
                >
                  <div className="mb-2.5 flex items-start justify-between">
                    <div
                      className={cn(
                        "font-display tracking-tight-wide text-lg",
                        isSelected ? "text-parchment" : "text-gold"
                      )}
                    >
                      {ed.name}
                    </div>
                    <span
                      className="font-body text-2xs shrink-0 rounded-[3px] px-1.75 py-0.5"
                      style={{
                        color: ed.diffColor,
                        border: `1px solid ${ed.diffColor}44`
                      }}
                    >
                      {ed.difficulty}
                    </span>
                  </div>

                  <div className="font-body text-muted mb-4 min-h-10 text-base leading-normal">{ed.tagline}</div>

                  <div className="mb-4 grid grid-cols-2 gap-x-3 gap-y-1">
                    {TEAM_ORDER.map((team) => {
                      const n = teamCount(pool, team);
                      if (n === 0) return null;
                      const c = TEAM_COLORS[team];
                      return (
                        <div key={team} className="font-mono text-xs" style={{ color: c.text }}>
                          {n} {TEAM_LABEL[team]}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEdition(
                        ed.key,
                        pool.map((c) => c.id)
                      );
                    }}
                    className={cn(
                      "font-display w-full cursor-pointer rounded-md border-none py-2 text-xs tracking-wide transition-all duration-150 ease-[ease]",
                      isSelected ? "bg-blood text-parchment" : "bg-subtle text-muted"
                    )}
                  >
                    {isSelected ? t("script.selected") : t("script.selectScript")}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Custom option */}
          <div className="bg-surface border-subtle flex flex-col items-stretch justify-between gap-3 rounded-xl border-2 border-dashed px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-5">
            <div>
              <div className="font-display text-gold text-md mb-1">{t("script.customScript")}</div>
              <div className="font-body text-dim text-base leading-normal">{t("script.customScriptDescription")}</div>
            </div>
            <button
              onClick={onSelectCustom}
              className="bg-surface border-gold text-gold font-display shrink-0 cursor-pointer rounded-md border px-4.5 py-2 text-xs tracking-wide whitespace-nowrap"
            >
              {t("script.buildCustom")}
            </button>
          </div>

          {/* Official scripts */}
          <div>
            <div className="font-display text-gold mb-3 text-sm tracking-wider uppercase">
              {t("script.officialScripts")}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {officialScripts.map((script) => (
                <PremadeScriptCard
                  key={script.id}
                  script={script}
                  allCharacters={allCharacters}
                  isSelected={scriptSource === "premade" && premadeScriptId === script.id}
                  onSelect={() => onSelectPremade(script.id, script.characters)}
                />
              ))}
            </div>
          </div>

          {/* Community full scripts */}
          <div>
            <div className="font-display text-gold mb-3 text-sm tracking-wider uppercase">
              {t("script.communityScripts")}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {fullPremadeScripts.map((script) => (
                <PremadeScriptCard
                  key={script.id}
                  script={script}
                  allCharacters={allCharacters}
                  isSelected={scriptSource === "premade" && premadeScriptId === script.id}
                  onSelect={() => onSelectPremade(script.id, script.characters)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Teensyville landing */}
      {!isCustom && isTeensyville && (
        <>
          <div>
            <div className="font-display text-gold mb-3 text-sm tracking-wider uppercase">
              {t("script.communityTeensyvilleScripts")}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {teensyvilleScripts.map((script) => (
                <PremadeScriptCard
                  key={script.id}
                  script={script}
                  allCharacters={allCharacters}
                  isSelected={scriptSource === "premade" && premadeScriptId === script.id}
                  onSelect={() => onSelectPremade(script.id, script.characters)}
                />
              ))}
            </div>
          </div>

          {/* Custom option */}
          <div className="bg-surface border-subtle flex flex-col items-stretch justify-between gap-3 rounded-xl border-2 border-dashed px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-5">
            <div>
              <div className="font-display text-gold text-md mb-1">{t("script.customTeensyvilleScript")}</div>
              <div className="font-body text-dim text-base leading-normal">
                {t("script.customTeensyvilleDescription")}
              </div>
            </div>
            <button
              onClick={onSelectCustom}
              className="bg-surface border-gold text-gold font-display shrink-0 cursor-pointer rounded-md border px-4.5 py-2 text-xs tracking-wide whitespace-nowrap"
            >
              {t("script.buildCustom")}
            </button>
          </div>
        </>
      )}

      {/* Custom script builder */}
      {isCustom && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() =>
                isTeensyville
                  ? onClearScriptSource()
                  : onSelectEdition(
                      "tb",
                      editionPools.tb.map((c) => c.id)
                    )
              }
              className="border-subtle text-muted font-body cursor-pointer rounded-[5px] border bg-transparent px-3 py-1.25 text-sm sm:text-base"
            >
              {t("script.backToSelection")}
            </button>
            <button onClick={onContinue} disabled={!valid} className={continueButtonClass}>
              {t("script.setUpGame")}
            </button>
          </div>

          <div className="flex flex-col gap-4 lg:grid lg:min-h-150 lg:grid-cols-[1fr_280px]">
            {/* Left: character pool */}
            <div className="bg-surface border-subtle flex flex-col overflow-hidden rounded-[10px] border">
              <div className="border-subtle border-b px-3 py-2.5">
                <input
                  type="text"
                  placeholder={t("script.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="bg-background text-parchment border-faint font-body box-border w-full rounded-md border px-2.5 py-1.5 text-base outline-none"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-2.5">
                {TEAM_ORDER.map((team) => {
                  let chars = filteredPool.filter((c) => c.team === team);
                  if (chars.length === 0) return null;
                  chars = chars.sort((a, b) => a.name.localeCompare(b.name));
                  return (
                    <div key={team}>
                      <div className="font-display text-gold border-subtle text-2xs mb-1.5 border-b pb-1 tracking-widest uppercase">
                        {TEAM_LABEL[team]} ({chars.length})
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                        {chars.map((c) => {
                          const eff = calculateEffectiveStrength(c.id, scriptIds, allCharacters);
                          return (
                            <CharacterToken
                              key={c.id}
                              character={c}
                              selected={scriptIds.includes(c.id)}
                              onToggle={onToggleScriptChar}
                              onDetail={onDetail}
                              effectiveStrength={eff.effectiveStrength}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: script summary */}
            <div className="flex flex-col gap-2.5 overflow-y-auto">
              <Panel title={t("script.yourScript", { count: scriptIds.length })} className="shrink-0">
                <div className="flex gap-1.5">
                  {TEAM_ORDER.map((team) => {
                    const have = counts[team];
                    const need = TARGETS[team];
                    const ok = have >= need;
                    const c = TEAM_COLORS[team];
                    return (
                      <div
                        key={team}
                        className="bg-deep flex-1 rounded-[5px] px-0.75 py-1.5 text-center"
                        style={{ border: `1px solid ${ok ? c.border : "var(--border-subtle)"}` }}
                      >
                        <div
                          className="font-mono text-base leading-none"
                          style={{ color: ok ? c.text : "var(--color-dim)" }}
                        >
                          {have}
                        </div>
                        <div className="text-muted text-2xs font-mono leading-none">/ {need}</div>
                        <div className="font-body text-muted text-2xs mt-0.5 capitalize">{team}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-2xs mt-2 flex flex-col gap-0.5">
                  {counts.demon === 0 && <div className="font-body text-blood-light">{t("script.needDemon")}</div>}
                  {counts.townsfolk < tfMin && (
                    <div className="font-body text-amber">
                      {t("script.addTownsfolk", { n: tfMin - counts.townsfolk })}
                    </div>
                  )}
                  {counts.minion === 0 && <div className="font-body text-amber">{t("script.needMinion")}</div>}
                  {isTeensyville && counts.outsider === 0 && (
                    <div className="font-body text-amber">{t("script.needOutsider")}</div>
                  )}
                  {!isTeensyville && hasBaron && counts.townsfolk >= tfMin && (
                    <div className="font-body text-outsider">{t("script.baronActive")}</div>
                  )}
                  {valid && <div className="font-body text-tip">{t("script.validScript")}</div>}
                </div>
              </Panel>

              {scriptIds.length > 0 && (
                <Panel className="min-h-0 flex-1 overflow-y-auto">
                  <div className="font-display text-gold text-2xs mb-2 tracking-wider uppercase">
                    {t("script.contents")}
                  </div>
                  {TEAM_ORDER.map((team) => {
                    const chars = scriptChars.filter((c) => c.team === team);
                    if (chars.length === 0) return null;
                    const c = TEAM_COLORS[team];
                    return (
                      <div key={team} className="mb-2">
                        <div
                          className="font-display text-3xs mb-0.75 tracking-widest uppercase"
                          style={{ color: c.text }}
                        >
                          {TEAM_LABEL[team]} ({chars.length})
                        </div>
                        <div className="flex flex-wrap gap-0.75">
                          {chars.map((char) => (
                            <button
                              key={char.id}
                              onClick={() => onToggleScriptChar(char.id)}
                              title={t("script.removeChar", { name: char.name })}
                              className="font-display bg-panel-dark text-2xs flex cursor-pointer items-center gap-0.75 rounded-xs px-1.5 py-0.5"
                              style={{
                                border: `1px solid ${c.border}`,
                                color: c.text
                              }}
                            >
                              <CharacterIcon
                                characterId={char.id}
                                edition={char.edition}
                                team={char.team}
                                alt={char.name}
                                variant="token"
                                className="size-3"
                              />
                              <span className="line-clamp-1">{char.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </Panel>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
