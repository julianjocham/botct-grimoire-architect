"use client";

import { useMemo } from "react";
import { useGrimoireState } from "@/hooks/useGrimoireState";
import { allCharacters, getEditionPool, getEditionTravelers } from "@/lib/data";
import { premadeScripts as premadeScriptsData } from "@/data/scripts";
import { EDITIONS } from "@/constants/info";
import { CharacterDetail } from "@/components/CharacterDetail";
import { ScriptStep } from "@/components/ScriptStep";
import { GameSetupStep } from "@/components/GameSetupStep";
import { DashboardStep } from "@/components/DashboardStep";
import { allInteractions } from "@/lib/data";
import { calculateEffectiveStrength } from "@/lib/strength/calculate";
import { cn } from "@/lib/cn";

export default function Home() {
  const { state, dispatch } = useGrimoireState();
  const {
    step,
    scriptType,
    scriptSource,
    premadeScriptId,
    scriptIds,
    playerCount,
    gameIds,
    nightPhase,
    searchQuery,
    detailCharacterId
  } = state;

  // Steps 2 + 3 analyze characters in play; step 1 analyzes the script being built.
  const contextIds = step === "script" ? scriptIds : gameIds;

  const editionPools = useMemo(
    () => ({
      tb: getEditionPool("tb"),
      bmr: getEditionPool("bmr"),
      snv: getEditionPool("snv")
    }),
    []
  );

  const editionTravelers = useMemo(() => {
    if (!scriptSource || scriptSource === "custom" || scriptSource === "premade") return [];
    return getEditionTravelers(scriptSource);
  }, [scriptSource]);

  const scriptDisplayName = useMemo(() => {
    if (!scriptSource) return "";
    if (scriptSource === "custom") return "Custom Script";
    if (scriptSource === "premade") {
      return premadeScriptsData.find((s) => s.id === premadeScriptId)?.name ?? "Community Script";
    }
    return EDITIONS.find((ed) => ed.key === scriptSource)?.name ?? "Unknown Script";
  }, [scriptSource, premadeScriptId]);

  // Travelers included so traveler detail panels work on the setup step.
  const allCharactersWithTravelers = useMemo(() => [...allCharacters, ...editionTravelers], [editionTravelers]);
  const detailChar = detailCharacterId
    ? (allCharactersWithTravelers.find((c) => c.id === detailCharacterId) ?? null)
    : null;
  const detailEffStr = detailCharacterId
    ? calculateEffectiveStrength(detailCharacterId, contextIds, allCharacters)
    : null;

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-subtle bg-surface flex flex-wrap items-center justify-between gap-2 border-b px-3 py-3 sm:gap-4 sm:px-6">
        <div className="flex items-center gap-3">
          <img src="/cc_logo.png" alt="Community Created Content" className="h-8 w-auto opacity-80" />
          <div className="flex flex-col sm:flex-row sm:items-baseline">
            <span className="font-display text-parchment text-md tracking-wide">Grimoire Architect</span>
            <span className="font-body text-dimmer text-xs sm:ml-3">
              Blood on the Clocktower — Fan-made Storyteller Tool
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <StepIndicator currentStep={step} />
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="border-subtle text-dim font-body cursor-pointer rounded-[4px] border bg-transparent px-2.5 py-1 text-xs"
          >
            Start Over
          </button>
        </div>
      </header>

      <main className="flex-1">
        {step === "script" && (
          <ScriptStep
            scriptType={scriptType}
            scriptSource={scriptSource}
            premadeScriptId={premadeScriptId}
            scriptIds={scriptIds}
            allCharacters={allCharacters}
            editionPools={editionPools}
            searchQuery={searchQuery}
            onSetScriptType={(type) => dispatch({ type: "SET_SCRIPT_TYPE", scriptType: type })}
            onClearScriptSource={() => dispatch({ type: "CLEAR_SCRIPT_SOURCE" })}
            onSelectEdition={(ed, ids) => dispatch({ type: "SELECT_EDITION", edition: ed, ids })}
            onSelectPremade={(id, ids) => dispatch({ type: "SELECT_PREMADE", id, ids })}
            onSelectCustom={() => dispatch({ type: "SELECT_CUSTOM" })}
            onToggleScriptChar={(id) => dispatch({ type: "TOGGLE_SCRIPT_CHAR", id })}
            onContinue={() => dispatch({ type: "GO_TO_SETUP" })}
            onSearch={(q) => dispatch({ type: "SET_SEARCH", query: q })}
            onDetail={(id) => dispatch({ type: "SET_DETAIL", id })}
          />
        )}

        {step === "setup" && (
          <GameSetupStep
            scriptType={scriptType}
            scriptSource={scriptSource}
            scriptDisplayName={scriptDisplayName}
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
            scriptDisplayName={scriptDisplayName}
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
      </main>

      <footer className="border-subtle border-t px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/cc_logo.png" alt="Community Created Content" className="h-5 w-auto opacity-60" />
            <span className="text-dimmer font-body text-xs">
              Fan-made tool — not affiliated with{" "}
              <a
                href="https://bloodontheclocktower.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground underline transition-colors"
              >
                The Pandemonium Institute
              </a>
              . Free to use.
            </span>
          </div>
          <a
            href="https://github.com/julianjocham/botct-grimoire-architect"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dimmer hover:text-foreground font-body text-xs underline transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </footer>

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

const STEP_LABELS = { script: "1 Script", setup: "2 Game Setup", dashboard: "3 Dashboard" } as const;
type WizardStep = keyof typeof STEP_LABELS;

function StepIndicator({ currentStep }: { currentStep: WizardStep }) {
  const steps = ["script", "setup", "dashboard"] as const;
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex gap-1 sm:gap-1.5">
      {steps.map((step, i) => {
        const isActive = step === currentStep;
        const isReached = i <= currentIndex;
        return (
          <div
            key={step}
            className={cn(
              "font-display text-3xs rounded-[4px] px-1.5 py-0.5 tracking-wider sm:px-2 sm:py-[3px]",
              isActive && "text-parchment bg-blood border-blood border",
              !isActive && isReached && "text-gold border-traveler-border border bg-transparent",
              !isActive && !isReached && "border-subtle text-dimmer border bg-transparent"
            )}
          >
            {STEP_LABELS[step]}
          </div>
        );
      })}
    </div>
  );
}
