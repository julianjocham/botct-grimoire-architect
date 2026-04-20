"use client";

import { useMemo } from "react";
import { Character, AnalysisSidebarProps } from "@/types";
import { allInteractions } from "@/lib/data";
import { TEAM_COLORS } from "@/constants/team";
import { analyzeScript } from "@/lib/engine";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CharacterIcon } from "@/components/ui/CharacterIcon";
import { CharacterRoleStats } from "@/components/common/CharacterRoleStats";
import { GameFeelRosterPanel } from "@/components/common/GameFeelRosterPanel";
import { useTranslation } from "@/contexts/LanguageContext";

export function AnalysisSidebar({ gameIds, allCharacters }: AnalysisSidebarProps) {
  const { t } = useTranslation();
  const analysis = useMemo(
    () => analyzeScript(gameIds, allCharacters, allInteractions, "game"),
    [gameIds, allCharacters]
  );

  if (gameIds.length === 0) {
    return <div className="font-body text-muted px-4 py-10 text-center text-base">{t("analysisSidebar.empty")}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <SectionLabel className="mb-2.5">{t("analysisSidebar.gameFeel")}</SectionLabel>
        <GameFeelRosterPanel feel={analysis.scriptFeel} />
      </div>

      <RosterRoleStatsList gameIds={gameIds} allCharacters={allCharacters} />
    </div>
  );
}

function RosterRoleStatsList({ gameIds, allCharacters }: { gameIds: string[]; allCharacters: Character[] }) {
  const { t } = useTranslation();
  const entries = gameIds.map((id) => allCharacters.find((c) => c.id === id)).filter(Boolean) as Character[];
  entries.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <SectionLabel className="mb-2">{t("analysisSidebar.rosterScores")}</SectionLabel>
      <div className="flex flex-col gap-1.5">
        {entries.map((char) => {
          const col = TEAM_COLORS[char.team];
          return (
            <div key={char.id} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <CharacterIcon
                  characterId={char.id}
                  edition={char.edition}
                  team={char.team}
                  alt={char.name}
                  variant="token"
                  className="size-5 shrink-0"
                />
                <div className="font-display text-2xs min-w-0 flex-1 truncate" style={{ color: col.text }}>
                  {char.name}
                </div>
              </div>
              <CharacterRoleStats variant="inline" character={char} className="text-muted pl-7" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
