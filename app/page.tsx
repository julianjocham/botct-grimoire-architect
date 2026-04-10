"use client";

import { useReducer, useMemo } from "react";
import { GrimoireState, GrimoireAction, EditionKey } from "@/lib/types";
import { allCharacters, interactions, getEditionPool } from "@/lib/data";
import { analyzeScript, calculateEffectiveStrength } from "@/lib/engine";
import { CharacterPool } from "@/components/CharacterPool";
import { CharacterToken } from "@/components/CharacterToken";
import { InteractionFeed } from "@/components/InteractionFeed";
import { NightOrder } from "@/components/NightOrder";
import { ScriptHealthBar } from "@/components/ScriptHealthBar";
import { CharacterDetail } from "@/components/CharacterDetail";
import { CompositionPanel } from "@/components/CompositionPanel";

const EDITION_KEYS: EditionKey[] = ["tb", "bmr", "snv", "carousel"];
const EDITION_LABELS: Record<string, string> = {
  tb: "Trouble Brewing",
  bmr: "Bad Moon Rising",
  snv: "Sects & Violets",
  carousel: "The Carousel",
};
const EDITION_SHORT: Record<string, string> = {
  tb: "TB",
  bmr: "BMR",
  snv: "S&V",
  carousel: "🎠",
};

const TEAM_ORDER = ["townsfolk", "outsider", "minion", "demon"] as const;
const TEAM_LABEL: Record<string, string> = {
  townsfolk: "Townsfolk",
  outsider: "Outsiders",
  minion: "Minions",
  demon: "Demons",
};

const initialState: GrimoireState = {
  edition: "tb" as EditionKey,
  selectedIds: [],
  searchQuery: "",
  nightPhase: "first",
  activeTab: "interactions",
  detailCharacterId: null,
};

