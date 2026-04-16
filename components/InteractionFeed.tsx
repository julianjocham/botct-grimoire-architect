"use client";

import { Character, InteractionFeedProps } from "@/types";
import { JINX_STYLE, SEVERITY_STYLES } from "@/constants/character";

export function InteractionFeed({ hints, characters, onDetail }: InteractionFeedProps) {
  if (hints.length === 0) {
    return <div className="text-dim p-5 text-center text-sm">Add characters to see interaction warnings and tips.</div>;
  }

  return (
    <div className="flex flex-col gap-2 py-2">
      {hints.map((hint, i) => {
        const isJinx = hint.category === "jinx";
        const style = isJinx ? JINX_STYLE : SEVERITY_STYLES[hint.severity];
        const involvedChars = hint.involvedCharacters
          .map((id) => characters.find((c) => c.id === id))
          .filter(Boolean) as Character[];

        return (
          <div
            key={i}
            className={`rounded-lg px-3 py-2.5 ${isJinx ? "border-dashed" : ""}`}
            style={{
              border: `1px solid ${style.border}`,
              background: style.bg
            }}
          >
            <div className="mb-1.5 flex items-start gap-2">
              <span className="shrink-0 text-sm">{style.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5">
                  {isJinx && (
                    <span className="font-display text-gold shrink-0 rounded-[3px] border border-[#7a6200] bg-[#2a1f00] px-[5px] py-px text-[9px] tracking-[0.05em]">
                      ⚖ Djinn Jinx
                    </span>
                  )}
                  <div className="font-display text-parchment text-[12px]">{hint.title}</div>
                </div>
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {involvedChars.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onDetail(c.id)}
                      className="bg-subtle text-gold font-display cursor-pointer rounded-[4px] border-none px-1.5 py-0.5 text-[11px]"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="text-parchment-muted text-[13px] leading-[1.5]">{hint.description}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
