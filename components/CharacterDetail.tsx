"use client";

import { Character } from "@/lib/types";
import { StrengthBar } from "./StrengthBar";
import { CharacterDetailProps } from "@/components/types";
import { COMPLEXITY_LABEL } from "@/constants/character";

function SubDimBar({
  label,
  value,
  min,
  max,
  color,
  suffix = "",
  tooltip
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  color: string;
  suffix?: string;
  tooltip: string;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div title={tooltip}>
      <div className="mb-0.5 flex justify-between">
        <span className="text-dim font-mono text-[9px] tracking-[0.05em] uppercase">{label}</span>
        <span className="font-mono text-[9px]" style={{ color }}>
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-[3px] overflow-hidden rounded-[2px] bg-[#1a1a2a]">
        <div className="h-full rounded-[2px]" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

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
    <div className="border-subtle fixed top-0 right-0 bottom-0 z-[100] flex w-[340px] flex-col overflow-y-auto border border-r-0 bg-[#0f0f1a]">
      {/* Header */}
      <div className="border-subtle flex items-start justify-between gap-[10px] border-b px-4 py-[14px]">
        <div>
          <div className="font-display text-parchment mb-0.5 text-[15px]">{character.name}</div>
          <div className="font-body text-muted text-[12px] capitalize">
            {character.team} · {character.edition?.toUpperCase() || "Experimental"} · ST Complexity:{" "}
            {COMPLEXITY_LABEL[character.stComplexity ?? 2]}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted shrink-0 cursor-pointer border-none bg-transparent text-[18px] leading-none"
        >
          ×
        </button>
      </div>

      <div className="flex flex-col gap-[14px] px-4 py-3">
        {/* Ability text */}
        <div>
          <div className="text-muted mb-1 font-mono text-[10px] tracking-[0.08em] uppercase">Ability</div>
          <div className="font-body text-parchment-muted bg-surface border-subtle rounded-[6px] border px-[10px] py-2 text-[13px] leading-[1.6] italic">
            &ldquo;{character.ability}&rdquo;
          </div>
        </div>

        {/* Strength */}
        {character.strength?.composite !== undefined && (
          <div>
            <div className="text-muted mb-[6px] font-mono text-[10px] tracking-[0.08em] uppercase">Strength</div>
            <StrengthBar value={baseStrength} effectiveValue={eff} />
            {modifier !== 0 && (
              <div
                className={["mt-1 font-mono text-[10px]", eff < 0 ? "text-blood-light" : "text-good-blue"].join(" ")}
              >
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
              <div className="mt-[10px] flex flex-col gap-[5px]">
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
                  <div className="text-dim flex justify-between font-mono text-[9px]">
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
              <div className="mt-2 flex flex-col gap-[6px]">
                {reasons.map((r) => {
                  const char = allCharacters.find((c) => c.id === r.characterId);
                  return (
                    <div
                      key={r.characterId}
                      className={[
                        "rounded-[5px] px-2 py-[6px]",
                        r.impact < 0 ? "border border-[#3a1a1a] bg-[#150808]" : "border border-[#1a2a3a] bg-[#080d15]"
                      ].join(" ")}
                    >
                      <div className={["flex items-center justify-between", r.description ? "mb-1" : ""].join(" ")}>
                        <button
                          onClick={() => onNavigate(r.characterId)}
                          className="text-gold font-display cursor-pointer border-none bg-transparent p-0 text-left text-[11px]"
                        >
                          {char?.name ?? r.characterId}
                        </button>
                        <span
                          className={[
                            "ml-2 shrink-0 font-mono text-[11px]",
                            r.impact < 0 ? "text-blood-light" : "text-good-blue"
                          ].join(" ")}
                        >
                          {r.impact > 0 ? "+" : ""}
                          {r.impact}
                        </span>
                      </div>
                      {r.description && (
                        <div className="font-body text-[12px] leading-[1.45] text-[#888]">{r.description}</div>
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
            <div className="text-muted mb-1 font-mono text-[10px] tracking-[0.08em] uppercase">ST Advice</div>
            <div className="font-body text-parchment-muted text-[13px] leading-[1.6]">{character.stAdvice}</div>
          </div>
        )}

        {/* New ST Warning */}
        {character.newStWarning && (
          <div className="rounded-[6px] border border-[#5a3000] bg-[#1a0a00] px-[10px] py-2">
            <div className="text-amber mb-1 font-mono text-[10px] tracking-[0.08em] uppercase">⚠ New ST Warning</div>
            <div className="font-body text-[12px] leading-[1.5] text-[#c8a050]">{character.newStWarning}</div>
          </div>
        )}

        {/* Official ST Reminder */}
        {(character.firstNightReminder || character.otherNightReminder) && (
          <div>
            <div className="text-muted mb-1 font-mono text-[10px] tracking-[0.08em] uppercase">Official Reminders</div>
            <div className="flex flex-col gap-1">
              {character.firstNightReminder && (
                <div className="font-body text-[12px] leading-[1.4] text-[#888]">
                  <span className="text-dim">1st: </span>
                  {character.firstNightReminder}
                </div>
              )}
              {character.otherNightReminder && (
                <div className="font-body text-[12px] leading-[1.4] text-[#888]">
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
            <div className="text-blood-light mb-[6px] font-mono text-[10px] tracking-[0.08em] uppercase">
              ⚔ Counters on this script
            </div>
            <div className="flex flex-col gap-[6px]">
              {countersOnScript.map((counter) => (
                <div key={counter.id} className="rounded-[6px] border border-[#4a1a1a] bg-[#1a0808] px-[10px] py-[6px]">
                  <button
                    onClick={() => onNavigate(counter.id)}
                    className="text-minion font-display mb-0.5 cursor-pointer border-none bg-transparent p-0 text-[12px]"
                  >
                    {counter.name}
                  </button>
                  {character.counterDetail[counter.id] && (
                    <div className="font-body text-[12px] leading-[1.4] text-[#888]">
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
            <div className="text-muted mb-1 font-mono text-[10px] tracking-[0.08em] uppercase">Bluff Advice</div>
            <div className="font-body text-parchment-muted text-[13px] leading-[1.5]">{character.bluffAdvice}</div>
          </div>
        )}

        {/* Add/Remove button */}
        <button
          onClick={() => onToggle(character.id)}
          className={[
            "text-parchment font-display cursor-pointer rounded-[6px] border-none p-[10px] text-[12px] tracking-[0.05em]",
            isSelected ? "bg-blood" : "bg-[#1a3a6a]"
          ].join(" ")}
        >
          {isSelected ? "Remove from Script" : "Add to Script"}
        </button>
      </div>
    </div>
  );
}
