"use client";

import { NightOrderProps } from "@/components/types";

export function NightOrder({ steps, phase, onPhaseChange }: NightOrderProps) {
  return (
    <div>
      {/* Phase toggle */}
      <div className="bg-background mb-3 flex gap-1 rounded-[6px] p-[3px]">
        {(["first", "other"] as const).map((p) => (
          <button
            key={p}
            onClick={() => onPhaseChange(p)}
            className={`font-display flex-1 cursor-pointer rounded-[4px] border-none py-[5px] text-[11px] tracking-[0.05em] ${
              phase === p ? "text-parchment bg-[#2a4a7f]" : "text-muted bg-transparent"
            }`}
          >
            {p === "first" ? "First Night" : "Other Nights"}
          </button>
        ))}
      </div>

      {steps.length === 0 && <div className="text-dim p-5 text-center text-sm">No night actions for this phase.</div>}

      <div className="flex flex-col">
        {steps.map((step, i) => (
          <div key={step.character.id} className="relative flex gap-2.5">
            {/* Timeline line */}
            <div className="flex w-7 shrink-0 flex-col items-center">
              <div className="text-gold z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3a3a5a] bg-[#1a1a2e] font-mono text-[10px]">
                {step.order}
              </div>
              {i < steps.length - 1 && <div className="bg-subtle min-h-3 w-px flex-1" />}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pb-3">
              <div className="font-display text-parchment mb-[3px] text-[12px]">{step.character.name}</div>
              <div
                className={`text-[12px] leading-[1.4] text-[#888] ${step.contextHints.length > 0 ? "mb-1.5" : "mb-0"}`}
              >
                {step.reminder}
              </div>
              {step.contextHints.map((hint, j) => (
                <div
                  key={j}
                  className="mt-1 rounded-[4px] border border-[#3a3000] bg-[#1a1500] px-2 py-1 text-[12px] leading-[1.4] text-[#c8a840]"
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
