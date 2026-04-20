"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import type { Character } from "@/types";
import type { CharacterScoreBreakdown, TimingPhase } from "@/types/scoring";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/contexts/LanguageContext";

function fmt(n: number, decimals = 2): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e9) return String(n);
  const s = n.toFixed(decimals);
  return s.replace(/\.?0+$/, "");
}

function ComplexityDots({ n }: { n: number }) {
  const capped = Math.max(1, Math.min(5, n));
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="mr-px inline-block h-[3px] w-[3px] rounded-full"
          style={{ background: i < capped ? "var(--gold)" : "var(--border-subtle)" }}
        />
      ))}
    </>
  );
}

function StatWithTooltip({
  heading,
  titleFallback,
  lines,
  className,
  dottedUnderline,
  children
}: {
  heading: string;
  /** Native tooltip fallback (e.g. touch devices). */
  titleFallback: string;
  lines: string[];
  className?: string;
  dottedUnderline?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <span className={cn("group/stat relative inline-flex max-w-full", className)}>
      <span
        className={cn(
          "cursor-help",
          dottedUnderline &&
            "underline decoration-current/35 decoration-dotted underline-offset-[3px]"
        )}
        tabIndex={0}
        aria-describedby={id}
        title={titleFallback}
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className="border-subtle bg-surface text-muted pointer-events-none absolute left-1/2 top-full z-[120] mt-1.5 hidden w-max max-w-[min(22rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-md border px-2.5 py-2 text-left text-3xs leading-snug shadow-lg group-focus-within/stat:block group-hover/stat:block print:hidden"
      >
        <div className="text-parchment font-body font-semibold">{heading}</div>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-3.5 marker:text-muted">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </span>
    </span>
  );
}

function buildRoleStatCopy(
  character: Character,
  t: (key: string, vars?: Record<string, string | number>) => string
) {
  const b = character.scoreBreakdown;

  const enumT = {
    nightWake: (k: CharacterScoreBreakdown["st"]["nightWakePattern"]) => t(`roleStats.enum.nightWake.${k}`),
    daySurface: (k: CharacterScoreBreakdown["st"]["daySurfaceArea"]) => t(`roleStats.enum.daySurface.${k}`),
    reminder: (k: CharacterScoreBreakdown["st"]["reminderStatefulness"]) => t(`roleStats.enum.reminder.${k}`),
    infoType: (k: CharacterScoreBreakdown["info"]["infoType"]) => t(`roleStats.enum.infoType.${k}`),
    timingPhase: (k: TimingPhase) => t(`roleStats.enum.timingPhase.${k}`)
  };

  const sep = t("roleStats.listSep");

  const stLines = (): string[] => {
    const s = b.st;
    const phaseList =
      s.timingPhases.length > 0
        ? s.timingPhases.map((p) => enumT.timingPhase(p)).join(sep)
        : t("roleStats.phaseListNone");
    const lines: string[] = [
      t("roleStats.stIntro", { band: s.band, raw: s.totalRaw }),
      t("roleStats.stLineNight", { label: enumT.nightWake(s.nightWakePattern), pts: s.nightPts }),
      t("roleStats.stLineDay", { label: enumT.daySurface(s.daySurfaceArea), pts: s.dayPts }),
      t("roleStats.stLineGm", { n: s.gmDecisionsPerWake, pts: s.gmPts }),
      t("roleStats.stLineRem", { label: enumT.reminder(s.reminderStatefulness), pts: s.reminderPts }),
      t("roleStats.stLineTime", { count: s.timingPhases.length, pts: s.timingPts, list: phaseList }),
      t("roleStats.stLineDep", { n: s.dependencyOnHiddenFacts, pts: s.dependencyPts })
    ];
    return lines;
  };

  const lethTitleFallback = `${t("roleStats.lethalityTitle")} ${character.lethalityPerCycle}.`;
  const lethLines = (): string[] => {
    const { maxKillsAttributedPerNight: night, maxKillsAttributedPerDay: day } = b.lethality;
    return [
      t("roleStats.lethIntro", {
        night,
        day,
        total: night + day
      })
    ];
  };

  const infoTitleFallback = `${t("roleStats.infoTitle")} ${character.infoGathering}.`;
  const infoLines = (): string[] => {
    const i = b.info;
    if (i.infoType === "none") {
      return [t("roleStats.infoIntroNone")];
    }
    const gateState = i.sobrietyGating ? t("roleStats.yes") : t("roleStats.no");
    return [
      t("roleStats.infoIntro"),
      t("roleStats.infoLineType", { label: enumT.infoType(i.infoType), w: fmt(i.typeWeight) }),
      t("roleStats.infoLineFreq", {
        fn: i.firstNightFacts,
        rn: i.recurringInfoPerNight,
        dn: i.dayInfoEventsPerDay,
        sum: fmt(i.frequencySum)
      }),
      t("roleStats.infoLineGate", { w: fmt(i.gatedMultiplier), state: gateState }),
      t("roleStats.infoLineGateExplain"),
      t("roleStats.infoLineProduct", { raw: fmt(i.rawProduct, 2), score: fmt(i.score, 2) }),
      t("roleStats.infoLineTuning")
    ];
  };

  const stTitleFallback = `${t("roleStats.stTitle")} ${character.stComplexity}.`;

  return {
    st: { heading: t("roleStats.stHoverTitle"), lines: stLines(), titleFallback: stTitleFallback },
    leth: { heading: t("roleStats.lethalityHoverTitle"), lines: lethLines(), titleFallback: lethTitleFallback },
    info: { heading: t("roleStats.infoHoverTitle"), lines: infoLines(), titleFallback: infoTitleFallback }
  };
}

