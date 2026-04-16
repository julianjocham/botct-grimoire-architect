"use client";

import { useMemo } from "react";
import { Character, Interaction, GameSetupStepProps, AnalysisSidebarProps } from "@/types";
import { allInteractions } from "@/lib/data";
import { RAW_COUNTS, SETUP_MODIFIERS, TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";
import { EDITIONS, FEEL_BARS, FEEL_COLOR } from "@/constants/info";
import { analyzeScript } from "@/lib/engine";
import { calculateEffectiveStrength } from "@/lib/strength/calculate";

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

// ─── Analysis sidebar ────────────────────────────────────────────────────────

function AnalysisSidebar({ gameIds, allCharacters }: AnalysisSidebarProps) {
  const analysis = useMemo(
    () => analyzeScript(gameIds, allCharacters, allInteractions, "game"),
    [gameIds, allCharacters]
  );

  const { goodStrengthTotal: good, evilStrengthTotal: evil } = analysis;
  const maxAbs = Math.max(Math.abs(good), Math.abs(evil), 1);

  // Only show non-tip interactions
  const keyHints = analysis.interactionHints.filter((h) => h.severity !== "tip" || h.category === "jinx");

  if (gameIds.length === 0) {
    return (
      <div className="font-body px-4 py-10 text-center text-[13px] text-[#333]">
        Select characters to see live analysis.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Strength */}
      <div>
        <div className="font-display text-gold mb-[10px] text-[10px] tracking-[0.08em] uppercase">Team Strength</div>
        <div className="flex flex-col gap-2">
          {[
            { label: "Good", value: good, color: "#2a7fd4" },
            { label: "Evil", value: evil, color: "#c0392b" }
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="mb-[3px] flex justify-between">
                <span className="font-mono text-[9px] uppercase" style={{ color }}>
                  {label}
                </span>
                <span className="font-mono text-[10px]" style={{ color }}>
                  {value > 0 ? "+" : ""}
                  {value}
                </span>
              </div>
              <div className="h-[6px] overflow-hidden rounded-[3px] bg-[#1a1a2a]">
                <div
                  className="h-full rounded-[3px]"
                  style={{
                    width: `${(Math.abs(value) / maxAbs) * 100}%`,
                    background: color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game feel */}
      {gameIds.length >= 3 && (
        <div>
          <div className="font-display text-gold mb-[10px] text-[10px] tracking-[0.08em] uppercase">Game Feel</div>
          <div className="flex flex-col gap-[7px]">
            {FEEL_BARS.map(({ key, label, levels }) => {
              const val = analysis.scriptFeel[key] as string;
              const idx = levels.indexOf(val);
              const color = FEEL_COLOR[val] ?? "#b8965a";
              return (
                <div key={key}>
                  <div className="mb-[2px] flex justify-between">
                    <span className="text-dim font-mono text-[9px] uppercase">{label}</span>
                    <span className="font-display text-[9px]" style={{ color }}>
                      {val}
                    </span>
                  </div>
                  <div className="flex gap-[2px]">
                    {levels.map((_, i) => (
                      <div
                        key={i}
                        className="h-[5px] flex-1 rounded-[2px]"
                        style={{ background: i <= idx ? color : "#2a2a3a" }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactions */}
      {keyHints.length > 0 && (
        <div>
          <div className="font-display text-gold mb-2 text-[10px] tracking-[0.08em] uppercase">
            Interactions ({keyHints.length})
          </div>
          <div className="flex flex-col gap-[6px]">
            {keyHints.map((hint, i) => {
              const isJinx = hint.category === "jinx";
              const involvedChars = hint.involvedCharacters
                .map((id) => allCharacters.find((c) => c.id === id))
                .filter(Boolean) as Character[];
              const borderColor = isJinx ? "#7a6200" : hint.severity === "critical" ? "#8b1a1a" : "#7a5a00";
              const bgColor = isJinx ? "#1a1500" : hint.severity === "critical" ? "#1a0808" : "#1a1400";
              return (
                <div
                  key={i}
                  className={`rounded-[6px] px-[10px] py-2 ${isJinx ? "border-dashed" : "border-solid"}`}
                  style={{
                    border: `1px solid ${borderColor}`,
                    background: bgColor
                  }}
                >
                  <div className="mb-1 flex flex-wrap items-center gap-[5px]">
                    {isJinx && (
                      <span className="font-display text-gold shrink-0 rounded-[3px] border border-[#7a6200] bg-[#2a1f00] px-1 py-[1px] text-[8px]">
                        ⚖ Jinx
                      </span>
                    )}
                    {involvedChars.map((c) => (
                      <span
                        key={c.id}
                        className="font-display text-gold bg-subtle rounded-[3px] px-[5px] py-[1px] text-[10px]"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                  <div className="font-display text-parchment mb-[3px] text-[11px]">{hint.title}</div>
                  <div className="font-body text-parchment-muted text-[12px] leading-[1.5]">{hint.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Composition issues */}
      {analysis.compositionWarnings.length > 0 && (
        <div>
          <div className="font-display text-gold mb-2 text-[10px] tracking-[0.08em] uppercase">Issues</div>
          <div className="flex flex-col gap-[5px]">
            {analysis.compositionWarnings.map((w, i) => (
              <div
                key={i}
                className="font-body text-parchment-muted rounded-[5px] px-2 py-[6px] text-[12px] leading-[1.5]"
                style={{
                  background:
                    w.severity === "critical" ? "#1a0808" : w.severity === "important" ? "#1a1400" : "#0a1408",
                  border: `1px solid ${w.severity === "critical" ? "#8b1a1a" : w.severity === "important" ? "#7a5a00" : "#1a4a2e"}`
                }}
              >
                {w.severity === "critical" ? "⚠" : w.severity === "important" ? "⚡" : "💡"} {w.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Character strength list */}
      {gameIds.length > 0 && (
        <div>
          <div className="font-display text-gold mb-2 text-[10px] tracking-[0.08em] uppercase">Character Strengths</div>
          <div className="flex flex-col gap-1">
            {gameIds
              .map((id) => {
                const char = allCharacters.find((c) => c.id === id);
                if (!char) return null;
                const eff = calculateEffectiveStrength(id, gameIds, allCharacters);
                return { char, eff };
              })
              .filter(Boolean)
              .sort((a, b) => Math.abs(b!.eff.effectiveStrength) - Math.abs(a!.eff.effectiveStrength))
              .map((entry) => {
                if (!entry) return null;
                const { char, eff } = entry;
                const col = TEAM_COLORS[char.team];
                const s = eff.effectiveStrength;
                const barColor = s > 30 ? "#2a7fd4" : s > 0 ? "#5b9bd5" : s > -30 ? "#c0392b" : "#8b1a1a";
                return (
                  <div key={char.id} className="flex items-center gap-[6px]">
                    <div
                      className="font-display shrink-0 overflow-hidden text-[10px] text-ellipsis whitespace-nowrap"
                      style={{ color: col.text, minWidth: 90 }}
                    >
                      {char.name}
                    </div>
                    <div className="h-1 flex-1 overflow-hidden rounded-[2px] bg-[#1a1a2a]">
                      <div
                        className="h-full rounded-[2px]"
                        style={{
                          width: `${(Math.abs(s) / 100) * 100}%`,
                          background: barColor
                        }}
                      />
                    </div>
                    <div className="shrink-0 text-right font-mono text-[9px]" style={{ color: barColor, minWidth: 28 }}>
                      {s > 0 ? "+" : ""}
                      {s}
                    </div>
                    {eff.modifier !== 0 && (
                      <div
                        className={`shrink-0 font-mono text-[8px] ${eff.modifier > 0 ? "text-good-blue" : "text-blood-light"}`}
                      >
                        ({eff.modifier > 0 ? "+" : ""}
                        {eff.modifier})
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GameSetupStep({
  scriptSource,
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

  return (
    <div className="mx-auto grid max-w-[1300px] grid-cols-[1fr_300px] items-start gap-5 px-6 py-7">
      {/* ── Left: selection ── */}
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-parchment m-0 mb-[6px] text-[22px] tracking-[0.04em]">
              Step 2 — Set Up Your Game
            </h2>
            <div className="font-body text-dim text-[13px]">
              Script: <span className="text-gold">{EDITIONS[scriptSource ?? "custom"]}</span>
              {" · "}
              {scriptIds.length} characters available
            </div>
          </div>
          <button
            onClick={onBack}
            className="border-subtle text-muted font-body cursor-pointer rounded-[5px] border bg-transparent px-[14px] py-[6px] text-[13px]"
          >
            ← Change Script
          </button>
        </div>

        {/* Player count */}
        <div>
          <div className="font-display text-gold mb-[10px] text-[11px] tracking-[0.08em] uppercase">
            How many players?
          </div>
          <div className="flex flex-wrap gap-[6px]">
            {Array.from({ length: 16 }, (_, i) => i + 5).map((n) => {
              const active = playerCount === n;
              const isTraveler = n > 15;
              return (
                <button
                  key={n}
                  onClick={() => onSetPlayerCount(active ? null : n)}
                  className={[
                    "cursor-pointer rounded-[7px] border-2 font-mono transition-all duration-100",
                    isTraveler ? "px-[10px] py-[5px]" : "px-[14px] py-2",
                    isTraveler ? "text-[11px]" : "text-[14px]",
                    active
                      ? "bg-blood border-blood text-parchment font-bold"
                      : isTraveler
                        ? "bg-surface text-dim border-[#2a2a2a]"
                        : "bg-surface border-subtle text-[#888]"
                  ].join(" ")}
                  title={isTraveler ? `${n} players (${n - 15} traveler${n - 15 > 1 ? "s" : ""})` : `${n} players`}
                >
                  {n}
                  {isTraveler && (
                    <span className={`block text-[8px] leading-[1] ${active ? "text-parchment" : "text-dimmer"}`}>
                      +{n - 15}T
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {neededTravelers > 0 && playerCount && (
            <div className="font-body text-dim mt-2 text-[12px]">
              Travelers fill the extra {neededTravelers} slot{neededTravelers > 1 ? "s" : ""} — they are not from your
              script.
            </div>
          )}
        </div>

        {/* Distribution + character selection */}
        {playerCount && req && (
          <>
            {/* Distribution */}
            <div className="bg-surface border-subtle rounded-[10px] border px-4 py-[14px]">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-display text-gold text-[12px] tracking-[0.06em] uppercase">
                  {playerCount}-Player Distribution
                </div>
                {isComplete && <div className="font-display text-tip text-[11px]">✓ Roster Complete</div>}
              </div>
              <div className="flex gap-2">
                {TEAM_ORDER.map((team) => {
                  const needed = req[team];
                  const have = gameCounts[team];
                  const done = have >= needed;
                  const c = TEAM_COLORS[team];
                  return (
                    <div
                      key={team}
                      className="flex-1 rounded-[8px] border-2 bg-[#0a0a14] px-[6px] py-[10px] text-center transition-[border-color] duration-200"
                      style={{ borderColor: done ? c.border : "#2a2a3a" }}
                    >
                      <div className="font-mono text-[22px] leading-[1]" style={{ color: done ? c.text : "#333" }}>
                        {have}
                      </div>
                      <div className="my-[2px] font-mono text-[10px] text-[#333]">/ {needed}</div>
                      <div className="font-body text-dim text-[11px] capitalize">{team}</div>
                    </div>
                  );
                })}
                {neededTravelers > 0 && (
                  <div
                    className={`flex-1 rounded-[8px] border-2 bg-[#0a0a14] px-[6px] py-[10px] text-center transition-[border-color] duration-200 ${travelersComplete ? "border-[#4a3a20]" : "border-subtle"}`}
                  >
                    <div
                      className={`font-mono text-[22px] leading-[1] ${travelersComplete ? "text-gold" : "text-[#333]"}`}
                    >
                      {selectedTravelerIds.length}
                    </div>
                    <div className="my-[2px] font-mono text-[10px] text-[#333]">/ {neededTravelers}</div>
                    <div className="font-body text-dim text-[11px]">Travelers</div>
                  </div>
                )}
              </div>
              {activeModifiers.length > 0 && (
                <div className="mt-[10px] flex flex-col gap-[3px]">
                  {activeModifiers.map((note, i) => (
                    <div key={i} className="font-body text-minion text-[12px]">
                      ⚙ {note}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Character selection */}
            <div className="flex flex-col gap-4">
              <div className="font-display text-gold text-[11px] tracking-[0.08em] uppercase">
                Choose Characters for This Game
              </div>

              {TEAM_ORDER.map((team) => {
                const chars = scriptChars.filter((c) => c.team === team);
                const needed = req[team];
                const have = gameCounts[team];
                const isFull = have >= needed;
                const c = TEAM_COLORS[team];
                if (chars.length === 0) return null;

                return (
                  <div key={team}>
                    <div className="mb-2 flex items-center gap-[10px]">
                      <div className="font-display text-[12px] tracking-[0.06em] uppercase" style={{ color: c.text }}>
                        {TEAM_LABEL[team]}
                      </div>
                      <div
                        className="rounded-[10px] bg-[#0a0a14] px-[10px] py-[2px] font-mono text-[11px]"
                        style={{
                          color: isFull ? c.text : "#555",
                          border: `1px solid ${isFull ? c.border : "#2a2a3a"}`
                        }}
                      >
                        {have} / {needed}
                      </div>
                      {needed === 0 && (
                        <div className="font-body text-dimmer text-[11px]">(none needed at this count)</div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-[6px]">
                      {chars.map((char) => {
                        const inGame = gameIds.includes(char.id);
                        const blocked = !inGame && isFull;
                        // Counter badge: how many of this char's counters are in the game
                        const countersInGame = (char.counters ?? []).filter((id) => gameIds.includes(id)).length;
                        // Synergy badge: how many synergies this char has with already-selected game chars
                        const synergiesInGame = allInteractions.filter(
                          (i: Interaction) =>
                            i.type === "synergy" &&
                            ((i.a === char.id && gameIds.includes(i.b)) || (i.b === char.id && gameIds.includes(i.a)))
                        );
                        const synergySummary =
                          synergiesInGame.length > 0 ? synergiesInGame.map((i: Interaction) => i.title).join("\n") : "";

                        return (
                          <div
                            key={char.id}
                            className="flex overflow-hidden rounded-[7px] transition-all duration-100"
                            style={{
                              border: `1px solid ${inGame ? c.border : synergiesInGame.length > 0 ? "#2a4a20" : "#2a2a3a"}`,
                              opacity: blocked ? 0.3 : 1
                            }}
                          >
                            <button
                              onClick={() => onDetail(char.id)}
                              className="font-display flex cursor-pointer items-center gap-[5px] border-none px-[10px] py-[6px] text-[12px]"
                              style={{
                                background: inGame ? c.bg : synergiesInGame.length > 0 ? "#0d1a0d" : "#14141f",
                                borderRight: `1px solid ${inGame ? c.border : "#2a2a3a"}`,
                                color: inGame ? c.text : "#666"
                              }}
                            >
                              {char.name}
                              {synergiesInGame.length > 0 && !inGame && (
                                <span
                                  title={synergySummary}
                                  className="cursor-help rounded-[3px] border border-[#2a4a20] bg-[#0d1a0d] px-[3px] font-mono text-[8px] text-[#4a9a4a]"
                                >
                                  ✦{synergiesInGame.length}
                                </span>
                              )}
                              {countersInGame > 0 && (
                                <span className="text-gold rounded-[3px] border border-[#7a5a00] bg-[#2a1a00] px-[3px] font-mono text-[8px]">
                                  ⚔{countersInGame}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (!blocked) onToggleGameChar(char.id);
                              }}
                              disabled={blocked}
                              className="border-none px-[10px] py-[6px] text-[13px]"
                              style={{
                                background: inGame ? c.bg : "#14141f",
                                color: inGame ? c.text : "#555",
                                cursor: blocked ? "default" : "pointer"
                              }}
                            >
                              {inGame ? "−" : "+"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Traveler picker — only when 16+ players and edition has travelers */}
            {neededTravelers > 0 && editionTravelers.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-[10px]">
                  <div className="font-display text-gold text-[11px] tracking-[0.08em] uppercase">Travelers</div>
                  <div
                    className={`rounded-[10px] bg-[#0a0a14] px-[10px] py-[2px] font-mono text-[11px] ${travelersComplete ? "text-gold border border-[#4a3a20]" : "text-dim border-subtle border"}`}
                  >
                    {selectedTravelerIds.length} / {neededTravelers}
                  </div>
                  <div className="font-body text-dimmer text-[11px]">
                    (choose {neededTravelers} traveler{neededTravelers !== 1 ? "s" : ""})
                  </div>
                </div>
                <div className="flex flex-wrap gap-[6px]">
                  {editionTravelers.map((traveler) => {
                    const inGame = gameIds.includes(traveler.id);
                    const blocked = !inGame && travelersComplete;
                    return (
                      <div
                        key={traveler.id}
                        className={`flex overflow-hidden rounded-[7px] transition-all duration-100 ${inGame ? "border border-[#4a3a20]" : "border-subtle border"} ${blocked ? "opacity-30" : "opacity-100"}`}
                      >
                        <button
                          onClick={() => onDetail(traveler.id)}
                          className={`font-display cursor-pointer border-none px-[10px] py-[6px] text-[12px] ${inGame ? "text-gold border-r border-r-[#4a3a20] bg-[#1a1500]" : "bg-surface text-muted border-r-subtle border-r"}`}
                        >
                          {traveler.name}
                        </button>
                        <button
                          onClick={() => {
                            if (!blocked) onToggleGameChar(traveler.id);
                          }}
                          disabled={blocked}
                          className={`border-none px-[10px] py-[6px] text-[13px] ${inGame ? "text-gold bg-[#1a1500]" : "bg-surface text-dim"} ${blocked ? "cursor-default" : "cursor-pointer"}`}
                        >
                          {inGame ? "−" : "+"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Continue */}
            <div className="flex justify-end pt-2">
              <button
                onClick={onContinue}
                disabled={!isComplete}
                className={`font-display rounded-[8px] border-none px-7 py-3 text-[13px] tracking-[0.06em] ${isComplete ? "bg-blood text-parchment cursor-pointer" : "cursor-default bg-[#1a1a1a] text-[#333]"}`}
              >
                {isComplete
                  ? "View Dashboard →"
                  : coreComplete && neededTravelers > 0
                    ? `Select ${neededTravelers - selectedTravelerIds.length} more traveler${neededTravelers - selectedTravelerIds.length !== 1 ? "s" : ""}…`
                    : `Select ${totalNeeded - coreGameIds.length} more character${totalNeeded - coreGameIds.length !== 1 ? "s" : ""}…`}
              </button>
            </div>
          </>
        )}

        {!playerCount && (
          <div className="text-dimmer font-body py-[30px] text-center text-[14px]">
            Choose a player count above to begin selecting characters.
          </div>
        )}
      </div>

      {/* ── Right: live analysis sidebar ── */}
      <div className="bg-surface border-subtle sticky top-4 max-h-[calc(100vh-100px)] overflow-y-auto rounded-[10px] border p-[14px]">
        <div className="font-display text-gold mb-3 text-[10px] tracking-[0.08em] uppercase">Live Analysis</div>
        <AnalysisSidebar gameIds={gameIds} allCharacters={allCharacters} />
      </div>
    </div>
  );
}
