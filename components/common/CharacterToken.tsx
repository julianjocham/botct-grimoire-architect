"use client";

import { CharacterTokenProps } from "@/types";
import { StrengthBar } from "./StrengthBar";
import { TEAM_COLORS } from "@/constants/team";
import { CharacterIcon } from "@/components/ui/CharacterIcon";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/contexts/LanguageContext";

const COMPLEXITY_DOTS = (n: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className="mr-px inline-block size-1 rounded-full"
      style={{ background: i < n ? "var(--gold)" : "var(--border-subtle)" }}
    />
  ));

export function CharacterToken({
  character,
  selected = false,
  onToggle,
  onDetail,
  effectiveStrength,
  compact = false,
  countersOnScript = 0
}: CharacterTokenProps) {
  const { t } = useTranslation();
  const colors = TEAM_COLORS[character.team] ?? TEAM_COLORS.townsfolk;
  const hasEnrichment = !!character.stAdvice;

  return (
    <div
      className={cn(
        "cursor-pointer rounded-lg border transition-all duration-150",
        compact ? "px-2 py-1.5" : "px-2.5 py-2",
        !hasEnrichment && "opacity-70"
      )}
      style={{
        background: selected ? colors.bg : "var(--bg-surface)",
        borderColor: selected ? colors.border : "var(--border-subtle)"
      }}
      onClick={() => onDetail(character.id)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <CharacterIcon
            characterId={character.id}
            edition={character.edition}
            team={character.team}
            alt={character.name}
            variant="token"
            className={cn("shrink-0", compact ? "size-7" : "size-8")}
          />
          <div className="min-w-0">
            <div
              className={cn("font-display truncate", compact ? "text-xs" : "text-sm")}
              style={{ color: colors.text }}
            >
              {character.name}
            </div>
            {!compact && <div className="mt-0.5">{COMPLEXITY_DOTS(character.stComplexity ?? 2)}</div>}
          </div>
        </div>

        {countersOnScript > 0 && (
          <span
            title={t("characterToken.countersTitle", {
              n: countersOnScript,
              s: countersOnScript !== 1 ? "s" : ""
            })}
            className="text-gold text-3xs bg-gold-accent-bg border-gold-accent-border shrink-0 rounded-[3px] border px-1 py-px font-mono"
          >
            ⚔ {countersOnScript}
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(character.id);
          }}
          className={cn(
            "text-md flex size-5.5 shrink-0 cursor-pointer items-center justify-center rounded border-none",
            selected ? "text-white" : "text-muted"
          )}
          style={{ background: selected ? colors.border : "var(--border-subtle)" }}
          title={selected ? t("characterToken.removeFromScript") : t("characterToken.addToScript")}
        >
          {selected ? "−" : "+"}
        </button>
      </div>

      {!compact && character.strength?.composite !== undefined && (
        <div className="mt-1.5">
          <StrengthBar value={character.strength.composite} effectiveValue={effectiveStrength} small />
        </div>
      )}
    </div>
  );
}