export function CharacterRoleStats({
  character,
  /** One-line `STn · Ln · In` (otherwise small dots + L + I). */
  variant,
  className
}: {
  character: Character;
  variant?: "inline";
  className?: string;
}) {
  const { t } = useTranslation();
  const copy = buildRoleStatCopy(character, t);
  const st = character.stComplexity ?? 2;
  const leth = character.lethalityPerCycle ?? 0;
  const info = character.infoGathering ?? 0;

  if (variant === "inline") {
    return (
      <div className={cn("font-mono text-3xs tracking-tight text-current/80", className)}>
        <StatWithTooltip
          heading={copy.st.heading}
          titleFallback={copy.st.titleFallback}
          lines={copy.st.lines}
          dottedUnderline
        >
          ST{st}
        </StatWithTooltip>
        <span className="text-muted/60 mx-0.5">·</span>
        <StatWithTooltip
          heading={copy.leth.heading}
          titleFallback={copy.leth.titleFallback}
          lines={copy.leth.lines}
          dottedUnderline
        >
          L{leth}
        </StatWithTooltip>
        <span className="text-muted/60 mx-0.5">·</span>
        <StatWithTooltip
          heading={copy.info.heading}
          titleFallback={copy.info.titleFallback}
          lines={copy.info.lines}
          dottedUnderline
        >
          I{info}
        </StatWithTooltip>
      </div>
    );
  }

  return (
    <div className={cn("text-muted flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-3xs", className)}>
      <StatWithTooltip
        heading={copy.st.heading}
        titleFallback={copy.st.titleFallback}
        lines={copy.st.lines}
        className="shrink-0"
      >
        <span className="flex items-center gap-0.5">
          <ComplexityDots n={st} />
        </span>
      </StatWithTooltip>
      <StatWithTooltip
        heading={copy.leth.heading}
        titleFallback={copy.leth.titleFallback}
        lines={copy.leth.lines}
        dottedUnderline
        className="shrink-0"
      >
        <span className="font-mono tabular-nums">
          {t("roleStats.lethalityShort")}
          {leth}
        </span>
      </StatWithTooltip>
      <StatWithTooltip
        heading={copy.info.heading}
        titleFallback={copy.info.titleFallback}
        lines={copy.info.lines}
        dottedUnderline
        className="shrink-0"
      >
        <span className="font-mono tabular-nums">
          {t("roleStats.infoShort")}
          {info}
        </span>
      </StatWithTooltip>
    </div>
  );
}