function reducer(state: GrimoireState, action: GrimoireAction): GrimoireState {
  switch (action.type) {
    case "SET_EDITION":
      return { ...state, edition: action.edition, selectedIds: [], searchQuery: "", detailCharacterId: null };
    case "TOGGLE_CHARACTER": {
      const already = state.selectedIds.includes(action.id);
      return {
        ...state,
        selectedIds: already
          ? state.selectedIds.filter((id) => id !== action.id)
          : [...state.selectedIds, action.id],
      };
    }
    case "LOAD_PRESET":
      return { ...state, selectedIds: action.ids };
    case "CLEAR_SCRIPT":
      return { ...state, selectedIds: [] };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };
    case "SET_NIGHT_PHASE":
      return { ...state, nightPhase: action.phase };
    case "SET_TAB":
      return { ...state, activeTab: action.tab };
    case "SET_DETAIL":
      return { ...state, detailCharacterId: action.id };
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { edition, selectedIds, searchQuery, nightPhase, activeTab, detailCharacterId } = state;

  const pool = useMemo(() => getEditionPool(edition), [edition]);

  const analysis = useMemo(
    () => analyzeScript(selectedIds, allCharacters, interactions),
    [selectedIds]
  );

  const selectedCharacters = useMemo(
    () => selectedIds.map((id) => allCharacters.find((c) => c.id === id)).filter(Boolean) as typeof allCharacters,
    [selectedIds]
  );

  const detailCharacter = detailCharacterId
    ? allCharacters.find((c) => c.id === detailCharacterId)
    : null;

  const detailEffectiveStrength = detailCharacterId
    ? calculateEffectiveStrength(detailCharacterId, selectedIds, allCharacters, interactions)
    : null;

  const byTeam = (team: string) =>
    selectedCharacters.filter((c) => c.team === team);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        maxWidth: 1400,
        margin: "0 auto",
        padding: "0 12px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 0 10px",
          borderBottom: "1px solid #2a2a3a",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: 20,
              color: "#e8dcc8",
              margin: 0,
              letterSpacing: "0.05em",
            }}
          >
            Grimoire Architect
          </h1>
          <div
            style={{
              fontFamily: "var(--font-garamond)",
              fontSize: 12,
              color: "#555",
              marginTop: 2,
            }}
          >
            Blood on the Clocktower — Storyteller Script Builder
          </div>
        </div>

        {/* Edition tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {EDITION_KEYS.map((ed) => (
            <button
              key={ed}
              onClick={() => dispatch({ type: "SET_EDITION", edition: ed })}
              style={{
                background: edition === ed ? "#8b1a1a" : "#14141f",
                border: `1px solid ${edition === ed ? "#8b1a1a" : "#2a2a3a"}`,
                borderRadius: 6,
                padding: "6px 12px",
                color: edition === ed ? "#e8dcc8" : "#888",
                cursor: "pointer",
                fontFamily: "var(--font-cinzel)",
                fontSize: 11,
                letterSpacing: "0.05em",
                transition: "all 0.15s ease",
              }}
              title={EDITION_LABELS[ed]}
            >
              {EDITION_SHORT[ed]}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 12,
          flex: 1,
          padding: "12px 0",
          minHeight: 0,
        }}
      >
        {/* Left: Character Pool */}
        <div style={{ height: "calc(100vh - 140px)", position: "sticky", top: 12 }}>
          <CharacterPool
            pool={pool}
            allCharacters={allCharacters}
            selectedIds={selectedIds}
            searchQuery={searchQuery}
            onSearch={(q) => dispatch({ type: "SET_SEARCH", query: q })}
            onToggle={(id) => dispatch({ type: "TOGGLE_CHARACTER", id })}
            onDetail={(id) => dispatch({ type: "SET_DETAIL", id })}
          />
        </div>

        {/* Right: Script + Analysis */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Script panel */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid #2a2a3a",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    fontSize: 13,
                    color: "#b8965a",
                    letterSpacing: "0.05em",
                  }}
                >
                  Your Script
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: 11,
                    color: "#555",
                  }}
                >
                  {selectedIds.length} character{selectedIds.length !== 1 ? "s" : ""}
                </span>
              </div>
              {selectedIds.length > 0 && (
                <button
                  onClick={() => dispatch({ type: "CLEAR_SCRIPT" })}
                  style={{
                    background: "none",
                    border: "1px solid #2a2a3a",
                    borderRadius: 4,
                    padding: "3px 8px",
                    color: "#555",
                    cursor: "pointer",
                    fontFamily: "var(--font-garamond)",
                    fontSize: 12,
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {selectedIds.length === 0 ? (
              <div
                style={{
                  color: "#444",
                  fontFamily: "var(--font-garamond)",
                  fontSize: 14,
                  textAlign: "center",
                  padding: "16px 0",
                }}
              >
                Add characters from the pool on the left
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: 5,
                        }}
                      >
                        {TEAM_LABEL[team]} ({chars.length})
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 4,
                        }}
                      >
                        {chars.map((c) => (
                          <CharacterToken
                            character={c}
                            selected
                            onToggle={(id) => dispatch({ type: "TOGGLE_CHARACTER", id })}
                            onDetail={(id) => dispatch({ type: "SET_DETAIL", id })}
                            compact
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Analysis tabs */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid #2a2a3a",
              borderRadius: 10,
              overflow: "hidden",
              flex: 1,
            }}
          >
            {/* Tab bar */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #2a2a3a",
                background: "var(--bg-base)",
              }}
            >
              {(["interactions", "night", "composition"] as const).map((tab) => {
                const labels = {
                  interactions: `Interactions (${analysis.interactionHints.length})`,
                  night: "Night Order",
                  composition: `Composition${analysis.compositionWarnings.length > 0 ? ` (${analysis.compositionWarnings.length})` : ""}`,
                };
                return (
                  <button
                    key={tab}
                    onClick={() => dispatch({ type: "SET_TAB", tab })}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "none",
                      background: "none",
                      color: activeTab === tab ? "#e8dcc8" : "#555",
                      cursor: "pointer",
                      fontFamily: "var(--font-cinzel)",
                      fontSize: 11,
                      borderBottom: activeTab === tab ? "2px solid #8b1a1a" : "2px solid transparent",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div style={{ padding: "12px 14px", overflowY: "auto", maxHeight: "45vh" }}>
              {activeTab === "interactions" && (
                <InteractionFeed
                  hints={analysis.interactionHints}
                  characters={allCharacters}
                  onDetail={(id) => dispatch({ type: "SET_DETAIL", id })}
                />
              )}
              {activeTab === "night" && (
                <NightOrder
                  steps={nightPhase === "first" ? analysis.nightOrder.first : analysis.nightOrder.other}
                  phase={nightPhase}
                  onPhaseChange={(phase) => dispatch({ type: "SET_NIGHT_PHASE", phase })}
                />
              )}
              {activeTab === "composition" && (
                <CompositionPanel
                  warnings={analysis.compositionWarnings}
                  recommendations={analysis.recommendations}
                  allCharacters={allCharacters}
                  selectedIds={selectedIds}
                  onToggle={(id) => dispatch({ type: "TOGGLE_CHARACTER", id })}
                  onDetail={(id) => dispatch({ type: "SET_DETAIL", id })}
                />
              )}
            </div>
          </div>

          {/* Script health bar */}
          <ScriptHealthBar analysis={analysis} />
        </div>
      </div>

      {/* Character detail slide-in */}
      {detailCharacter && detailEffectiveStrength && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 99,
            }}
            onClick={() => dispatch({ type: "SET_DETAIL", id: null })}
          />
          <CharacterDetail
            character={detailCharacter}
            effectiveStrength={detailEffectiveStrength}
            allCharacters={allCharacters}
            selectedIds={selectedIds}
            onClose={() => dispatch({ type: "SET_DETAIL", id: null })}
            onToggle={(id) => dispatch({ type: "TOGGLE_CHARACTER", id })}
            onNavigate={(id) => dispatch({ type: "SET_DETAIL", id })}
          />
        </>
      )}
    </div>
  );
}
