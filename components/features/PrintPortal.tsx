"use client";

import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import { Character } from "@/types";
import { ScriptAnalysis } from "@/types";
import { TEAM_LABEL, TEAM_ORDER } from "@/constants/team";
import { CharacterIcon } from "@/components/ui/CharacterIcon";
import { cn } from "@/lib/cn";

type PrintMode = "pretty" | "clean" | "script-pretty" | "script-clean";

interface PrintPortalProps {
  scriptChars: Character[];
  analysis: ScriptAnalysis;
  printMode: PrintMode;
}

const subscribe = () => () => {};

export function PrintPortal({ scriptChars, analysis, printMode }: PrintPortalProps) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const isPretty = printMode === "pretty" || printMode === "script-pretty";
  const isScriptOnly = printMode === "script-pretty" || printMode === "script-clean";

  if (!isClient) return null;

  const pageHeading = cn(
    "mb-4 border-b-2 pb-1 text-[19px] tracking-[0.08em] uppercase",
    isPretty ? "border-[#6b3a1a]" : "border-black"
  );

  return createPortal(
    <div id="print-portal" className="font-[Georgia,serif]">
      {/* Page 1: All script roles grouped by team */}
      <PrintPage isPretty={isPretty} pageBreak>
        <h1 className={cn(pageHeading, "mb-3")}>Character Overview</h1>
        {TEAM_ORDER.map((team) => {
          const chars = scriptChars.filter((c) => c.team === team).sort((a, b) => a.name.localeCompare(b.name));
          if (chars.length === 0) return null;
          return (
            <div key={team} className="mb-2.5">
              <h3
                className={cn(
                  "text-2xs mb-1 border-b pb-0.5 font-bold tracking-widest uppercase",
                  isPretty ? "border-[#b07840]" : "border-[#ccc]"
                )}
              >
                {TEAM_LABEL[team]} ({chars.length})
              </h3>
              <div className="grid grid-cols-2 gap-x-4">
                {chars.map((c) => (
                  <div key={c.id} className="mb-1.5 flex break-inside-avoid items-start gap-1.5">
                    <CharacterIcon
                      characterId={c.id}
                      edition={c.edition}
                      team={c.team}
                      alt={c.name}
                      className="mt-px size-7 shrink-0"
                    />
                    <div className="flex-1 leading-tight">
                      <strong className="text-[12px]">{c.name}</strong>
                      <span className={cn("text-2xs ml-1", isPretty ? "text-[#5a3010]" : "text-[#333]")}>
                        {c.ability}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </PrintPage>

      {/* Pages 2 & 3: Night orders (skipped in script-only mode) */}
      {!isScriptOnly && (
        <>
          <PrintPage isPretty={isPretty} pageBreak>
            <h1 className={pageHeading}>First Night Order</h1>
            <NightOrderList steps={analysis.nightOrder.first} isPretty={isPretty} />
          </PrintPage>

          <PrintPage isPretty={isPretty}>
            <h1 className={pageHeading}>Other Nights Order</h1>
            <NightOrderList steps={analysis.nightOrder.other} isPretty={isPretty} />
          </PrintPage>
        </>
      )}
    </div>,
    document.body
  );
}

function PrintPage({
  isPretty,
  pageBreak = false,
  children
}: {
  isPretty: boolean;
  pageBreak?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("relative min-h-screen overflow-hidden p-8", pageBreak && "[page-break-after:always]")}>
      {isPretty && (
        <img
          src="/parchment.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-[1.1] object-cover"
        />
      )}
      <div className={cn("relative", isPretty ? "text-[#2a1500]" : "text-black")}>{children}</div>
    </section>
  );
}

function NightOrderList({ steps, isPretty }: { steps: ScriptAnalysis["nightOrder"]["first"]; isPretty: boolean }) {
  return (
    <>
      {steps.map((s, i) => (
        <div key={s.character.id} className="mb-3 flex items-start gap-2.5 [page-break-inside:avoid]">
          <div className="w-7 shrink-0 text-right text-[14px] font-bold">{i + 1}.</div>
          <CharacterIcon
            characterId={s.character.id}
            edition={s.character.edition}
            team={s.character.team}
            alt={s.character.name}
            className="mt-0.5 size-9 shrink-0"
          />
          <div className="flex-1">
            <strong className="text-[14px]">{s.character.name}</strong>
            {s.reminder && (
              <div className={cn("mt-0.5 text-[13px] leading-snug", isPretty ? "text-[#5a3010]" : "text-[#333]")}>
                {s.reminder}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
