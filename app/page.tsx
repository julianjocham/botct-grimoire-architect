"use client";

import { useReducer, useMemo } from "react";
import { GrimoireState, GrimoireAction } from "@/lib/types";
import { allCharacters, interactions, getEditionPool } from "@/lib/data";
import { calculateEffectiveStrength } from "@/lib/engine";
import { CharacterDetail } from "@/components/CharacterDetail";
import { ScriptStep } from "@/components/ScriptStep";
import { GameSetupStep } from "@/components/GameSetupStep";
import { DashboardStep } from "@/components/DashboardStep";

const initialState: GrimoireState = {
  step: "script",
  scriptSource: null,
  scriptIds: [],
  playerCount: null,
  gameIds: [],
  nightPhase: "first",
  searchQuery: "",
  detailCharacterId: null,
};

function reducer(state: GrimoireState, action: GrimoireAction): GrimoireState {
  switch (action.type) {
    case "SELECT_EDITION":
      return {
        ...state,
        scriptSource: action.edition,
        scriptIds: action.ids,
        gameIds: [],
        playerCount: null,
        searchQuery: "",
        detailCharacterId: null,
      };
    case "SELECT_CUSTOM":
      return {
        ...state,
        scriptSource: "custom",
        scriptIds: [],
        gameIds: [],
        playerCount: null,
        searchQuery: "",
        detailCharacterId: null,
      };
    case "TOGGLE_SCRIPT_CHAR": {
      const inScript = state.scriptIds.includes(action.id);
      return {
        ...state,
        scriptIds: inScript
          ? state.scriptIds.filter((id) => id !== action.id)
          : [...state.scriptIds, action.id],
        gameIds: state.gameIds.filter((id) => id !== action.id),
      };
    }
    case "GO_TO_SETUP":
      return { ...state, step: "setup", gameIds: [], playerCount: null };
    case "GO_BACK_TO_SCRIPT":
      return { ...state, step: "script" };
    case "GO_TO_DASHBOARD":
      return { ...state, step: "dashboard" };
    case "GO_BACK_TO_SETUP":
      return { ...state, step: "setup" };
    case "SET_PLAYER_COUNT":
      return { ...state, playerCount: action.count, gameIds: [] };
    case "TOGGLE_GAME_CHAR": {
      const inGame = state.gameIds.includes(action.id);
      return {
        ...state,
        gameIds: inGame
          ? state.gameIds.filter((id) => id !== action.id)
          : [...state.gameIds, action.id],
      };
    }
    case "SET_NIGHT_PHASE":
      return { ...state, nightPhase: action.phase };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };
    case "SET_DETAIL":
      return { ...state, detailCharacterId: action.id };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    step,
    scriptSource,
    scriptIds,
    playerCount,
    gameIds,
    nightPhase,
    searchQuery,
    detailCharacterId,
  } = state;

  // Step 1 custom: context is the script being built.
  // Steps 2 + 3: context is the in-game characters — counters, interactions, and
  // strength modifiers only reflect characters actually in play.
  const contextIds = step === "script" ? scriptIds : gameIds;
  const detailChar = detailCharacterId
    ? allCharacters.find((c) => c.id === detailCharacterId) ?? null
    : null;
  const detailEffStr = detailCharacterId
    ? calculateEffectiveStrength(detailCharacterId, contextIds, allCharacters, interactions)
    : null;

  // Edition pools for the script step cards
  const editionPools = useMemo(
    () => ({
      tb: getEditionPool("tb"),
      bmr: getEditionPool("bmr"),
      snv: getEditionPool("snv"),
    }),
    []
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Global header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          borderBottom: "1px solid #2a2a3a",
          background: "var(--bg-surface)",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: 17,
              color: "#e8dcc8",
              letterSpacing: "0.05em",
            }}
          >
            Grimoire Architect
          </span>
          <span
            style={{
              fontFamily: "var(--font-garamond)",
              fontSize: 12,
              color: "#444",
              marginLeft: 12,
            }}
          >
            Blood on the Clocktower — Storyteller Tool
          </span>
        </div>

        {/* Step indicator + Reset */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {(["script", "setup", "dashboard"] as const).map((s, i) => {
              const labels = ["1 Script", "2 Game Setup", "3 Dashboard"];
              const reached =
                s === "script" ||
                (s === "setup" && (step === "setup" || step === "dashboard")) ||
                (s === "dashboard" && step === "dashboard");
              const active = step === s;
              return (
                <div
                  key={s}
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    fontSize: 10,
                    letterSpacing: "0.06em",
                    color: active ? "#e8dcc8" : reached ? "#b8965a" : "#333",
                    background: active ? "#8b1a1a" : "transparent",
                    border: `1px solid ${active ? "#8b1a1a" : reached ? "#4a3a20" : "#2a2a3a"}`,
                    borderRadius: 4,
                    padding: "3px 8px",
                  }}
                >
                  {labels[i]}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => dispatch({ type: "RESET" })}
            style={{
              background: "none",
              border: "1px solid #2a2a3a",
              borderRadius: 4,
              padding: "4px 10px",
              color: "#555",
              cursor: "pointer",
              fontFamily: "var(--font-garamond)",
              fontSize: 12,
            }}
          >
            Start Over
          </button>
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1 }}>
        {step === "script" && (
          <ScriptStep
            scriptSource={scriptSource}
            scriptIds={scriptIds}
            allCharacters={allCharacters}
            editionPools={editionPools}
            searchQuery={searchQuery}
            onSelectEdition={(ed, ids) =>
              dispatch({ type: "SELECT_EDITION", edition: ed, ids })
            }
            onSelectCustom={() => dispatch({ type: "SELECT_CUSTOM" })}
            onToggleScriptChar={(id) =>
              dispatch({ type: "TOGGLE_SCRIPT_CHAR", id })
            }
            onContinue={() => dispatch({ type: "GO_TO_SETUP" })}
            onSearch={(q) => dispatch({ type: "SET_SEARCH", query: q })}
            onDetail={(id) => dispatch({ type: "SET_DETAIL", id })}
          />
        )}

        {step === "setup" && (
          <GameSetupStep
            scriptSource={scriptSource}
            scriptIds={scriptIds}
            playerCount={playerCount}
            gameIds={gameIds}
            allCharacters={allCharacters}
            onSetPlayerCount={(count) =>
              dispatch({ type: "SET_PLAYER_COUNT", count })
            }
            onToggleGameChar={(id) =>
              dispatch({ type: "TOGGLE_GAME_CHAR", id })
            }
            onContinue={() => dispatch({ type: "GO_TO_DASHBOARD" })}
            onBack={() => dispatch({ type: "GO_BACK_TO_SCRIPT" })}
            onDetail={(id) => dispatch({ type: "SET_DETAIL", id })}
          />
        )}

        {step === "dashboard" && (
          <DashboardStep
            scriptSource={scriptSource}
            scriptIds={scriptIds}
            playerCount={playerCount!}
            gameIds={gameIds}
            allCharacters={allCharacters}
            interactions={interactions}
            nightPhase={nightPhase}
            onNightPhaseChange={(p) =>
              dispatch({ type: "SET_NIGHT_PHASE", phase: p })
            }
            onDetail={(id) => dispatch({ type: "SET_DETAIL", id })}
            onBackToSetup={() => dispatch({ type: "GO_BACK_TO_SETUP" })}
            onReset={() => dispatch({ type: "RESET" })}
          />
        )}
      </div>

      {/* Character detail slide-in (all steps) */}
      {detailChar && detailEffStr && (
        <>
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
            character={detailChar}
            effectiveStrength={detailEffStr}
            allCharacters={allCharacters}
            selectedIds={contextIds}
            onClose={() => dispatch({ type: "SET_DETAIL", id: null })}
            onToggle={(id) => {
              if (step === "script") dispatch({ type: "TOGGLE_SCRIPT_CHAR", id });
              else if (step === "setup") dispatch({ type: "TOGGLE_GAME_CHAR", id });
            }}
            onNavigate={(id) => dispatch({ type: "SET_DETAIL", id })}
          />
        </>
      )}
    </div>
  );
}
