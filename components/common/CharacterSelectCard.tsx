"use client";

import { Character, Interaction } from "@/types";
import { TEAM_COLORS } from "@/constants/team";
import { allInteractions } from "@/lib/data";
import { calculateEffectiveStrength } from "@/lib/strength/calculate";
import { CharacterIcon } from "@/components/ui/CharacterIcon";
import { cn } from "@/lib/cn";

interface CharacterSelectCardProps {
  character: Character;
  gameIds: string[];
  allCharacters: Character[];
  isBlocked: boolean;
  onDetail: (id: string) => void;
  onToggle: (id: string) => void;
  /** Pass a custom accent color override (e.g. for travelers using gold). */
  accentColor?: { bg: string; border: string; text: string };
}

export function CharacterSelectCard({
  character,
  gameIds,
  allCharacters,
  isBlocked,
  onDetail,
  onToggle,
  accentColor
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

  const hasSynergy = synergiesInGame.length > 0 && !inGame;
  const eff = calculateEffectiveStrength(character.id, gameIds, allCharacters);
  const s = eff.effectiveStrength;
  const barColor = s > 30 ? "#2a7fd4" : s > 0 ? "#5b9bd5" : s > -30 ? "#c0392b" : "#8b1a1a";

  const cardBg = inGame ? colors.bg : hasSynergy ? "#0d1a0d" : "#14141f";
  const borderColor = inGame ? colors.border : hasSynergy ? "#2a4a20" : "#2a2a3a";

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-[8px] border-2 transition-all duration-100",
        isBlocked && "opacity-30"
      )}
      style={{ border: `2px solid ${borderColor}`, minWidth: "240px" }}
    >
      <div className="flex flex-1 gap-2 border-none px-2.5 py-2" style={{ background: cardBg }}>
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
                {hasSynergy && <span>✦{synergiesInGame.length}</span>}
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
        className="font-display border-none px-4 py-3 text-3xl font-bold"
        style={{
          background: cardBg,
          color: inGame ? colors.text : hasSynergy ? "#4a9a4a" : "#888",
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
