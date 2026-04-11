"use client";

import { Character } from "@/lib/types";
import { CharacterToken } from "./CharacterToken";
import { calculateEffectiveStrength } from "@/lib/engine";
import { interactions } from "@/lib/data";

interface CharacterPoolProps {
  pool: Character[];
  allCharacters: Character[];
  selectedIds: string[];
  searchQuery: string;
  onSearch: (q: string) => void;
  onToggle: (id: string) => void;
  onDetail: (id: string) => void;
}

const TEAM_ORDER = ["townsfolk", "outsider", "minion", "demon"] as const;
const TEAM_LABEL: Record<string, string> = {
  townsfolk: "Townsfolk",
  outsider: "Outsiders",
  minion: "Minions",
  demon: "Demons",
};

export function CharacterPool({
  pool,
  allCharacters,
  selectedIds,
  searchQuery,
  onSearch,
  onToggle,
  onDetail,
}: CharacterPoolProps) {
  const filtered = pool.filter(
    (c) =>
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ability.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const byTeam = (team: string) => filtered.filter((c) => c.team === team);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-surface)",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid #2a2a3a",
      }}
    >
      {/* Search */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid #2a2a3a" }}>
        <input
          type="text"
          placeholder="Search characters..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          style={{
            width: "100%",
            background: "var(--bg-base)",
            border: "1px solid #3a3a4a",
            borderRadius: 6,
            padding: "6px 10px",
            color: "var(--parchment)",
            fontFamily: "var(--font-garamond)",
            fontSize: 13,
            outline: "none",
          }}
        />
      </div>

      {/* Character list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {TEAM_ORDER.map((team) => {
          const chars = byTeam(team);
          if (chars.length === 0) return null;
          return (
            <div key={team}>
              <div
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: 10,
                  color: "#b8965a",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  paddingBottom: 4,
                  borderBottom: "1px solid #2a2a3a",
                }}
              >
                {TEAM_LABEL[team]} ({chars.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {chars.map((c) => {
                  const eff = calculateEffectiveStrength(
                    c.id,
                    selectedIds,
                    allCharacters,
                    interactions
                  );
                  const countersOnScript = (c.counters ?? []).filter((id) =>
                    selectedIds.includes(id)
                  ).length;
                  return (
                    <CharacterToken
                      key={c.id}
                      character={c}
                      selected={selectedIds.includes(c.id)}
                      onToggle={onToggle}
                      onDetail={onDetail}
                      effectiveStrength={eff.effectiveStrength}
                      countersOnScript={countersOnScript}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div
            style={{
              color: "#666",
              textAlign: "center",
              padding: "20px",
              fontFamily: "var(--font-garamond)",
            }}
          >
            No characters match your search.
          </div>
        )}
      </div>
    </div>
  );
}
