"use client";

import { Character } from "@/lib/types";
import { CharacterToken } from "./CharacterToken";
import { calculateEffectiveStrength, getSupportedPlayerCounts } from "@/lib/engine";
import { ScriptStepProps } from "@/components/types";
import { EDITIONS } from "@/constants/info";
import { TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";

function teamCount(chars: Character[], team: string) {
  return chars.filter((c) => c.team === team).length;
}

function scriptIsValid(scriptIds: string[], allCharacters: Character[]) {
  const chars = allCharacters.filter((c) => scriptIds.includes(c.id));
  return (
    chars.filter((c) => c.team === "demon").length >= 1 &&
    chars.filter((c) => c.team === "townsfolk").length >= 9 &&
    chars.filter((c) => c.team === "minion").length >= 1
  );
}

export function ScriptStep({
  scriptSource,
  scriptIds,
  allCharacters,
  editionPools,
  searchQuery,
  onSelectEdition,
  onSelectCustom,
  onToggleScriptChar,
  onContinue,
  onSearch,
  onDetail
}: ScriptStepProps) {
  const isCustom = scriptSource === "custom";

  // Script character counts for custom builder
  const scriptChars = allCharacters.filter((c) => scriptIds.includes(c.id));
  const counts = {
    townsfolk: teamCount(scriptChars, "townsfolk"),
    outsider: teamCount(scriptChars, "outsider"),
    minion: teamCount(scriptChars, "minion"),
    demon: teamCount(scriptChars, "demon")
  };
  const hasBaron = scriptIds.includes("baron");
  // Baron shifts 2 TF to OS, so targets adjust accordingly
  const TARGETS = {
    townsfolk: hasBaron ? 11 : 13,
    outsider: hasBaron ? 6 : 4,
    minion: 4,
    demon: 1
  };
  const tfMin = hasBaron ? 7 : 9; // minimum TF needed for a 7-player game

  const valid = isCustom ? scriptIsValid(scriptIds, allCharacters) : scriptSource !== null;

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
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-8">
      <div>
        <h2 className="font-display text-parchment m-0 mb-[6px] text-[22px] tracking-[0.04em]">
          Step 1 — Choose Your Script
        </h2>
        <p className="font-body text-dim m-0 text-[14px]">
          A script is the set of characters available to appear in your game. Choose a pre-made script or build your
          own.
        </p>
      </div>

      {/* Edition cards */}
      {!isCustom && (
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
                  className={`cursor-pointer rounded-[12px] border-2 p-[20px_22px] transition-all duration-[150ms] ease-[ease] ${
                    isSelected ? "border-blood bg-[#1a0f0f]" : "bg-surface border-subtle"
                  }`}
                >
                  <div className="mb-[10px] flex items-start justify-between">
                    <div
                      className={`font-display text-[15px] tracking-[0.04em] ${
                        isSelected ? "text-parchment" : "text-gold"
                      }`}
                    >
                      {ed.name}
                    </div>
                    <span
                      className="font-body shrink-0 rounded-[3px] px-[7px] py-[2px] text-[10px]"
                      style={{
                        color: ed.diffColor,
                        border: `1px solid ${ed.diffColor}44`
                      }}
                    >
                      {ed.difficulty}
                    </span>
                  </div>

                  <div className="font-body text-muted mb-4 min-h-[40px] text-[13px] leading-[1.5]">{ed.tagline}</div>

                  {/* Character count grid */}
                  <div className="mb-4 grid grid-cols-2 gap-x-3 gap-y-1">
                    {TEAM_ORDER.map((team) => {
                      const n = teamCount(pool, team);
                      if (n === 0) return null;
                      const c = TEAM_COLORS[team];
                      return (
                        <div key={team} className="font-mono text-[11px]" style={{ color: c.text }}>
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
                    className={`font-display w-full cursor-pointer rounded-[6px] border-none py-2 text-[11px] tracking-[0.05em] transition-all duration-[150ms] ease-[ease] ${
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
          <div className="bg-surface border-subtle flex items-center justify-between gap-4 rounded-[12px] border-2 border-dashed px-6 py-5">
            <div>
              <div className="font-display text-gold mb-1 text-[14px]">Custom Script</div>
              <div className="font-body text-dim text-[13px] leading-[1.5]">
                Mix characters from all editions. Aim for 13+ Townsfolk, 4 Outsiders, 4 Minions, and at least 1 Demon to
                support all player counts.
              </div>
            </div>
            <button
              onClick={onSelectCustom}
              className="bg-surface border-gold text-gold font-display shrink-0 cursor-pointer rounded-[6px] border px-[18px] py-2 text-[11px] tracking-[0.05em] whitespace-nowrap"
            >
              Build Custom →
            </button>
          </div>

          {/* Continue button for edition selection */}
          {scriptSource && (
            <div className="flex justify-end">
              <button
                onClick={onContinue}
                className="bg-blood text-parchment font-display cursor-pointer rounded-[8px] border-none px-7 py-3 text-[13px] tracking-[0.06em]"
              >
                Set Up Game →
              </button>
            </div>
          )}
        </>
      )}

      {/* Custom script builder */}
      {isCustom && (
        <div className="grid min-h-[600px] grid-cols-[300px_1fr] gap-4">
          {/* Left: character pool */}
          <div className="bg-surface border-subtle flex flex-col overflow-hidden rounded-[10px] border">
            <div className="border-subtle border-b px-3 py-[10px]">
              <input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="bg-background text-parchment font-body box-border w-full rounded-[6px] border border-[#3a3a4a] px-[10px] py-[6px] text-[13px] outline-none"
              />
            </div>
            <div className="flex flex-1 flex-col gap-[10px] overflow-y-auto px-[10px] py-2">
              {TEAM_ORDER.map((team) => {
                const chars = filteredPool.filter((c) => c.team === team);
                if (chars.length === 0) return null;
                return (
                  <div key={team}>
                    <div className="font-display text-gold border-subtle mb-[5px] border-b pb-[3px] text-[10px] tracking-[0.1em] uppercase">
                      {TEAM_LABEL[team]} ({chars.length})
                    </div>
                    <div className="flex flex-col gap-[3px]">
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
          <div className="flex flex-col gap-[14px]">
            {/* Back button */}
            <button
              onClick={() =>
                onSelectEdition(
                  "tb",
                  editionPools.tb.map((c) => c.id)
                )
              }
              className="border-subtle text-muted font-body cursor-pointer self-start rounded-[5px] border bg-transparent px-3 py-[5px] text-[13px]"
            >
              ← Back to Script Selection
            </button>

            {/* Count dashboard */}
            <div className="bg-surface border-subtle rounded-[10px] border px-4 py-[14px]">
              <div className="font-display text-gold mb-3 text-[12px] tracking-[0.06em] uppercase">
                Your Script — {scriptIds.length} characters
              </div>
              <div className="flex gap-[10px]">
                {TEAM_ORDER.map((team) => {
                  const have = counts[team];
                  const need = TARGETS[team];
                  const ok = have >= need;
                  const c = TEAM_COLORS[team];
                  return (
                    <div
                      key={team}
                      className="flex-1 rounded-[7px] bg-[#0a0a14] px-1 py-2 text-center"
                      style={{ border: `1px solid ${ok ? c.border : "#2a2a3a"}` }}
                    >
                      <div className="font-mono text-[20px]" style={{ color: ok ? c.text : "#444" }}>
                        {have}
                      </div>
                      <div className="text-dimmer font-mono text-[8px]">/ {need}</div>
                      <div className="font-body text-dim mt-[3px] text-[10px] capitalize">{team}</div>
                    </div>
                  );
                })}
              </div>

              {/* Hint messages */}
              <div className="mt-3 flex flex-col gap-1">
                {counts.demon === 0 && (
                  <div className="font-body text-blood-light text-[12px]">⚠ You need at least 1 Demon.</div>
                )}
                {counts.townsfolk < tfMin && (
                  <div className="font-body text-amber text-[12px]">
                    ⚡ Add more Townsfolk —{" "}
                    {hasBaron
                      ? "7 minimum with Baron in play (Baron replaces 2 TF with Outsiders)."
                      : "9 minimum to support a 7-player game, 12 for a full script (9 + 3 bluffs)."}
                  </div>
                )}
                {counts.minion === 0 && (
                  <div className="font-body text-amber text-[12px]">⚡ Add at least 1 Minion.</div>
                )}
                {hasBaron && counts.townsfolk >= tfMin && (
                  <div className="font-body text-outsider text-[12px]">
                    ⚙ Baron shifts 2 Townsfolk slots to Outsiders in every game — target 11 TF and 6 OS for full
                    coverage.
                  </div>
                )}
                {counts.demon > 1 && (
                  <div className="font-body text-muted text-[12px]">
                    💡 Multiple demons ({counts.demon}) — each game uses exactly 1. More options is fine.
                  </div>
                )}
                {valid && (
                  <div className="font-body text-tip text-[12px]">
                    ✓ Script is playable.
                    {counts.townsfolk < TARGETS.townsfolk
                      ? ` Add ${TARGETS.townsfolk - counts.townsfolk} more Townsfolk for full player range.`
                      : " Ready for all player counts."}
                  </div>
                )}
              </div>

              {/* Player count support grid */}
              {scriptIds.length > 0 && (
                <div className="mt-[14px]">
                  <div className="font-display text-dim mb-[6px] text-[9px] tracking-[0.08em] uppercase">
                    Supported Player Counts
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getSupportedPlayerCounts(scriptIds, allCharacters).map((entry) => (
                      <div
                        key={entry.playerCount}
                        title={
                          entry.supported
                            ? `${entry.playerCount}p: ${entry.required.townsfolk}TF ${entry.required.outsider}OS ${entry.required.minion}Mn ${entry.required.demon}Dm`
                            : `${entry.playerCount}p: not enough characters`
                        }
                        className={`flex h-[22px] w-[26px] items-center justify-center rounded-[4px] font-mono text-[10px] ${
                          entry.supported
                            ? "border border-[#2d6a4f] bg-[#0d1a0d] text-[#4a9a6a]"
                            : "border border-[#222] bg-[#0a0a14] text-[#333]"
                        }`}
                      >
                        {entry.playerCount}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Script character list */}
            {scriptIds.length > 0 && (
              <div className="bg-surface border-subtle flex-1 overflow-y-auto rounded-[10px] border px-4 py-[14px]">
                <div className="font-display text-gold mb-3 text-[12px] tracking-[0.06em] uppercase">
                  Script Contents
                </div>
                {TEAM_ORDER.map((team) => {
                  const chars = scriptChars.filter((c) => c.team === team);
                  if (chars.length === 0) return null;
                  const c = TEAM_COLORS[team];
                  return (
                    <div key={team} className="mb-3">
                      <div
                        className="font-display mb-[5px] text-[10px] tracking-[0.08em] uppercase"
                        style={{ color: c.text }}
                      >
                        {TEAM_LABEL[team]} ({chars.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {chars.map((char) => (
                          <button
                            key={char.id}
                            onClick={() => onToggleScriptChar(char.id)}
                            title={`Remove ${char.name} from script`}
                            className="font-display cursor-pointer rounded-[4px] bg-[#1a1a2a] px-2 py-[3px] text-[11px]"
                            style={{
                              border: `1px solid ${c.border}`,
                              color: c.text
                            }}
                          >
                            {char.name} ×
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Continue */}
            <div className="flex justify-end">
              <button
                onClick={onContinue}
                disabled={!valid}
                className={`font-display rounded-[8px] border-none px-7 py-3 text-[13px] tracking-[0.06em] ${
                  valid ? "bg-blood text-parchment cursor-pointer" : "cursor-default bg-[#1a1a1a] text-[#333]"
                }`}
              >
                Set Up Game →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
