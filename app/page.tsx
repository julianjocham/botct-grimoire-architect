"use client";

import { useReducer, useMemo } from "react";
import { GrimoireState, GrimoireAction } from "@/lib/types";
import { allCharacters, allInteractions, getEditionPool, getEditionTravelers } from "@/lib/data";
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
  detailCharacterId: null
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
        detailCharacterId: null
      };
    case "SELECT_CUSTOM":
      return {
        ...state,
        scriptSource: "custom",
        scriptIds: [],
        gameIds: [],
        playerCount: null,
        searchQuery: "",
        detailCharacterId: null
      };
    case "TOGGLE_SCRIPT_CHAR": {
      const inScript = state.scriptIds.includes(action.id);
      return {
        ...state,
        scriptIds: inScript ? state.scriptIds.filter((id) => id !== action.id) : [...state.scriptIds, action.id],
        gameIds: state.gameIds.filter((id) => id !== action.id)
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
        gameIds: inGame ? state.gameIds.filter((id) => id !== action.id) : [...state.gameIds, action.id]
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
  const { step, scriptSource, scriptIds, playerCount, gameIds, nightPhase, searchQuery, detailCharacterId } = state;

  // Step 1 custom: context is the script being built.
  // Steps 2 + 3: context is the in-game characters — counters, interactions, and
  // strength modifiers only reflect characters actually in play.
  const contextIds = step === "script" ? scriptIds : gameIds;

  // Edition pools for the script step cards
  const editionPools = useMemo(
    () => ({
      tb: getEditionPool("tb"),
      bmr: getEditionPool("bmr"),
      snv: getEditionPool("snv")
    }),
    []
  );

  // Travelers available for the current script source
  const editionTravelers = useMemo(
    () => (scriptSource && scriptSource !== "custom" ? getEditionTravelers(scriptSource) : []),
    [scriptSource]
  );

  // CharacterDetail lookup includes travelers so traveler detail panels work
  const allCharactersWithTravelers = useMemo(() => [...allCharacters, ...editionTravelers], [editionTravelers]);
  const detailChar = detailCharacterId
    ? (allCharactersWithTravelers.find((c) => c.id === detailCharacterId) ?? null)
    : null;
  const detailEffStr = detailCharacterId
    ? calculateEffectiveStrength(detailCharacterId, contextIds, allCharacters)
    : null;

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Global header */}
      <div className="border-subtle bg-surface flex items-center justify-between border-b px-6 py-3">
        <div>
          <span className="font-display text-parchment text-[17px] tracking-[0.05em]">Grimoire Architect</span>
          <span className="font-body text-dimmer ml-3 text-[12px]">Blood on the Clocktower — Storyteller Tool</span>
        </div>

        {/* Step indicator + Reset */}
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
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
                  className={[
                    "font-display rounded-[4px] px-2 py-[3px] text-[10px] tracking-[0.06em]",
                    active
                      ? "text-parchment bg-blood border-blood border"
                      : reached
                        ? "text-gold border border-[#4a3a20] bg-transparent"
                        : "border-subtle border bg-transparent text-[#333]"
                  ].join(" ")}
                >
                  {labels[i]}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="border-subtle text-dim font-body cursor-pointer rounded-[4px] border bg-transparent px-2.5 py-1 text-[12px]"
          >
            Start Over
          </button>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1">
        {step === "script" && (
          <ScriptStep
            scriptSource={scriptSource}
            scriptIds={scriptIds}
            allCharacters={allCharacters}
            editionPools={editionPools}
            searchQuery={searchQuery}
            onSelectEdition={(ed, ids) => dispatch({ type: "SELECT_EDITION", edition: ed, ids })}
            onSelectCustom={() => dispatch({ type: "SELECT_CUSTOM" })}
            onToggleScriptChar={(id) => dispatch({ type: "TOGGLE_SCRIPT_CHAR", id })}
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
            editionTravelers={editionTravelers}
            onSetPlayerCount={(count) => dispatch({ type: "SET_PLAYER_COUNT", count })}
            onToggleGameChar={(id) => dispatch({ type: "TOGGLE_GAME_CHAR", id })}
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
            editionTravelers={editionTravelers}
            interactions={allInteractions}
            nightPhase={nightPhase}
            onNightPhaseChange={(p) => dispatch({ type: "SET_NIGHT_PHASE", phase: p })}
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
            className="fixed inset-0 z-[99] bg-black/50"
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
