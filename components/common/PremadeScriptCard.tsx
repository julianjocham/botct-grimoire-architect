"use client";

import { Character, PremadeScript } from "@/types";
import { TEAM_COLORS, TEAM_LABEL, TEAM_ORDER } from "@/constants/team";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/contexts/LanguageContext";

interface PremadeScriptCardProps {
  script: PremadeScript;
  allCharacters: Character[];
  isSelected: boolean;
  onSelect: () => void;
}

export function PremadeScriptCard({ script, allCharacters, isSelected, onSelect }: PremadeScriptCardProps) {
  const { t } = useTranslation();
  const chars = allCharacters.filter((c) => script.characters.includes(c.id));
  const counts = {
    townsfolk: chars.filter((c) => c.team === "townsfolk").length,
    outsider: chars.filter((c) => c.team === "outsider").length,
    minion: chars.filter((c) => c.team === "minion").length,
    demon: chars.filter((c) => c.team === "demon").length
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "cursor-pointer rounded-xl border-2 p-4 transition-all duration-150 ease-[ease] sm:px-4.5 sm:py-4",
        isSelected ? "border-blood bg-severity-critical-bg" : "bg-surface border-subtle"
      )}
    >
      <div className={cn("font-display text-base tracking-[0.04em]", isSelected ? "text-parchment" : "text-gold")}>
        {script.name}
      </div>
      {script.author && <div className="font-body text-dim mt-0.5 mb-2.5 text-xs">{script.author}</div>}
      <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1">
        {TEAM_ORDER.map((team) => {
          const n = counts[team as keyof typeof counts];
          if (!n) return null;
          const c = TEAM_COLORS[team];
          return (
            <div key={team} className="font-mono text-xs" style={{ color: c.text }}>
              {n} {TEAM_LABEL[team]}
            </div>
          );
        })}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={cn(
          "font-display w-full cursor-pointer rounded-md border-none py-1.5 text-xs tracking-[0.05em] transition-all duration-150 ease-[ease]",
          isSelected ? "bg-blood text-parchment" : "bg-subtle text-muted"
        )}
      >
        {isSelected ? t("premadeScriptCard.selected") : t("premadeScriptCard.selectScript")}
      </button>
    </div>
  );
}
