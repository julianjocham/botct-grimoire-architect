"use client";

import { ScriptHealthBarProps } from "@/types";
import { CAT_SHORT, EVIL_CATEGORIES, GOOD_CATEGORIES } from "@/constants/info";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/contexts/LanguageContext";
import { GameFeelRosterPanel } from "@/components/common/GameFeelRosterPanel";

export function ScriptHealthBar({ analysis }: ScriptHealthBarProps) {
  const { t } = useTranslation();
  const { scriptFeel, nightComplexity, interactionHints, compositionWarnings, goodStrengthTotal, evilStrengthTotal } =
    analysis;
  const criticalCount = interactionHints.filter((h) => h.severity === "critical").length;
  const warnCount = compositionWarnings.filter((w) => w.severity !== "tip").length;

  return (
    <div className="bg-surface border-subtle flex flex-wrap items-center gap-4 rounded-[10px] border px-4 py-3 sm:gap-6 sm:px-5">
      <GameFeelRosterPanel feel={scriptFeel} variant="healthStrip" />

      <div className="bg-subtle hidden h-9 w-px shrink-0 sm:block" />

      {/* Night complexity */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-muted font-mono text-xs tracking-widest uppercase">{t("healthBar.night")}</span>
        <span className="font-display text-gold text-sm">{nightComplexity.complexityRating}</span>
        <span
          className="text-dim font-mono text-xs"
          title={t("healthBar.nightTitle", {
            first: nightComplexity.firstNightSteps,
            other: nightComplexity.otherNightSteps
          })}
        >
          {nightComplexity.firstNightSteps}↓ {nightComplexity.otherNightSteps}↻
        </span>
      </div>

      <div className="bg-subtle hidden h-9 w-px shrink-0 sm:block" />

      {/* Strength totals */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-good-blue font-mono text-xs uppercase">{t("healthBar.good")}</span>
          <span className="text-good-blue font-mono text-sm">
            {goodStrengthTotal > 0 ? "+" : ""}
            {goodStrengthTotal}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blood-light font-mono text-xs uppercase">{t("healthBar.evil")}</span>
          <span className="text-blood-light font-mono text-sm">{evilStrengthTotal}</span>
        </div>
      </div>

      <div className="bg-subtle hidden h-9 w-px shrink-0 sm:block" />

      {/* Warnings badges */}
      <div className="flex gap-1.5">
        {criticalCount > 0 && (
          <span className="bg-blood text-parchment font-display rounded-[10px] px-2.5 py-1 text-sm">
            {t("healthBar.critical", { n: criticalCount })}
          </span>
        )}
        {warnCount > 0 && (
          <span className="text-parchment border-severity-important bg-severity-important-bg font-display rounded-[10px] border px-2.5 py-1 text-sm">
            ⚡ {t("healthBar.warnings", { n: warnCount })}
          </span>
        )}
        {criticalCount === 0 && warnCount === 0 && (
          <span className="text-dim font-body text-sm">{t("healthBar.noCritical")}</span>
        )}
      </div>

      {/* Category coverage */}
      <div className="flex flex-wrap gap-1.5">
        {GOOD_CATEGORIES.map((cat) => {
          const present = !!analysis.categoryCoverage.good[cat];
          return (
            <span
              key={cat}
              title={present ? (analysis.categoryCoverage.good[cat] ?? []).join(", ") : `Missing: ${cat}`}
              className={cn(
                "cursor-default rounded-[3px] border px-1.5 py-1 font-mono text-xs",
                present ? "border-tip text-good-indicator bg-severity-tip-bg" : "text-muted border-subtle bg-panel-dark"
              )}
            >
              {present ? "✓" : "✗"} {CAT_SHORT[cat] ?? cat}
            </span>
          );
        })}
        {EVIL_CATEGORIES.map((cat) => {
          const present = !!analysis.categoryCoverage.evil[cat];
          return (
            <span
              key={cat}
              title={present ? (analysis.categoryCoverage.evil[cat] ?? []).join(", ") : `Missing: ${cat}`}
              className={cn(
                "cursor-default rounded-[3px] border px-1.5 py-1 font-mono text-xs",
                present
                  ? "border-minion-border bg-severity-critical-bg text-minion"
                  : "text-muted border-subtle bg-panel-dark"
              )}
            >
              {present ? "✓" : "✗"} {CAT_SHORT[cat] ?? cat}
            </span>
          );
        })}
      </div>
    </div>
  );
}
