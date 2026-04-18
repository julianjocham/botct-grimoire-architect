"use client";

import { NightOrderProps } from "@/types";
import { EmptyState } from "./ui/EmptyState";
import { CharacterIcon } from "./ui/CharacterIcon";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/contexts/LanguageContext";

export function NightOrder({ steps, phase, onPhaseChange }: NightOrderProps) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="bg-background mb-3 flex gap-1 rounded-md p-0.75">
        {(["first", "other"] as const).map((p) => (
          <button
            key={p}
            onClick={() => onPhaseChange(p)}
            className={cn(
              "font-display flex-1 cursor-pointer rounded-sm border-none py-1.25 text-xs tracking-wide",
              phase === p ? "text-parchment bg-townsfolk-border" : "text-muted bg-transparent"
            )}
          >
            {p === "first" ? t("nightOrder.firstNight") : t("nightOrder.otherNights")}
          </button>
        ))}
      </div>

      {steps.length === 0 && <EmptyState>{t("nightOrder.empty")}</EmptyState>}

      <div className="flex flex-col">
        {steps.map((step, i) => (
          <div key={step.character.id} className="relative flex gap-2.5">
            <div className="flex w-7 shrink-0 flex-col items-center">
              <div className="text-gold text-2xs border-faint bg-elevated z-10 flex size-6 shrink-0 items-center justify-center rounded-full border font-mono">
                {step.order}
              </div>
              {i < steps.length - 1 && <div className="bg-subtle min-h-3 w-px flex-1" />}
            </div>

            <div className="min-w-0 flex-1 pb-3">
              <div className="font-display text-parchment mb-0.75 flex items-center gap-2.5 text-sm">
                <CharacterIcon
                  characterId={step.character.id}
                  edition={step.character.edition}
                  team={step.character.team}
                  alt={step.character.name}
                  variant="token"
                  className="size-6"
                />
                {step.character.name}
              </div>
              <div className={cn("text-muted text-sm leading-[1.4]", step.contextHints.length > 0 && "mb-1.5")}>
                {step.reminder}
              </div>
              {step.contextHints.map((hint, j) => (
                <div
                  key={j}
                  className="border-severity-important bg-severity-important-bg text-gold-light mt-1 rounded-sm border px-2 py-1 text-sm leading-[1.4]"
                >
                  ⚡ {hint}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
