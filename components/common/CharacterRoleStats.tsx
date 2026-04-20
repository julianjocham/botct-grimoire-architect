"use client";

import { Character } from "@/types";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/contexts/LanguageContext";

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
  const st = character.stComplexity ?? 2;
  const leth = character.lethalityPerCycle ?? 0;
  const info = character.infoGathering ?? 0;

  const stTitle = t("roleStats.stTitle");
  const lethTitle = t("roleStats.lethalityTitle");
  const infoTitle = t("roleStats.infoTitle");

  if (variant === "inline") {
    return (
      <div
        className={cn("font-mono text-3xs tracking-tight text-current/80", className)}
        title={`${stTitle}: ${st}. ${lethTitle}: ${leth}. ${infoTitle}: ${info}.`}
      >
        ST{st} · L{leth} · I{info}
      </div>
    );
  }

  return (
    <div
      className={cn("text-muted flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-3xs", className)}
      title={`${stTitle}: ${st}. ${lethTitle}: ${leth}. ${infoTitle}: ${info}.`}
    >
      <span className="flex items-center gap-0.5">
        <ComplexityDots n={st} />
      </span>
      <span className="font-mono tabular-nums">
        {t("roleStats.lethalityShort")}
        {leth}
      </span>
      <span className="font-mono tabular-nums">
        {t("roleStats.infoShort")}
        {info}
      </span>
    </div>
  );
}
