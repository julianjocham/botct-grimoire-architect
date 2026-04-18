"use client";

import { useMemo } from "react";
import { Character, AnalysisSidebarProps } from "@/types";
import { allInteractions } from "@/lib/data";
import { FEEL_BARS, FEEL_COLOR } from "@/constants/info";
import { TEAM_COLORS } from "@/constants/team";
import { analyzeScript } from "@/lib/engine";
import { calculateEffectiveStrength } from "@/lib/strength/calculate";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CharacterIcon } from "@/components/ui/CharacterIcon";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/contexts/LanguageContext";

type HintStyle = {
  border: string;
  bg: string;
  borderClass: string;
  bgClass: string;
};

function hintStyle(isJinx: boolean, severity: string): HintStyle {
  if (isJinx) {
    return {
      border: "var(--jinx)",
      bg: "var(--jinx-bg)",
      borderClass: "border-jinx",
      bgClass: "bg-jinx-bg"
    };
  }
  if (severity === "critical") {
    return {
      border: "var(--severity-critical)",
      bg: "var(--severity-critical-bg)",
      borderClass: "border-severity-critical",
      bgClass: "bg-severity-critical-bg"
    };
  }
  return {
    border: "var(--severity-important)",
    bg: "var(--severity-important-bg)",
    borderClass: "border-severity-important",
    bgClass: "bg-severity-important-bg"
  };
}

function strengthBarColor(s: number): string {
  if (s > 30) return "var(--strength-good)";
  if (s > 0) return "var(--strength-good-light)";
  if (s > -30) return "var(--strength-evil-strong)";
  return "var(--blood-red)";
}

