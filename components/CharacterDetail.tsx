"use client";

import { Character, CharacterDetailProps } from "@/types";
import { SubDimBar } from "./common/SubDimBar";
import { COMPLEXITY_LABEL } from "@/constants/character";
import { StrengthBar } from "@/components/common/StrengthBar";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function CharacterDetail({
  character,
  effectiveStrength,
  allCharacters,
  selectedIds,
  onClose,
  onToggle,
  onNavigate
}: CharacterDetailProps) {
  const isSelected = selectedIds.includes(character.id);
  const { baseStrength, modifier, effectiveStrength: eff, reasons } = effectiveStrength;

  // Fun interactions: characters NOT on script that interact with this one
  const countersOnScript = character.counters
    .map((id) => allCharacters.find((c) => c.id === id))
    .filter((c) => c && selectedIds.includes(c.id)) as Character[];

  return (
    <div className="border-subtle fixed inset-y-0 right-0 z-100 flex w-85 flex-col overflow-y-auto border border-r-0 bg-[#0f0f1a]">
      {/* Header */}
      <div className="border-subtle flex items-start justify-between gap-2.5 border-b px-4 py-3.5">
        <div>
          <div className="font-display text-parchment mb-0.5 text-lg">{character.name}</div>
          <div className="font-body text-muted text-sm capitalize">
            {character.team} · {character.edition?.toUpperCase() || "Experimental"} · ST Complexity:{" "}
            {COMPLEXITY_LABEL[character.stComplexity ?? 2]}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted shrink-0 cursor-pointer border-none bg-transparent text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="flex flex-col gap-3.5 px-4 py-3">
        {/* Ability text */}
        <div>
          <SectionLabel color="muted" mono className="mb-1">
            Ability
          </SectionLabel>
          <div className="font-body text-parchment-muted bg-surface border-subtle rounded-md border px-2.5 py-2 text-base leading-[1.6] italic">
            &ldquo;{character.ability}&rdquo;
          </div>
        </div>

        {/* Strength */}
        {character.strength?.composite !== undefined && (
          <div>
            <SectionLabel color="muted" mono className="mb-1.5">
              Strength
            </SectionLabel>
            <StrengthBar value={baseStrength} effectiveValue={eff} />
            {modifier !== 0 && (
              <div className={["text-2xs mt-1 font-mono", eff < 0 ? "text-blood-light" : "text-good-blue"].join(" ")}>
                Base {baseStrength > 0 ? "+" : ""}
                {baseStrength} → {modifier > 0 ? "+" : ""}
                {modifier} (context) → {eff > 0 ? "+" : ""}
                {eff}
              </div>
            )}
            {/* Sub-dimensions */}
            {(character.strength.peakPower !== undefined ||
              character.strength.reliability !== undefined ||
              character.strength.vulnerability !== undefined) && (
              <div className="mt-2.5 flex flex-col gap-1.25">
                {character.strength.peakPower !== undefined && (
                  <SubDimBar
                    label="Peak Power"
                    value={character.strength.peakPower}
                    min={-20}
                    max={20}
                    color={character.strength.peakPower >= 0 ? "#2a7fd4" : "#c0392b"}
                    tooltip="Maximum impact in the best-case scenario (-20 to +20)"
                  />
                )}
                {character.strength.reliability !== undefined && (
                  <SubDimBar
                    label="Reliability"
                    value={Math.round(character.strength.reliability * 100)}
                    min={0}
                    max={100}
                    color="#b8965a"
                    suffix="%"
                    tooltip="How often the ability works as intended (0–100%)"
                  />
                )}
                {character.strength.vulnerability !== undefined && (
                  <SubDimBar
                    label="Vulnerability"
                    value={Math.round(character.strength.vulnerability * 100)}
                    min={0}
                    max={100}
                    color="#c0392b"
                    suffix="%"
                    tooltip="How exposed to disruption or countering the character is (0–100%)"
                  />
                )}
                {character.strength.scalingBonus !== undefined && character.strength.scalingBonus !== 0 && (
                  <div className="text-dim text-3xs flex justify-between font-mono">
                    <span title="Bonus or penalty in larger games">Scaling</span>
                    <span className={character.strength.scalingBonus > 0 ? "text-good-blue" : "text-blood-light"}>
                      {character.strength.scalingBonus > 0 ? "+" : ""}
                      {character.strength.scalingBonus} large games
                    </span>
                  </div>
                )}
              </div>
            )}
            {reasons.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5">
                {reasons.map((r) => {
                  const char = allCharacters.find((c) => c.id === r.characterId);
                  return (
                    <div
                      key={r.characterId}
                      className={[
                        "rounded-[5px] px-2 py-1.5",
                        r.impact < 0 ? "border border-[#3a1a1a] bg-[#150808]" : "border border-[#1a2a3a] bg-[#080d15]"
                      ].join(" ")}
                    >
                      <div className={["flex items-center justify-between", r.description ? "mb-1" : ""].join(" ")}>
                        <button
                          onClick={() => onNavigate(r.characterId)}
                          className="text-gold font-display cursor-pointer border-none bg-transparent p-0 text-left text-xs"
                        >
                          {char?.name ?? r.characterId}
                        </button>
                        <span
                          className={[
                            "ml-2 shrink-0 font-mono text-xs",
                            r.impact < 0 ? "text-blood-light" : "text-good-blue"
                          ].join(" ")}
                        >
                          {r.impact > 0 ? "+" : ""}
                          {r.impact}
                        </span>
                      </div>
                      {r.description && (
                        <div className="font-body text-sm leading-[1.45] text-[#888]">{r.description}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ST Advice */}
        {character.stAdvice && (
          <div>
            <SectionLabel color="muted" mono className="mb-1">
              ST Advice
            </SectionLabel>
            <div className="font-body text-parchment-muted text-base leading-[1.6]">{character.stAdvice}</div>
          </div>
        )}

        {/* New ST Warning */}
        {character.newStWarning && (
          <div className="rounded-md border border-[#5a3000] bg-[#1a0a00] px-2.5 py-2">
            <SectionLabel color="amber" mono className="mb-1">
              ⚠ New ST Warning
            </SectionLabel>
            <div className="font-body text-sm leading-normal text-[#c8a050]">{character.newStWarning}</div>
          </div>
        )}

        {/* Official ST Reminder */}
        {(character.firstNightReminder || character.otherNightReminder) && (
          <div>
            <SectionLabel color="muted" mono className="mb-1">
              Official Reminders
            </SectionLabel>
            <div className="flex flex-col gap-1">
              {character.firstNightReminder && (
                <div className="font-body text-sm leading-[1.4] text-[#888]">
                  <span className="text-dim">1st: </span>
                  {character.firstNightReminder}
                </div>
              )}
              {character.otherNightReminder && (
                <div className="font-body text-sm leading-[1.4] text-[#888]">
                  <span className="text-dim">Other: </span>
                  {character.otherNightReminder}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Counters on this script */}
        {countersOnScript.length > 0 && (
          <div>
            <SectionLabel color="blood" mono className="mb-1.5">
              ⚔ Counters on this script
            </SectionLabel>
            <div className="flex flex-col gap-1.5">
              {countersOnScript.map((counter) => (
                <div key={counter.id} className="rounded-md border border-[#4a1a1a] bg-[#1a0808] px-2.5 py-1.5">
                  <button
                    onClick={() => onNavigate(counter.id)}
                    className="text-minion font-display mb-0.5 cursor-pointer border-none bg-transparent p-0 text-sm"
                  >
                    {counter.name}
                  </button>
                  {character.counterDetail[counter.id] && (
                    <div className="font-body text-sm leading-[1.4] text-[#888]">
                      {character.counterDetail[counter.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bluff advice */}
        {character.bluffAdvice && (
          <div>
            <SectionLabel color="muted" mono className="mb-1">
              Bluff Advice
            </SectionLabel>
            <div className="font-body text-parchment-muted text-base leading-normal">{character.bluffAdvice}</div>
          </div>
        )}

        {/* Add/Remove button */}
        <button
          onClick={() => onToggle(character.id)}
          className={[
            "text-parchment font-display cursor-pointer rounded-md border-none p-2.5 text-sm tracking-[0.05em]",
            isSelected ? "bg-blood" : "bg-[#1a3a6a]"
          ].join(" ")}
        >
          {isSelected ? "Remove from Script" : "Add to Script"}
        </button>
      </div>
    </div>
  );
}
