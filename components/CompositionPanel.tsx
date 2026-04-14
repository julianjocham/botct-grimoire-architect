"use client";

import { Character } from "@/lib/types";
import { CompositionPanelProps } from "@/components/types";
import { COLORS, MAX_TARGETS } from "@/constants/team";

export function CompositionPanel({
  warnings,
  recommendations,
  allCharacters,
  selectedIds,
  playerCountSupport,
  selectedPlayerCount = null,
  onToggle,
  onDetail
}: CompositionPanelProps) {
  const counts = {
    townsfolk: selectedIds.filter((id) => allCharacters.find((c) => c.id === id && c.team === "townsfolk")).length,
    outsider: selectedIds.filter((id) => allCharacters.find((c) => c.id === id && c.team === "outsider")).length,
    minion: selectedIds.filter((id) => allCharacters.find((c) => c.id === id && c.team === "minion")).length,
    demon: selectedIds.filter((id) => allCharacters.find((c) => c.id === id && c.team === "demon")).length
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Count summary */}
      <div className="flex gap-[6px]">
        {(Object.keys(counts) as Array<keyof typeof counts>).map((team) => (
          <div
            key={team}
            className="bg-surface flex-1 rounded-[6px] px-2 py-[6px] text-center"
            style={{
              border: `1px solid ${counts[team] >= MAX_TARGETS[team] ? COLORS[team] + "66" : "#2a2a3a"}`
            }}
          >
            <div className="font-mono text-base" style={{ color: COLORS[team] }}>
              {counts[team]}
            </div>
            <div className="text-dim font-mono text-[8px] uppercase">/ {MAX_TARGETS[team]}</div>
            <div className="font-body text-muted mt-0.5 text-[10px] capitalize">{team}</div>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div>
          <div className="font-display text-gold mb-[6px] text-[10px] tracking-[0.08em] uppercase">
            Composition Warnings
          </div>
          <div className="flex flex-col gap-[6px]">
            {warnings.map((w, i) => (
              <div
                key={i}
                className={[
                  "font-body text-parchment-muted rounded-[6px] px-[10px] py-2 text-[13px] leading-[1.5]",
                  w.severity === "critical"
                    ? "border-blood border bg-[#1a0808]"
                    : w.severity === "important"
                      ? "border border-[#7a5a00] bg-[#1a1500]"
                      : "border border-[#1a4a2e] bg-[#0a140a]"
                ].join(" ")}
              >
                {w.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="font-display text-gold mb-[6px] text-[10px] tracking-[0.08em] uppercase">Recommendations</div>
          <div className="flex flex-col gap-2">
            {recommendations.map((rec, i) => {
              const chars = rec.suggestedIds
                .map((id) => allCharacters.find((c) => c.id === id))
                .filter(Boolean) as Character[];
              return (
                <div key={i} className="rounded-[6px] border border-[#2a3a1a] bg-[#0a1400] px-[10px] py-2">
                  <div className="font-body text-parchment-muted mb-[6px] text-[13px] leading-[1.5]">
                    💡 {rec.reason}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {chars.map((c) => (
                      <div key={c.id} className="flex gap-0.5">
                        <button
                          onClick={() => onDetail(c.id)}
                          className="font-display cursor-pointer rounded-l-[4px] border border-[#2a4a2a] bg-[#1a2a1a] px-2 py-0.5 text-[11px] text-[#4a9a6a]"
                        >
                          {c.name}
                        </button>
                        <button
                          onClick={() => onToggle(c.id)}
                          className={[
                            "cursor-pointer rounded-r-[4px] px-[6px] py-0.5 text-[11px]",
                            selectedIds.includes(c.id)
                              ? "border-blood text-blood-light border bg-[#4a1a1a]"
                              : "border border-[#2a4a2a] bg-[#1a2a1a] text-[#4a9a6a]"
                          ].join(" ")}
                        >
                          {selectedIds.includes(c.id) ? "−" : "+"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {warnings.length === 0 && recommendations.length === 0 && (
        <div className="text-dim font-body py-5 text-center text-sm">
          Add more characters to see composition analysis.
        </div>
      )}

      {/* Player count support grid */}
      <div>
        <div className="font-display text-gold mb-2 text-[10px] tracking-[0.08em] uppercase">Player Count Support</div>
        <div className="border-subtle overflow-hidden rounded-[6px] border bg-[#0a0a14]">
          {/* Header row */}
          <div className="border-subtle grid grid-cols-[36px_1fr_1fr_1fr_1fr_28px] gap-1 border-b px-2 py-1">
            {["P", "TF", "OS", "Mn", "Dm", ""].map((h) => (
              <div key={h} className="text-dim text-center font-mono text-[9px] uppercase">
                {h}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {playerCountSupport.map((entry) => {
            const { playerCount: pc, required: req, supported, baronVariant } = entry;
            const isActive = selectedPlayerCount === pc;
            const displayTF = baronVariant ? baronVariant.townsfolk : req.townsfolk;
            const displayOS = baronVariant ? baronVariant.outsider : req.outsider;
            return (
              <div
                key={pc}
                className={[
                  "grid grid-cols-[36px_1fr_1fr_1fr_1fr_28px] gap-1 px-2 py-1",
                  pc < 15 ? "border-b border-[#16161f]" : "",
                  isActive
                    ? "outline-blood rounded-[3px] bg-[rgba(139,26,26,0.18)] outline outline-1 -outline-offset-1"
                    : supported
                      ? "bg-[rgba(45,106,79,0.07)]"
                      : "bg-transparent"
                ].join(" ")}
              >
                <div
                  className={[
                    "text-center font-mono text-[10px]",
                    isActive ? "text-parchment font-bold" : "text-gold font-semibold"
                  ].join(" ")}
                >
                  {pc}
                </div>
                <div className="text-townsfolk text-center font-mono text-[10px]">
                  {displayTF}
                  {baronVariant && <span className="text-dim ml-0.5 text-[8px]">({req.townsfolk})</span>}
                </div>
                <div className="text-outsider text-center font-mono text-[10px]">
                  {displayOS}
                  {baronVariant && <span className="text-dim ml-0.5 text-[8px]">({req.outsider})</span>}
                </div>
                <div className="text-minion text-center font-mono text-[10px]">{req.minion}</div>
                <div className="text-demon text-center font-mono text-[10px]">{req.demon}</div>
                <div className="text-center text-[10px]">
                  {supported ? <span className="text-tip">✓</span> : <span className="text-blood">✗</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="font-body text-dimmer mt-1 text-[11px]">
          ✓ = script has enough of each type (TF includes 3 demon bluffs)
          {playerCountSupport[0]?.baronVariant && " · Baron: shown TF/OS reflects +2 OS shift"}
        </div>
      </div>
    </div>
  );
}
