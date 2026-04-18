"use client";

import { Character, Interaction } from "@/types";
import { TEAM_COLORS } from "@/constants/team";
import { allInteractions } from "@/lib/data";
import { calculateEffectiveStrength } from "@/lib/strength/calculate";
import { CharacterIcon } from "@/components/ui/CharacterIcon";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/contexts/LanguageContext";

interface CharacterSelectCardProps {
  character: Character;
  gameIds: string[];
  allCharacters: Character[];
  isBlocked: boolean;
  onDetail: (id: string) => void;
  onToggle: (id: string) => void;
  accentColor?: { bg: string; border: string; text: string };
  missingGoodCats?: Set<string>;
  missingEvilCats?: Set<string>;
}

function strengthBarColor(s: number): string {
  if (s > 30) return "var(--strength-good)";
  if (s > 0) return "var(--strength-good-light)";
  if (s > -30) return "var(--strength-evil-strong)";
  return "var(--blood-red)";
}

export function CharacterSelectCard({
  character,
  gameIds,
  allCharacters,
  isBlocked,
  onDetail,
  onToggle,
  accentColor,
  missingGoodCats,
  missingEvilCats
}: CharacterSelectCardProps) {
  const { t } = useTranslation();
  const inGame = gameIds.includes(character.id);
  const teamColors = TEAM_COLORS[character.team] ?? TEAM_COLORS.townsfolk;
  const colors = accentColor ?? teamColors;

  const countersInGame = (character.counters ?? []).filter((id) => gameIds.includes(id)).length;
  const synergiesInGame = allInteractions.filter(
    (i: Interaction) =>
      i.type === "synergy" &&
      ((i.a === character.id && gameIds.includes(i.b)) || (i.b === character.id && gameIds.includes(i.a)))
  );

  const notableSynergies = synergiesInGame.filter((i) => i.severity === "important" || i.severity === "critical");
  const hasSynergy = notableSynergies.length > 0 && !inGame;

  const isGoodTeam = character.team === "townsfolk" || character.team === "outsider";
  const isEvilTeam = character.team === "minion" || character.team === "demon";
  const cat = character.abilityCategory;
  const isGapFill =
    !inGame &&
    cat != null &&
    ((isGoodTeam && (missingGoodCats?.has(cat) ?? false)) || (isEvilTeam && (missingEvilCats?.has(cat) ?? false)));
  const gapFillLabel = isGapFill && cat ? t(`gapLabels.${cat}`) : null;

  const isHighlighted = hasSynergy || isGapFill;
  const eff = calculateEffectiveStrength(character.id, gameIds, allCharacters);
  const s = eff.effectiveStrength;
  const barColor = strengthBarColor(s);

  const cardBg = inGame ? colors.bg : isHighlighted ? "var(--good-indicator-bg)" : "var(--bg-surface)";
  const borderColor = inGame ? colors.border : isHighlighted ? "var(--good-indicator-border)" : "var(--border-subtle)";

  return (
    <div
      className={cn(
        "flex w-full min-w-0 rounded-[8px] border-2 transition-all duration-100 sm:w-auto sm:min-w-60",
        isBlocked && "opacity-30"
      )}
      style={{ borderColor }}
    >
      <div className="flex flex-1 gap-2 rounded-l-[6px] border-none px-2.5 py-2" style={{ background: cardBg }}>
        <CharacterIcon
          characterId={character.id}
          edition={character.edition}
          team={character.team}
          alt={character.name}
          variant="token"
          className="size-12 shrink-0"
        />
        <button
          onClick={() => onDetail(character.id)}
          className="font-display flex flex-1 cursor-pointer flex-col gap-1.5 border-none bg-transparent p-0 text-left text-sm"
          style={{ color: inGame ? colors.text : "var(--color-dimmer)" }}
        >
          <span className="font-display text-base leading-tight font-bold">{character.name}</span>
          {s !== undefined && (
            <>
              <div className="bg-deep h-1 w-full overflow-hidden rounded-xs">
                <div
                  className="h-full rounded-xs"
                  style={{ width: `${(Math.abs(s) / 100) * 100}%`, background: barColor }}
                />
              </div>
              <div className="text-2xs flex flex-wrap gap-1">
                <span style={{ color: barColor }} className="font-mono">
                  {s > 0 ? "+" : ""}
                  {s}
                </span>
                {countersInGame > 0 && <span>⚔{countersInGame}</span>}
                {hasSynergy && (
                  <span className="group text-good-indicator relative cursor-default">
                    ✦ {notableSynergies.length === 1 ? t("synergy") : t("synergies")}
                    <div className="border-good-indicator-border bg-good-indicator-bg pointer-events-none absolute bottom-full left-0 z-50 mb-1.5 hidden w-56 rounded-md border px-2.5 py-2 shadow-lg group-hover:block">
                      {notableSynergies.map((syn, idx) => (
                        <div
                          key={idx}
                          className={cn("text-left", idx > 0 && "border-good-indicator-border mt-1.5 border-t pt-1.5")}
                        >
                          <div className="font-display text-good-indicator text-xs font-bold">{syn.title}</div>
                          <div className="font-body text-parchment-muted mt-0.5 text-xs leading-snug">
                            {syn.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </span>
                )}
                {gapFillLabel && <span className="text-good-indicator">◈ {gapFillLabel}</span>}
              </div>
            </>
          )}
        </button>
      </div>
      <button
        onClick={() => {
          if (!isBlocked) onToggle(character.id);
        }}
        disabled={isBlocked}
        className={cn(
          "font-display flex w-12 shrink-0 items-center justify-center rounded-r-[6px] border-none px-2 py-3 text-2xl font-bold sm:w-15 sm:text-3xl",
          isBlocked ? "cursor-default" : "cursor-pointer"
        )}
        style={{
          background: cardBg,
          color: inGame ? colors.text : isHighlighted ? "var(--good-indicator)" : "var(--color-muted)"
        }}
      >
        {inGame ? "−" : "+"}
      </button>
    </div>
  );
}
