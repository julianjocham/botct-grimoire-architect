"use client";

import { ScriptHealthBarProps } from "@/types";
import { FeelBar } from "./common/FeelBar";
import {
  CAT_SHORT,
  CHAOS_LEVEL,
  EVIL_CATEGORIES,
  GOOD_CATEGORIES,
  INFO_LEVEL,
  LETHAL_LEVEL,
  ST_LEVEL
} from "@/constants/info";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/contexts/LanguageContext";

export function ScriptHealthBar({ analysis }: ScriptHealthBarProps) {
  const { t } = useTranslation();
  const { scriptFeel, nightComplexity, interactionHints, compositionWarnings, goodStrengthTotal, evilStrengthTotal } =
    analysis;
  const criticalCount = interactionHints.filter((h) => h.severity === "critical").length;
  const warnCount = compositionWarnings.filter((w) => w.severity !== "tip").length;

  return (
    <div className="bg-surface border-subtle flex flex-wrap items-center gap-3 rounded-[10px] border px-3 py-2.5 sm:gap-5 sm:px-4">
      {/* Script feel bars */}
      <div className="flex items-start gap-3 sm:gap-3.5">
        <FeelBar label={t("healthBar.info")} value={scriptFeel.infoLevel} levelMap={INFO_LEVEL} maxBars={4} />
        <FeelBar label={t("healthBar.lethal")} value={scriptFeel.lethalityLevel} levelMap={LETHAL_LEVEL} maxBars={3} />
        <FeelBar label={t("healthBar.chaos")} value={scriptFeel.chaosLevel} levelMap={CHAOS_LEVEL} maxBars={3} />
        <FeelBar label={t("healthBar.stLoad")} value={scriptFeel.stWorkload} levelMap={ST_LEVEL} maxBars={3} />
      </div>

      <div className="bg-subtle hidden h-7 w-px shrink-0 sm:block" />

      {/* Night complexity */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-muted text-3xs font-mono tracking-widest uppercase">{t("healthBar.night")}</span>
        <span className="font-display text-gold text-xs">{nightComplexity.complexityRating}</span>
        <span
          className="text-dim text-3xs font-mono"
          title={t("healthBar.nightTitle", {
            first: nightComplexity.firstNightSteps,
            other: nightComplexity.otherNightSteps
          })}
        >
          {nightComplexity.firstNightSteps}↓ {nightComplexity.otherNightSteps}↻
        </span>
      </div>

      <div className="bg-subtle hidden h-7 w-px shrink-0 sm:block" />

      {/* Strength totals */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-good-blue text-3xs font-mono uppercase">{t("healthBar.good")}</span>
          <span className="text-good-blue font-mono text-xs">
            {goodStrengthTotal > 0 ? "+" : ""}
            {goodStrengthTotal}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blood-light text-3xs font-mono uppercase">{t("healthBar.evil")}</span>
          <span className="text-blood-light font-mono text-xs">{evilStrengthTotal}</span>
        </div>
      </div>

      <div className="bg-subtle hidden h-7 w-px shrink-0 sm:block" />

      {/* Warnings badges */}
      <div className="flex gap-1.5">
        {criticalCount > 0 && (
          <span className="bg-blood text-parchment font-display rounded-[10px] px-2 py-0.5 text-xs">
            {t("healthBar.critical", { n: criticalCount })}
          </span>
        )}
        {warnCount > 0 && (
          <span className="text-parchment border-severity-important bg-severity-important-bg font-display rounded-[10px] border px-2 py-0.5 text-xs">
            ⚡ {t("healthBar.warnings", { n: warnCount })}
          </span>
        )}
        {criticalCount === 0 && warnCount === 0 && (
          <span className="text-dim font-body text-xs">{t("healthBar.noCritical")}</span>
        )}
      </div>

      {/* Category coverage */}
      <div className="flex flex-wrap gap-1">
        {GOOD_CATEGORIES.map((cat) => {
          const present = !!analysis.categoryCoverage.good[cat];
          return (
            <span
              key={cat}
              title={present ? (analysis.categoryCoverage.good[cat] ?? []).join(", ") : `Missing: ${cat}`}
              className={cn(
                "text-3xs cursor-default rounded-[3px] border px-1.25 py-0.5 font-mono",
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
                "text-3xs cursor-default rounded-[3px] border px-1.25 py-0.5 font-mono",
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
