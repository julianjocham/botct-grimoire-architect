"use client";

import { Character, PremadeScript, ScriptStepProps, ScriptType } from "@/types";
import { CharacterToken } from "./common/CharacterToken";
import { EDITIONS } from "@/constants/info";
import { TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";
import { calculateEffectiveStrength } from "@/lib/strength/calculate";
import { Panel } from "./ui/Panel";
import premadeScriptsData from "@/data/premadeScripts.json";
import { CharacterIcon } from "@/components/ui/CharacterIcon";

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

const premadeScripts = premadeScriptsData as PremadeScript[];

function PremadeScriptCard({
  script,
  allCharacters,
  isSelected,
  onSelect
}: {
  script: PremadeScript;
  allCharacters: Character[];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const chars = allCharacters.filter((c) => script.characters.includes(c.id));
  const counts = {
    townsfolk: chars.filter((c) => c.team === "townsfolk").length,
    outsider: chars.filter((c) => c.team === "outsider").length,
    minion: chars.filter((c) => c.team === "minion").length,
    demon: chars.filter((c) => c.team === "demon").length
  };

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border-2 p-[16px_18px] transition-all duration-150 ease-[ease] ${
        isSelected ? "border-blood bg-[#1a0f0f]" : "bg-surface border-subtle"
      }`}
    >
      <div className={`font-display mb-2.5 text-base tracking-[0.04em] ${isSelected ? "text-parchment" : "text-gold"}`}>
        {script.name}
      </div>
      <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1">
        {TEAM_ORDER.map((team) => {
          const n = counts[team as keyof typeof counts];
          if (!n) return null;
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
          onSelect();
        }}
        className={`font-display w-full cursor-pointer rounded-md border-none py-1.5 text-xs tracking-[0.05em] transition-all duration-150 ease-[ease] ${
          isSelected ? "bg-blood text-parchment" : "bg-subtle text-[#888]"
        }`}
      >
        {isSelected ? "✓ Selected" : "Select Script"}
      </button>
    </div>
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
  const isCustom = scriptSource === "custom";
  const isTeensyville = scriptType === "teensyville";

  const teensyvilleScripts = premadeScripts.filter((s) => s.type === "teensyville");
  const fullPremadeScripts = premadeScripts.filter((s) => s.type === "full");

  // Script character counts for custom builder
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
  // minimum TF needed to play the smallest supported game
  const tfMin = isTeensyville ? 5 : hasBaron ? 7 : 9;

  const valid = isCustom ? scriptIsValid(scriptIds, allCharacters, scriptType) : scriptSource !== null;

  // Custom builder: filtered pool
  const filteredPool = isCustom
    ? allCharacters.filter(
        (c) =>
          !searchQuery ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.ability.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-9 px-6 py-8">
      <div>
        <h2 className="font-display text-parchment m-0 mb-2 text-2xl tracking-[0.04em]">Step 1 — Choose Your Script</h2>
        <p className="font-body text-dim text-md m-0">
          A script is the set of characters available to appear in your game. Choose a pre-made script or build your
          own.
        </p>
      </div>

      {/* Game type toggle */}
      {!isCustom && (
        <div className="flex gap-0 self-start rounded-lg border border-[#2a2a3a] bg-[#0a0a14] p-1">
          {(["full", "teensyville"] as const).map((type) => {
            const active = scriptType === type;
            return (
              <button
                key={type}
                onClick={() => onSetScriptType(type)}
                className={`font-display cursor-pointer rounded-md border-none px-4 py-1.5 text-xs tracking-[0.05em] transition-all duration-150 ${
                  active ? "bg-blood text-parchment" : "text-dim bg-transparent hover:text-[#888]"
                }`}
              >
                {type === "full" ? "Full Script" : "Teensyville"}
              </button>
            );
          })}
        </div>
      )}

      {/* Edition cards — full scripts only */}
      {!isCustom && !isTeensyville && (
        <>
          <div className="grid grid-cols-3 gap-4">
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
                  className={`cursor-pointer rounded-xl border-2 p-[20px_22px] transition-all duration-150 ease-[ease] ${
                    isSelected ? "border-blood bg-[#1a0f0f]" : "bg-surface border-subtle"
                  }`}
                >
                  <div className="mb-2.5 flex items-start justify-between">
                    <div
                      className={`font-display text-lg tracking-[0.04em] ${
                        isSelected ? "text-parchment" : "text-gold"
                      }`}
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

                  {/* Character count grid */}
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
                    className={`font-display w-full cursor-pointer rounded-md border-none py-2 text-xs tracking-[0.05em] transition-all duration-150 ease-[ease] ${
                      isSelected ? "bg-blood text-parchment" : "bg-subtle text-[#888]"
                    }`}
                  >
                    {isSelected ? "✓ Selected" : "Select Script"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Custom option */}
          <div className="bg-surface border-subtle flex items-center justify-between gap-4 rounded-xl border-2 border-dashed px-6 py-5">
            <div>
              <div className="font-display text-gold text-md mb-1">Custom Script</div>
              <div className="font-body text-dim text-base leading-normal">
                Mix characters from all editions. Aim for 13+ Townsfolk, 4 Outsiders, 4 Minions, and at least 1 Demon to
                support all player counts.
              </div>
            </div>
            <button
              onClick={onSelectCustom}
              className="bg-surface border-gold text-gold font-display shrink-0 cursor-pointer rounded-md border px-4.5 py-2 text-xs tracking-[0.05em] whitespace-nowrap"
            >
              Build Custom →
            </button>
          </div>

          {/* Community full scripts */}
          <div>
            <div className="font-display text-gold mb-3 text-sm tracking-[0.06em] uppercase">Community Scripts</div>
            <div className="grid grid-cols-4 gap-3">
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

          {/* Continue button for edition selection */}
          {scriptSource && (
            <div className="flex justify-end">
              <button
                onClick={onContinue}
                className="bg-blood text-parchment font-display cursor-pointer rounded-lg border-none px-7 py-3 text-base tracking-[0.06em]"
              >
                Set Up Game →
              </button>
            </div>
          )}
        </>
      )}

      {/* Teensyville landing */}
      {!isCustom && isTeensyville && (
        <>
          {/* Premade scripts */}
          <div>
            <div className="font-display text-gold mb-3 text-sm tracking-[0.06em] uppercase">
              Community Teensyville Scripts
            </div>
            <div className="grid grid-cols-3 gap-4">
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

          {/* Continue button for premade selection */}
          {scriptSource === "premade" && (
            <div className="flex justify-end">
              <button
                onClick={onContinue}
                className="bg-blood text-parchment font-display cursor-pointer rounded-lg border-none px-7 py-3 text-base tracking-[0.06em]"
              >
                Set Up Game →
              </button>
            </div>
          )}

          {/* Custom option */}
          <div className="bg-surface border-subtle flex items-center justify-between gap-4 rounded-xl border-2 border-dashed px-6 py-5">
            <div>
              <div className="font-display text-gold text-md mb-1">Custom Teensyville Script</div>
              <div className="font-body text-dim text-base leading-normal">
                Build a small script for 5–6 players. You need at least 5 Townsfolk, 1 Outsider, 1 Minion, and 1 Demon.
              </div>
            </div>
            <button
              onClick={onSelectCustom}
              className="bg-surface border-gold text-gold font-display shrink-0 cursor-pointer rounded-md border px-4.5 py-2 text-xs tracking-[0.05em] whitespace-nowrap"
            >
              Build Custom →
            </button>
          </div>
        </>
      )}

      {/* Custom script builder */}
      {isCustom && (
        <div className="flex flex-col gap-4">
          {/* Top controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() =>
                isTeensyville
                  ? onClearScriptSource()
                  : onSelectEdition(
                      "tb",
                      editionPools.tb.map((c) => c.id)
                    )
              }
              className="border-subtle text-muted font-body cursor-pointer rounded-[5px] border bg-transparent px-3 py-1.25 text-base"
            >
              ← Back to Script Selection
            </button>
            <button
              onClick={onContinue}
              disabled={!valid}
              className={`font-display rounded-lg border-none px-7 py-3 text-base tracking-[0.06em] ${
                valid ? "bg-blood text-parchment cursor-pointer" : "cursor-default bg-[#1a1a1a] text-[#333]"
              }`}
            >
              Set Up Game →
            </button>
          </div>

          {/* Main grid */}
          <div className="grid min-h-150 grid-cols-[1fr_280px] gap-4">
            {/* Left: character pool */}
            <div className="bg-surface border-subtle flex flex-col overflow-hidden rounded-[10px] border">
              <div className="border-subtle border-b px-3 py-2.5">
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="bg-background text-parchment font-body box-border w-full rounded-md border border-[#3a3a4a] px-2.5 py-1.5 text-base outline-none"
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
                      <div className="grid grid-cols-3 gap-1.5">
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
              {/* Count dashboard */}
              <Panel title={`Your Script — ${scriptIds.length}`} className="flex-shrink-0">
                <div className="flex gap-1.5">
                  {TEAM_ORDER.map((team) => {
                    const have = counts[team];
                    const need = TARGETS[team];
                    const ok = have >= need;
                    const c = TEAM_COLORS[team];
                    return (
                      <div
                        key={team}
                        className="flex-1 rounded-[5px] bg-[#0a0a14] px-0.75 py-1.5 text-center"
                        style={{ border: `1px solid ${ok ? c.border : "#2a2a3a"}` }}
                      >
                        <div className="font-mono text-base leading-none" style={{ color: ok ? c.text : "#444" }}>
                          {have}
                        </div>
                        <div className="text-dimmer text-3xs font-mono leading-none">/ {need}</div>
                        <div className="font-body text-dim text-3xs mt-0.5 capitalize">{team}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Hint messages — condensed */}
                <div className="text-2xs mt-2 flex flex-col gap-0.5">
                  {counts.demon === 0 && <div className="font-body text-blood-light">⚠ Need Demon</div>}
                  {counts.townsfolk < tfMin && (
                    <div className="font-body text-amber">⚡ Add {tfMin - counts.townsfolk}+ Townsfolk</div>
                  )}
                  {counts.minion === 0 && <div className="font-body text-amber">⚡ Need Minion</div>}
                  {isTeensyville && counts.outsider === 0 && (
                    <div className="font-body text-amber">⚡ Need Outsider</div>
                  )}
                  {!isTeensyville && hasBaron && counts.townsfolk >= tfMin && (
                    <div className="font-body text-outsider">⚙ Baron active</div>
                  )}
                  {valid && <div className="font-body text-tip">✓ Valid script</div>}
                </div>
              </Panel>

              {/* Script character list — compact */}
              {scriptIds.length > 0 && (
                <Panel className="min-h-0 flex-1 overflow-y-auto">
                  <div className="font-display text-gold text-2xs mb-2 tracking-[0.06em] uppercase">Contents</div>
                  {TEAM_ORDER.map((team) => {
                    const chars = scriptChars.filter((c) => c.team === team);
                    if (chars.length === 0) return null;
                    const c = TEAM_COLORS[team];
                    return (
                      <div key={team} className="mb-2">
                        <div
                          className="font-display text-3xs mb-0.75 tracking-[0.08em] uppercase"
                          style={{ color: c.text }}
                        >
                          {TEAM_LABEL[team]} ({chars.length})
                        </div>
                        <div className="flex flex-wrap gap-0.75">
                          {chars.map((char) => (
                            <button
                              key={char.id}
                              onClick={() => onToggleScriptChar(char.id)}
                              title={`Remove ${char.name}`}
                              className="font-display text-2xs flex cursor-pointer items-center gap-0.75 rounded-xs bg-[#1a1a2a] px-1.5 py-0.5"
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
