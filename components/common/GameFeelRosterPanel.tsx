"use client";

import type { RosterScoreContributionEntry, ScriptFeel } from "@/types";
import { scoreFeelBarFills, scoreFeelBarFillsCompact } from "@/lib/analysis/feel";
import { PortalTooltip } from "@/components/common/PortalTooltip";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/contexts/LanguageContext";

const BAR_SEGMENTS = 12;
const BAR_SEGMENTS_COMPACT = 6;

function fmtScore(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e9) return String(n);
  const s = n.toFixed(1);
  return s.replace(/\.0$/, "");
}

function SegmentedBar({ fill, color, segments }: { fill: number; color: string; segments: number }) {
  const f = Math.min(1, Math.max(0, fill));
  return (
    <div className="flex w-full gap-1">
      {Array.from({ length: segments }, (_, i) => {
        const on = (i + 1) / segments <= f;
        return (
          <div
            key={i}
            className={cn("h-2.5 flex-1 rounded-xs", !on && "bg-subtle")}
            style={on ? { background: color } : undefined}
          />
        );
      })}
    </div>
  );
}

function SegmentedBarCompact({ fill, color, segments }: { fill: number; color: string; segments: number }) {
  const f = Math.min(1, Math.max(0, fill));
  return (
    <div className="flex gap-1">
      {Array.from({ length: segments }, (_, i) => {
        const on = (i + 1) / segments <= f;
        return (
          <div
            key={i}
            className={cn("size-2.5 rounded-[2px]", !on && "bg-subtle")}
            style={on ? { background: color } : undefined}
          />
        );
      })}
    </div>
  );
}

function contribLines(entries: RosterScoreContributionEntry[], t: (k: string, v?: Record<string, string | number>) => string): string[] {
  if (entries.length === 0) return [t("gameFeelRoster.tooltipNone")];
  return entries.map((e) => t("gameFeelRoster.tooltipLine", { name: e.name, value: fmtScore(e.value) }));
}

function stContribLines(entries: RosterScoreContributionEntry[], t: (k: string, v?: Record<string, string | number>) => string): string[] {
  if (entries.length === 0) return [t("gameFeelRoster.tooltipStAllMinimal")];
  return contribLines(entries, t);
}

