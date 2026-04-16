"use client";

import { useMemo } from "react";
import { Character, Interaction, GameSetupStepProps, AnalysisSidebarProps } from "@/types";
import { allInteractions } from "@/lib/data";
import { RAW_COUNTS, SETUP_MODIFIERS, TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";
import { FEEL_BARS, FEEL_COLOR } from "@/constants/info";
import { analyzeScript } from "@/lib/engine";
import { calculateEffectiveStrength } from "@/lib/strength/calculate";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { CharacterIcon } from "@/components/ui/CharacterIcon";

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
      <div className="font-body px-4 py-10 text-center text-base text-[#333]">
        Select characters to see live analysis.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Strength */}
      <div>
        <SectionLabel className="mb-2.5">Team Strength</SectionLabel>
        <div className="flex flex-col gap-2">
          {[
            { label: "Good", value: good, color: "#2a7fd4" },
            { label: "Evil", value: evil, color: "#c0392b" }
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="mb-0.75 flex justify-between">
                <span className="text-3xs font-mono uppercase" style={{ color }}>
                  {label}
                </span>
                <span className="text-2xs font-mono" style={{ color }}>
                  {value > 0 ? "+" : ""}
                  {value}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-[3px] bg-[#1a1a2a]">
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
          <SectionLabel className="mb-2.5">Game Feel</SectionLabel>
          <div className="flex flex-col gap-1.75">
            {FEEL_BARS.map(({ key, label, levels }) => {
              const val = analysis.scriptFeel[key] as string;
              const idx = levels.indexOf(val);
              const color = FEEL_COLOR[val] ?? "#b8965a";
              return (
                <div key={key}>
                  <div className="mb-0.5 flex justify-between">
                    <span className="text-dim text-3xs font-mono uppercase">{label}</span>
                    <span className="font-display text-3xs" style={{ color }}>
                      {val}
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {levels.map((_, i) => (
                      <div
                        key={i}
                        className="h-1.25 flex-1 rounded-xs"
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
          <SectionLabel className="mb-2">Interactions ({keyHints.length})</SectionLabel>
          <div className="flex flex-col gap-1.5">
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
                  className={`rounded-md px-2.5 py-2 ${isJinx ? "border-dashed" : "border-solid"}`}
                  style={{
                    border: `1px solid ${borderColor}`,
                    background: bgColor
                  }}
                >
                  <div className="mb-1 flex flex-wrap items-center gap-1.25">
                    {isJinx && (
                      <span className="font-display text-gold text-3xs shrink-0 rounded-[3px] border border-[#7a6200] bg-[#2a1f00] px-1 py-px">
                        ⚖ Jinx
                      </span>
                    )}
                    {involvedChars.map((c) => (
                      <span
                        key={c.id}
                        className="font-display text-gold bg-subtle text-2xs flex items-center gap-0.75 rounded-[3px] px-1.25 py-px"
                      >
                        <CharacterIcon
                          characterId={c.id}
                          edition={c.edition}
                          team={c.team}
                          alt={c.name}
                          className="size-3"
                        />
                        {c.name}
                      </span>
                    ))}
                  </div>
                  <div className="font-display text-parchment mb-0.75 text-xs">{hint.title}</div>
                  <div className="font-body text-parchment-muted text-sm leading-normal">{hint.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Composition issues */}
      {analysis.compositionWarnings.length > 0 && (
        <div>
          <SectionLabel className="mb-2">Issues</SectionLabel>
          <div className="flex flex-col gap-1.25">
            {analysis.compositionWarnings.map((w, i) => (
              <div
                key={i}
                className="font-body text-parchment-muted rounded-[5px] px-2 py-1.5 text-sm leading-normal"
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
          <SectionLabel className="mb-2">Character Strengths</SectionLabel>
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
                  <div key={char.id} className="flex items-center gap-2">
                    <CharacterIcon
                      characterId={char.id}
                      edition={char.edition}
                      team={char.team}
                      alt={char.name}
                      variant="token"
                      className="size-5 shrink-0"
                    />
                    <div className="font-display text-2xs shrink-0 truncate" style={{ color: col.text, minWidth: 90 }}>
                      {char.name}
                    </div>
                    <div className="h-1 flex-1 overflow-hidden rounded-xs bg-[#1a1a2a]">
                      <div
                        className="h-full rounded-xs"
                        style={{
                          width: `${(Math.abs(s) / 100) * 100}%`,
                          background: barColor
                        }}
                      />
                    </div>
                    <div className="text-3xs shrink-0 text-right font-mono" style={{ color: barColor, minWidth: 28 }}>
                      {s > 0 ? "+" : ""}
                      {s}
                    </div>
                    {eff.modifier !== 0 && (
                      <div
                        className={`text-3xs shrink-0 font-mono ${eff.modifier > 0 ? "text-good-blue" : "text-blood-light"}`}
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

  return (
    <div className="mx-auto grid max-w-325 grid-cols-[1fr_320px] items-start gap-6 px-6 py-8">
      {/* ── Left: selection ── */}
      <div className="flex flex-col gap-7">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-parchment m-0 mb-1.5 text-[22px] tracking-[0.04em]">
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

        {/* Top controls bar */}
        {playerCount && (
          <div className="flex justify-end pt-1">
            <button
              onClick={onContinue}
              disabled={!isComplete}
              className={`font-display rounded-lg border-none px-7 py-3 text-base tracking-[0.06em] ${isComplete ? "bg-blood text-parchment cursor-pointer" : "cursor-default bg-[#1a1a1a] text-[#333]"}`}
            >
              {isComplete
                ? "View Dashboard →"
                : coreComplete && neededTravelers > 0
                  ? `Select ${neededTravelers - selectedTravelerIds.length} more traveler${neededTravelers - selectedTravelerIds.length !== 1 ? "s" : ""}…`
                  : `Select ${totalNeeded - coreGameIds.length} more character${totalNeeded - coreGameIds.length !== 1 ? "s" : ""}…`}
            </button>
          </div>
        )}

        {/* Player count */}
        <div>
          <SectionLabel className="mb-2.5">How many players?</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: scriptType === "teensyville" ? 2 : 16 }, (_, i) => i + 5).map((n) => {
              const active = playerCount === n;
              const isTraveler = n > 15;
              return (
                <button
                  key={n}
                  onClick={() => onSetPlayerCount(active ? null : n)}
                  className={[
                    "cursor-pointer rounded-[7px] border-2 font-mono transition-all duration-100",
                    isTraveler ? "px-2.5 py-1.25" : "px-3.5 py-2",
                    isTraveler ? "text-xs" : "text-md",
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
                    <span className={`text-3xs block leading-none ${active ? "text-parchment" : "text-dimmer"}`}>
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
            {/* Distribution */}
            <Panel className="flex-shrink-0">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-display text-gold text-2xs tracking-[0.06em] uppercase">
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
                      className="flex-1 rounded-lg border-2 bg-[#0a0a14] px-1 py-1.5 text-center transition-[border-color] duration-200"
                      style={{ borderColor: done ? c.border : "#2a2a3a" }}
                    >
                      <div className="font-mono text-lg leading-none" style={{ color: done ? c.text : "#333" }}>
                        {have}
                      </div>
                      <div className="text-3xs my-0.5 font-mono text-[#333]">/ {needed}</div>
                      <div className="font-body text-dim text-3xs capitalize">{team}</div>
                    </div>
                  );
                })}
                {neededTravelers > 0 && (
                  <div
                    className={`flex-1 rounded-lg border-2 bg-[#0a0a14] px-1 py-1.5 text-center transition-[border-color] duration-200 ${travelersComplete ? "border-[#4a3a20]" : "border-subtle"}`}
                  >
                    <div
                      className={`font-mono text-lg leading-none ${travelersComplete ? "text-gold" : "text-[#333]"}`}
                    >
                      {selectedTravelerIds.length}
                    </div>
                    <div className="text-3xs my-0.5 font-mono text-[#333]">/ {neededTravelers}</div>
                    <div className="font-body text-dim text-3xs">Travelers</div>
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

            {/* Character selection */}
            <div className="flex flex-col gap-3">
              <div className="font-display text-gold text-2xs tracking-[0.08em] uppercase">Choose Characters</div>

              {TEAM_ORDER.map((team) => {
                let chars = scriptChars.filter((c) => c.team === team);
                const needed = req[team];
                const have = gameCounts[team];
                const isFull = have >= needed;
                const c = TEAM_COLORS[team];
                if (chars.length === 0) return null;
                chars = chars.sort((a, b) => a.name.localeCompare(b.name));

                return (
                  <div key={team}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <div className="font-display text-xs tracking-[0.06em] uppercase" style={{ color: c.text }}>
                        {TEAM_LABEL[team]}
                      </div>
                      <div
                        className="text-2xs rounded-[8px] bg-[#0a0a14] px-1.5 py-0.25 font-mono"
                        style={{
                          color: isFull ? c.text : "#555",
                          border: `1px solid ${isFull ? c.border : "#2a2a3a"}`
                        }}
                      >
                        {have} / {needed}
                      </div>
                      {needed === 0 && <div className="font-body text-dimmer text-2xs">(not needed)</div>}
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {chars.map((char) => {
                        const inGame = gameIds.includes(char.id);
                        const blocked = !inGame && isFull;
                        const countersInGame = (char.counters ?? []).filter((id) => gameIds.includes(id)).length;
                        const synergiesInGame = allInteractions.filter(
                          (i: Interaction) =>
                            i.type === "synergy" &&
                            ((i.a === char.id && gameIds.includes(i.b)) || (i.b === char.id && gameIds.includes(i.a)))
                        );
                        const eff = calculateEffectiveStrength(char.id, gameIds, allCharacters);
                        const s = eff.effectiveStrength;
                        const barColor = s > 30 ? "#2a7fd4" : s > 0 ? "#5b9bd5" : s > -30 ? "#c0392b" : "#8b1a1a";

                        return (
                          <div
                            key={char.id}
                            className="flex overflow-hidden rounded-[8px] border-2 transition-all duration-100"
                            style={{
                              border: `2px solid ${inGame ? c.border : synergiesInGame.length > 0 ? "#2a4a20" : "#2a2a3a"}`,
                              opacity: blocked ? 0.3 : 1,
                              minWidth: "240px"
                            }}
                          >
                            <div
                              className="flex flex-1 gap-2 border-none px-2.5 py-2"
                              style={{
                                background: inGame ? c.bg : synergiesInGame.length > 0 ? "#0d1a0d" : "#14141f"
                              }}
                            >
                              <CharacterIcon
                                characterId={char.id}
                                edition={char.edition}
                                team={char.team}
                                alt={char.name}
                                variant="token"
                                className="size-12 shrink-0"
                              />
                              <button
                                onClick={() => onDetail(char.id)}
                                className="font-display flex flex-1 cursor-pointer flex-col gap-1.5 border-none p-0 text-sm"
                                style={{
                                  background: "transparent",
                                  color: inGame ? c.text : "#666"
                                }}
                              >
                                <span className="font-display text-base leading-tight font-bold">{char.name}</span>
                                <div className="h-1 w-full overflow-hidden rounded-xs bg-[#0a0a14]">
                                  <div
                                    className="h-full rounded-xs"
                                    style={{
                                      width: `${(Math.abs(s) / 100) * 100}%`,
                                      background: barColor
                                    }}
                                  />
                                </div>
                                <div className="text-2xs flex gap-1">
                                  <span style={{ color: barColor }} className="font-mono">
                                    {s > 0 ? "+" : ""}
                                    {s}
                                  </span>
                                  {countersInGame > 0 && <span>⚔{countersInGame}</span>}
                                  {synergiesInGame.length > 0 && !inGame && <span>✦{synergiesInGame.length}</span>}
                                </div>
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                if (!blocked) onToggleGameChar(char.id);
                              }}
                              disabled={blocked}
                              className="font-display border-none px-4 py-3 text-3xl font-bold"
                              style={{
                                background: inGame ? c.bg : synergiesInGame.length > 0 ? "#0d1a0d" : "#14141f",
                                color: inGame ? c.text : synergiesInGame.length > 0 ? "#4a9a4a" : "#888",
                                cursor: blocked ? "default" : "pointer",
                                minWidth: "60px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
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
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="font-display text-gold text-2xs tracking-[0.08em] uppercase">Travelers</div>
                  <div
                    className={`text-2xs rounded-[8px] bg-[#0a0a14] px-1.5 py-0.25 font-mono ${travelersComplete ? "text-gold border border-[#4a3a20]" : "text-dim border-subtle border"}`}
                  >
                    {selectedTravelerIds.length} / {neededTravelers}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {editionTravelers.map((traveler) => {
                    const inGame = gameIds.includes(traveler.id);
                    const blocked = !inGame && travelersComplete;
                    return (
                      <div
                        key={traveler.id}
                        className={`flex overflow-hidden rounded-[8px] border-2 transition-all duration-100 ${inGame ? "border-[#4a3a20]" : "border-subtle"} ${blocked ? "opacity-30" : "opacity-100"}`}
                        style={{ minWidth: "240px" }}
                      >
                        <div
                          className="flex flex-1 gap-2 border-none px-2.5 py-2"
                          style={{
                            background: inGame ? "#1a1500" : "#14141f"
                          }}
                        >
                          <CharacterIcon
                            characterId={traveler.id}
                            edition={traveler.edition}
                            team={traveler.team}
                            alt={traveler.name}
                            variant="token"
                            className="size-12 shrink-0"
                          />
                          <button
                            onClick={() => onDetail(traveler.id)}
                            className="font-display flex flex-1 cursor-pointer flex-col border-none p-0 text-sm"
                            style={{
                              background: "transparent",
                              color: inGame ? "#d4a832" : "#666"
                            }}
                          >
                            <span className="font-display text-base font-bold">{traveler.name}</span>
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            if (!blocked) onToggleGameChar(traveler.id);
                          }}
                          disabled={blocked}
                          className="font-display border-none px-4 py-3 text-3xl font-bold"
                          style={{
                            background: inGame ? "#1a1500" : "#14141f",
                            color: inGame ? "#d4a832" : "#888",
                            cursor: blocked ? "default" : "pointer",
                            minWidth: "60px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {inGame ? "−" : "+"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {!playerCount && (
          <div className="text-dimmer font-body text-md py-7.5 text-center">
            Choose a player count above to begin selecting characters.
          </div>
        )}
      </div>

      {/* ── Right: live analysis sidebar ── */}
      <div className="bg-surface border-subtle sticky top-4 max-h-[calc(100vh-100px)] overflow-y-auto rounded-[10px] border p-4">
        <SectionLabel className="mb-4">Live Analysis</SectionLabel>
        <AnalysisSidebar gameIds={gameIds} allCharacters={allCharacters} />
      </div>
    </div>
  );
}
