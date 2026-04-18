"use client";

import { Character, CharacterDetailProps } from "@/types";
import { SubDimBar } from "./common/SubDimBar";
import { COMPLEXITY_LABEL } from "@/constants/character";
import { StrengthBar } from "@/components/common/StrengthBar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CharacterIcon } from "@/components/ui/CharacterIcon";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/contexts/LanguageContext";

export function CharacterDetail({
  character,
  effectiveStrength,
  allCharacters,
  selectedIds,
  onClose,
  onToggle,
  onNavigate
}: CharacterDetailProps) {
  const { t } = useTranslation();
  const isSelected = selectedIds.includes(character.id);
  const { baseStrength, modifier, effectiveStrength: eff, reasons } = effectiveStrength;

  const countersOnScript = character.counters
    .map((id) => allCharacters.find((c) => c.id === id))
    .filter((c) => c && selectedIds.includes(c.id)) as Character[];

  return (
    <div className="border-subtle bg-modal fixed inset-y-0 right-0 z-100 flex w-full flex-col overflow-y-auto border border-r-0 sm:w-85">
      {/* Header */}
      <div className="border-subtle flex items-start justify-between gap-2.5 border-b px-4 py-3.5">
        <div className="flex items-start gap-3">
          <CharacterIcon
            characterId={character.id}
            edition={character.edition}
            team={character.team}
            alt={character.name}
            variant="token"
            className="size-14 shrink-0"
          />
          <div>
            <div className="font-display text-parchment mb-0.5 text-lg">{character.name}</div>
            <div className="font-body text-muted text-sm capitalize">
              {character.team} · {character.edition?.toUpperCase() || t("characterDetail.experimental")} ·{" "}
              {t("characterDetail.stComplexity")} {COMPLEXITY_LABEL[character.stComplexity ?? 2]}
            </div>
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
            {t("characterDetail.ability")}
          </SectionLabel>
          <div className="font-body text-parchment-muted bg-surface border-subtle rounded-md border px-2.5 py-2 text-base leading-[1.6] italic">
            &ldquo;{character.ability}&rdquo;
          </div>
        </div>

        {/* Strength */}
        {character.strength?.composite !== undefined && (
          <div>
            <SectionLabel color="muted" mono className="mb-1.5">
              {t("characterDetail.strength")}
            </SectionLabel>
            <StrengthBar value={baseStrength} effectiveValue={eff} />
            {modifier !== 0 && (
              <div className={cn("text-2xs mt-1 font-mono", eff < 0 ? "text-blood-light" : "text-good-blue")}>
                {t("characterDetail.strengthContext", {
                  base: (baseStrength > 0 ? "+" : "") + baseStrength,
                  modifier: (modifier > 0 ? "+" : "") + modifier,
                  eff: (eff > 0 ? "+" : "") + eff
                })}
              </div>
            )}
            {(character.strength.peakPower !== undefined ||
              character.strength.reliability !== undefined ||
              character.strength.vulnerability !== undefined) && (
              <div className="mt-2.5 flex flex-col gap-1.25">
                {character.strength.peakPower !== undefined && (
                  <SubDimBar
                    label={t("characterDetail.peakPower")}
                    value={character.strength.peakPower}
                    min={-20}
                    max={20}
                    color={character.strength.peakPower >= 0 ? "var(--strength-good)" : "var(--strength-evil-strong)"}
                    tooltip={t("characterDetail.peakPowerTooltip")}
                  />
                )}
                {character.strength.reliability !== undefined && (
                  <SubDimBar
                    label={t("characterDetail.reliability")}
                    value={Math.round(character.strength.reliability * 100)}
                    min={0}
                    max={100}
                    color="var(--gold)"
                    suffix="%"
                    tooltip={t("characterDetail.reliabilityTooltip")}
                  />
                )}
                {character.strength.vulnerability !== undefined && (
                  <SubDimBar
                    label={t("characterDetail.vulnerability")}
                    value={Math.round(character.strength.vulnerability * 100)}
                    min={0}
                    max={100}
                    color="var(--strength-evil-strong)"
                    suffix="%"
                    tooltip={t("characterDetail.vulnerabilityTooltip")}
                  />
                )}
                {character.strength.scalingBonus !== undefined && character.strength.scalingBonus !== 0 && (
                  <div className="text-dim text-3xs flex justify-between font-mono">
                    <span title={t("characterDetail.scaling")}>{t("characterDetail.scaling")}</span>
                    <span className={character.strength.scalingBonus > 0 ? "text-good-blue" : "text-blood-light"}>
                      {character.strength.scalingBonus > 0 ? "+" : ""}
                      {character.strength.scalingBonus}{" "}
                      {t("characterDetail.scalingLargeGames", { n: "" }).trim()}
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
                      className={cn(
                        "rounded-[5px] border px-2 py-1.5",
                        r.impact < 0 ? "border-demon-border bg-severity-critical-bg" : "border-townsfolk-border bg-deep"
                      )}
                    >
                      <div className={cn("flex items-center justify-between", r.description && "mb-1")}>
                        <button
                          onClick={() => onNavigate(r.characterId)}
                          className="text-gold font-display cursor-pointer border-none bg-transparent p-0 text-left text-xs"
                        >
                          {char?.name ?? r.characterId}
                        </button>
                        <span
                          className={cn(
                            "ml-2 shrink-0 font-mono text-xs",
                            r.impact < 0 ? "text-blood-light" : "text-good-blue"
                          )}
                        >
                          {r.impact > 0 ? "+" : ""}
                          {r.impact}
                        </span>
                      </div>
                      {r.description && (
                        <div className="font-body text-muted text-sm leading-[1.45]">{r.description}</div>
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
              {t("characterDetail.stAdvice")}
            </SectionLabel>
            <div className="font-body text-parchment-muted text-base leading-[1.6]">{character.stAdvice}</div>
          </div>
        )}

        {/* New ST Warning */}
        {character.newStWarning && (
          <div className="border-severity-important bg-severity-important-bg rounded-md border px-2.5 py-2">
            <SectionLabel color="amber" mono className="mb-1">
              {t("characterDetail.newStWarning")}
            </SectionLabel>
            <div className="font-body text-gold-light text-sm leading-normal">{character.newStWarning}</div>
          </div>
        )}

        {/* Official ST Reminder */}
        {(character.firstNightReminder || character.otherNightReminder) && (
          <div>
            <SectionLabel color="muted" mono className="mb-1">
              {t("characterDetail.officialReminders")}
            </SectionLabel>
            <div className="flex flex-col gap-1">
              {character.firstNightReminder && (
                <div className="font-body text-muted text-sm leading-[1.4]">
                  <span className="text-dim">{t("characterDetail.firstNight")}</span>
                  {character.firstNightReminder}
                </div>
              )}
              {character.otherNightReminder && (
                <div className="font-body text-muted text-sm leading-[1.4]">
                  <span className="text-dim">{t("characterDetail.otherNights")}</span>
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
              {t("characterDetail.countersOnScript")}
            </SectionLabel>
            <div className="flex flex-col gap-1.5">
              {countersOnScript.map((counter) => (
                <div
                  key={counter.id}
                  className="border-severity-critical bg-severity-critical-bg rounded-md border px-2.5 py-1.5"
                >
                  <button
                    onClick={() => onNavigate(counter.id)}
                    className="text-minion font-display mb-0.5 flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-sm"
                  >
                    <CharacterIcon
                      characterId={counter.id}
                      edition={counter.edition}
                      team={counter.team}
                      alt={counter.name}
                      variant="token"
                      className="size-5"
                    />
                    {counter.name}
                  </button>
                  {character.counterDetail[counter.id] && (
                    <div className="font-body text-muted text-sm leading-[1.4]">
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
              {t("characterDetail.bluffAdvice")}
            </SectionLabel>
            <div className="font-body text-parchment-muted text-base leading-normal">{character.bluffAdvice}</div>
          </div>
        )}

        {/* Add/Remove button */}
        <button
          onClick={() => onToggle(character.id)}
          className={cn(
            "text-parchment font-display cursor-pointer rounded-md border-none p-2.5 text-sm tracking-wide",
            isSelected ? "bg-blood" : "bg-good-blue"
          )}
        >
          {isSelected ? t("characterDetail.removeFromScript") : t("characterDetail.addToScript")}
        </button>
      </div>
    </div>
  );
}
