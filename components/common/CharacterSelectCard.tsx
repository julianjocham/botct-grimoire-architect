"use client";

import { Character, Interaction } from "@/types";
import { TEAM_COLORS } from "@/constants/team";
import { allInteractions } from "@/lib/data";
import { calculateEffectiveStrength } from "@/lib/strength/calculate";
import { CharacterIcon } from "@/components/ui/CharacterIcon";
import { cn } from "@/lib/cn";

const GAP_LABELS: Record<string, string> = {
  "info-start": "first-night info",
  "info-recurring": "recurring info",
  "once-per-game": "once-per-game power",
  "protection": "protection",
  "day-ability": "day ability",
  "info-disruption": "disruption",
  "demon-resilience": "demon resilience"
};

interface CharacterSelectCardProps {
  character: Character;
  gameIds: string[];
  allCharacters: Character[];
  isBlocked: boolean;
  onDetail: (id: string) => void;
  onToggle: (id: string) => void;
  /** Pass a custom accent color override (e.g. for travelers using gold). */
  accentColor?: { bg: string; border: string; text: string };
  missingGoodCats?: Set<string>;
  missingEvilCats?: Set<string>;
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
  const gapFillLabel = isGapFill && cat ? GAP_LABELS[cat] : null;

  const isHighlighted = hasSynergy || isGapFill;
  const eff = calculateEffectiveStrength(character.id, gameIds, allCharacters);
  const s = eff.effectiveStrength;
  const barColor = s > 30 ? "#2a7fd4" : s > 0 ? "#5b9bd5" : s > -30 ? "#c0392b" : "#8b1a1a";

  const cardBg = inGame ? colors.bg : isHighlighted ? "#0d1a0d" : "#14141f";
  const borderColor = inGame ? colors.border : isHighlighted ? "#2a4a20" : "#2a2a3a";

  return (
    <div
      className={cn("flex rounded-[8px] border-2 transition-all duration-100", isBlocked && "opacity-30")}
      style={{ border: `2px solid ${borderColor}`, minWidth: "240px" }}
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
          className="font-display flex flex-1 cursor-pointer flex-col gap-1.5 border-none p-0 text-sm"
          style={{ background: "transparent", color: inGame ? colors.text : "#666" }}
        >
          <span className="font-display text-base leading-tight font-bold">{character.name}</span>
          {s !== undefined && (
            <>
              <div className="h-1 w-full overflow-hidden rounded-xs bg-[#0a0a14]">
                <div
                  className="h-full rounded-xs"
                  style={{ width: `${(Math.abs(s) / 100) * 100}%`, background: barColor }}
                />
              </div>
              <div className="text-2xs flex gap-1">
                <span style={{ color: barColor }} className="font-mono">
                  {s > 0 ? "+" : ""}
                  {s}
                </span>
                {countersInGame > 0 && <span>⚔{countersInGame}</span>}
                {hasSynergy && (
                  <span className="group relative cursor-default text-[#4a9a4a]">
                    ✦ {notableSynergies.length === 1 ? "synergy" : "synergies"}
                    <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-1.5 hidden w-56 rounded-md border border-[#2a4a20] bg-[#0d1a0d] px-2.5 py-2 shadow-lg group-hover:block">
                      {notableSynergies.map((syn, idx) => (
                        <div
                          key={idx}
                          className={cn("text-left", idx > 0 && "mt-1.5 border-t border-[#1a3a1a] pt-1.5")}
                        >
                          <div className="font-display text-xs font-bold text-[#4a9a4a]">{syn.title}</div>
                          <div className="font-body mt-0.5 text-xs leading-snug text-[#8ab88a]">{syn.description}</div>
                        </div>
                      ))}
                    </div>
                  </span>
                )}
                {gapFillLabel && <span className="text-[#4a9a4a]">◈ {gapFillLabel}</span>}
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
        className="font-display rounded-r-[6px] border-none px-4 py-3 text-3xl font-bold"
        style={{
          background: cardBg,
          color: inGame ? colors.text : isHighlighted ? "#4a9a4a" : "#888",
          cursor: isBlocked ? "default" : "pointer",
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
}