export function AnalysisSidebar({ gameIds, allCharacters }: AnalysisSidebarProps) {
  const { t } = useTranslation();
  const analysis = useMemo(
    () => analyzeScript(gameIds, allCharacters, allInteractions, "game"),
    [gameIds, allCharacters]
  );

  const { goodStrengthTotal: good, evilStrengthTotal: evil } = analysis;
  const maxAbs = Math.max(Math.abs(good), Math.abs(evil), 1);
  const keyHints = analysis.interactionHints.filter((h) => h.severity !== "tip" || h.category === "jinx");

  if (gameIds.length === 0) {
    return (
      <div className="font-body text-muted px-4 py-10 text-center text-base">{t("analysisSidebar.empty")}</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TeamStrengthSection good={good} evil={evil} maxAbs={maxAbs} />

      {gameIds.length >= 3 && <GameFeelSection analysis={analysis} />}

      {keyHints.length > 0 && (
        <div>
          <SectionLabel className="mb-2">
            {t("analysisSidebar.interactions", { count: keyHints.length })}
          </SectionLabel>
          <div className="flex flex-col gap-1.5">
            {keyHints.map((hint, i) => {
              const isJinx = hint.category === "jinx";
              const involvedChars = hint.involvedCharacters
                .map((id) => allCharacters.find((c) => c.id === id))
                .filter(Boolean) as Character[];
              const st = hintStyle(isJinx, hint.severity);
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-md border px-2.5 py-2",
                    st.borderClass,
                    st.bgClass,
                    isJinx ? "border-dashed" : "border-solid"
                  )}
                >
                  <div className="mb-1 flex flex-wrap items-center gap-1.25">
                    {isJinx && (
                      <span className="font-display text-gold text-3xs border-jinx bg-jinx-bg-strong shrink-0 rounded-[3px] border px-1 py-px">
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

      {analysis.compositionWarnings.length > 0 && (
        <div>
          <SectionLabel className="mb-2">{t("analysisSidebar.issues")}</SectionLabel>
          <div className="flex flex-col gap-1.25">
            {analysis.compositionWarnings.map((w, i) => (
              <div
                key={i}
                className={cn(
                  "font-body text-parchment-muted rounded-[5px] border px-2 py-1.5 text-sm leading-normal",
                  w.severity === "critical" && "border-severity-critical bg-severity-critical-bg",
                  w.severity === "important" && "border-severity-important bg-severity-important-bg",
                  w.severity === "tip" && "border-severity-tip bg-severity-tip-bg"
                )}
              >
                {w.severity === "critical" ? "⚠" : w.severity === "important" ? "⚡" : "💡"} {w.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {gameIds.length > 0 && <CharacterStrengthList gameIds={gameIds} allCharacters={allCharacters} />}
    </div>
  );
}

function TeamStrengthSection({ good, evil, maxAbs }: { good: number; evil: number; maxAbs: number }) {
  const { t } = useTranslation();
  return (
    <div>
      <SectionLabel className="mb-2.5">{t("analysisSidebar.teamStrength")}</SectionLabel>
      <div className="flex flex-col gap-2">
        {[
          { labelKey: "analysisSidebar.good", value: good, color: "var(--strength-good)" },
          { labelKey: "analysisSidebar.evil", value: evil, color: "var(--strength-evil-strong)" }
        ].map(({ labelKey, value, color }) => (
          <div key={labelKey}>
            <div className="mb-0.75 flex justify-between">
              <span className="text-3xs font-mono uppercase" style={{ color }}>
                {t(labelKey)}
              </span>
              <span className="text-2xs font-mono" style={{ color }}>
                {value > 0 ? "+" : ""}
                {value}
              </span>
            </div>
            <div className="bg-panel-dark h-1.5 overflow-hidden rounded-[3px]">
              <div
                className="h-full rounded-[3px]"
                style={{ width: `${(Math.abs(value) / maxAbs) * 100}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GameFeelSection({ analysis }: { analysis: ReturnType<typeof analyzeScript> }) {
  const { t } = useTranslation();
  return (
    <div>
      <SectionLabel className="mb-2.5">{t("analysisSidebar.gameFeel")}</SectionLabel>
      <div className="flex flex-col gap-1.75">
        {FEEL_BARS.map(({ key, levels }) => {
          const val = analysis.scriptFeel[key] as string;
          const idx = levels.indexOf(val);
          const color = FEEL_COLOR[val] ?? "var(--gold)";
          return (
            <div key={key}>
              <div className="mb-0.5 flex justify-between">
                <span className="text-dim text-3xs font-mono uppercase">{t(`feelLabels.${key}`)}</span>
                <span className="font-display text-3xs" style={{ color }}>
                  {val}
                </span>
              </div>
              <div className="flex gap-0.5">
                {levels.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.25 flex-1 rounded-xs"
                    style={{ background: i <= idx ? color : "var(--border-subtle)" }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CharacterStrengthList({ gameIds, allCharacters }: { gameIds: string[]; allCharacters: Character[] }) {
  const { t } = useTranslation();
  const entries = gameIds
    .map((id) => {
      const char = allCharacters.find((c) => c.id === id);
      if (!char) return null;
      const eff = calculateEffectiveStrength(id, gameIds, allCharacters);
      return { char, eff };
    })
    .filter(Boolean)
    .sort((a, b) => Math.abs(b!.eff.effectiveStrength) - Math.abs(a!.eff.effectiveStrength));

  return (
    <div>
      <SectionLabel className="mb-2">{t("analysisSidebar.characterStrengths")}</SectionLabel>
      <div className="flex flex-col gap-1">
        {entries.map((entry) => {
          if (!entry) return null;
          const { char, eff } = entry;
          const col = TEAM_COLORS[char.team];
          const s = eff.effectiveStrength;
          const barColor = strengthBarColor(s);
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
              <div className="font-display text-2xs min-w-[5.5rem] shrink-0 truncate" style={{ color: col.text }}>
                {char.name}
              </div>
              <div className="bg-panel-dark h-1 flex-1 overflow-hidden rounded-xs">
                <div
                  className="h-full rounded-xs"
                  style={{ width: `${(Math.abs(s) / 100) * 100}%`, background: barColor }}
                />
              </div>
              <div className="text-3xs min-w-7 shrink-0 text-right font-mono" style={{ color: barColor }}>
                {s > 0 ? "+" : ""}
                {s}
              </div>
              {eff.modifier !== 0 && (
                <div
                  className={cn(
                    "text-3xs shrink-0 font-mono",
                    eff.modifier > 0 ? "text-good-blue" : "text-blood-light"
                  )}
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
  );
}