export function GameFeelRosterPanel({
  feel,
  variant = "default",
  className
}: {
  feel: ScriptFeel;
  variant?: "default" | "healthStrip";
  className?: string;
}) {
  const { t } = useTranslation();
  const rs = feel.rosterScores;
  const { contributions } = feel;
  const fillsDefault = scoreFeelBarFills(rs, BAR_SEGMENTS);
  const fillsCompact = scoreFeelBarFillsCompact(rs);

  if (rs.characterCount === 0) {
    return (
      <div className={cn("text-muted font-body text-sm", className)}>
        {t("gameFeelRoster.empty")}
      </div>
    );
  }

  if (variant === "healthStrip") {
    const fills = fillsCompact;
    const rows = [
      {
        key: "st",
        label: t("healthBar.stComplexity"),
        fill: fills.st,
        color: "var(--gold)",
        value: `${rs.stComplexityAvg}`,
        heading: t("gameFeelRoster.tooltipStHeading"),
        lines: stContribLines(contributions.stComplexity, t),
        title:
          contributions.stComplexity.length === 0
            ? t("gameFeelRoster.tooltipStAllMinimal")
            : contributions.stComplexity.map((e) => `${e.name} ${fmtScore(e.value)}`).join(", ")
      },
      {
        key: "leth",
        label: t("healthBar.lethalPerCycle"),
        fill: fills.lethality,
        color: "var(--blood-red-light)",
        value: `${fmtScore(rs.lethalityPerCycleSum)}`,
        heading: t("gameFeelRoster.tooltipLethalityHeading"),
        lines: contribLines(contributions.lethality, t),
        title:
          contributions.lethality.length === 0
            ? t("gameFeelRoster.tooltipNone")
            : contributions.lethality.map((e) => `${e.name} +${fmtScore(e.value)}`).join(", ")
      },
      {
        key: "infoG",
        label: t("healthBar.infoGood"),
        fill: fills.infoGood,
        color: "var(--good-indicator)",
        value: `${fmtScore(rs.infoGatheringGoodSum)}`,
        heading: t("gameFeelRoster.tooltipInfoGoodHeading"),
        lines: contribLines(contributions.infoGood, t),
        title:
          contributions.infoGood.length === 0
            ? t("gameFeelRoster.tooltipNone")
            : contributions.infoGood.map((e) => `${e.name} +${fmtScore(e.value)}`).join(", ")
      },
      {
        key: "infoE",
        label: t("healthBar.infoEvil"),
        fill: fills.infoEvil,
        color: "var(--color-minion-border)",
        value: `${fmtScore(rs.infoGatheringEvilSum)}`,
        heading: t("gameFeelRoster.tooltipInfoEvilHeading"),
        lines: contribLines(contributions.infoEvil, t),
        title:
          contributions.infoEvil.length === 0
            ? t("gameFeelRoster.tooltipNone")
            : contributions.infoEvil.map((e) => `${e.name} +${fmtScore(e.value)}`).join(", ")
      }
    ] as const;

    return (
      <div className={cn("flex flex-wrap items-start gap-4 sm:gap-5", className)}>
        {rows.map(({ key, label, fill, color, value, heading, lines, title }) => (
          <div key={key} className="flex min-w-[4.5rem] flex-col items-center gap-1">
            <span className="text-muted max-w-[7rem] text-center text-xs font-mono tracking-[0.06em] uppercase">
              {label}
            </span>
            <SegmentedBarCompact fill={fill} color={color} segments={BAR_SEGMENTS_COMPACT} />
            <PortalTooltip heading={heading} titleFallback={title} lines={lines} dottedUnderline>
              <span className="font-display text-sm whitespace-nowrap" style={{ color }}>
                {value}
              </span>
            </PortalTooltip>
          </div>
        ))}
      </div>
    );
  }

  const fills = fillsDefault;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div>
        <div className="mb-1 flex justify-between gap-2">
          <span className="text-muted text-sm font-mono tracking-wider uppercase">{t("gameFeelRoster.st")}</span>
          <PortalTooltip
            heading={t("gameFeelRoster.tooltipStHeading")}
            titleFallback={
              contributions.stComplexity.length === 0
                ? t("gameFeelRoster.tooltipStAllMinimal")
                : contributions.stComplexity.map((e) => `${e.name} ${fmtScore(e.value)}`).join(", ")
            }
            lines={stContribLines(contributions.stComplexity, t)}
            dottedUnderline
          >
            <span className="text-gold font-display text-base shrink-0 text-right tabular-nums">
              {t("gameFeelRoster.stValue", { avg: rs.stComplexityAvg, sum: rs.stComplexitySum })}
            </span>
          </PortalTooltip>
        </div>
        <SegmentedBar fill={fills.st} color="var(--gold)" segments={BAR_SEGMENTS} />
      </div>

      <div>
        <div className="mb-1 flex justify-between gap-2">
          <span className="text-muted text-sm font-mono tracking-wider uppercase">
            {t("gameFeelRoster.lethality")}
          </span>
          <PortalTooltip
            heading={t("gameFeelRoster.tooltipLethalityHeading")}
            titleFallback={
              contributions.lethality.length === 0
                ? t("gameFeelRoster.tooltipNone")
                : contributions.lethality.map((e) => `${e.name} +${fmtScore(e.value)}`).join(", ")
            }
            lines={contribLines(contributions.lethality, t)}
            dottedUnderline
          >
            <span className="text-blood-light font-display text-base shrink-0 text-right tabular-nums">
              {t("gameFeelRoster.lethalityValue", { sum: fmtScore(rs.lethalityPerCycleSum) })}
            </span>
          </PortalTooltip>
        </div>
        <SegmentedBar fill={fills.lethality} color="var(--blood-red-light)" segments={BAR_SEGMENTS} />
      </div>

      <div>
        <div className="mb-1 flex justify-between gap-2">
          <span className="text-muted text-sm font-mono tracking-wider uppercase">
            {t("gameFeelRoster.infoGood")}
          </span>
          <PortalTooltip
            heading={t("gameFeelRoster.tooltipInfoGoodHeading")}
            titleFallback={
              contributions.infoGood.length === 0
                ? t("gameFeelRoster.tooltipNone")
                : contributions.infoGood.map((e) => `${e.name} +${fmtScore(e.value)}`).join(", ")
            }
            lines={contribLines(contributions.infoGood, t)}
            dottedUnderline
          >
            <span className="text-good-blue font-display text-base shrink-0 text-right tabular-nums">
              {t("gameFeelRoster.infoGoodValue", { sum: fmtScore(rs.infoGatheringGoodSum) })}
            </span>
          </PortalTooltip>
        </div>
        <SegmentedBar fill={fills.infoGood} color="var(--good-indicator)" segments={BAR_SEGMENTS} />
      </div>

      <div>
        <div className="mb-1 flex justify-between gap-2">
          <span className="text-muted text-sm font-mono tracking-wider uppercase">
            {t("gameFeelRoster.infoEvil")}
          </span>
          <PortalTooltip
            heading={t("gameFeelRoster.tooltipInfoEvilHeading")}
            titleFallback={
              contributions.infoEvil.length === 0
                ? t("gameFeelRoster.tooltipNone")
                : contributions.infoEvil.map((e) => `${e.name} +${fmtScore(e.value)}`).join(", ")
            }
            lines={contribLines(contributions.infoEvil, t)}
            dottedUnderline
          >
            <span className="text-minion font-display text-base shrink-0 text-right tabular-nums">
              {t("gameFeelRoster.infoEvilValue", { sum: fmtScore(rs.infoGatheringEvilSum) })}
            </span>
          </PortalTooltip>
        </div>
        <SegmentedBar fill={fills.infoEvil} color="var(--color-minion-border)" segments={BAR_SEGMENTS} />
      </div>
    </div>
  );
}
