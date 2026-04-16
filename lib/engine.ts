import type { Character, Interaction, ScriptAnalysis } from "./types";
import { generateNightOrder } from "./analysis/nightOrder";
import { calculateStrengthTotals } from "./strength/calculate";
import { analyzeInteractions } from "./analysis/interactions";
import { analyzeComposition } from "./analysis/composition";
import { calculateScriptFeel } from "./analysis/feel";
import { calculateNightComplexity } from "./analysis/complexity";
import { getCategoryCoverage } from "./analysis/coverage";
import { getRecommendations } from "./analysis/recommendations";
import { getSupportedPlayerCounts } from "./analysis/playerCounts";

/**
 * Perform complete script analysis across all dimensions
 */
export function analyzeScript(
  selectedIds: string[],
  characters: Character[],
  interactions: Interaction[],
  mode: "script" | "game" = "script"
): ScriptAnalysis {
  const { good, evil } = calculateStrengthTotals(selectedIds, characters);

  return {
    interactionHints: analyzeInteractions(selectedIds, interactions),
    compositionWarnings: analyzeComposition(selectedIds, characters, mode),
    nightOrder: {
      first: generateNightOrder(characters, selectedIds, "first", interactions),
      other: generateNightOrder(characters, selectedIds, "other", interactions)
    },
    nightComplexity: calculateNightComplexity(selectedIds, characters),
    scriptFeel: calculateScriptFeel(selectedIds, characters),
    categoryCoverage: getCategoryCoverage(selectedIds, characters),
    recommendations: getRecommendations(selectedIds, characters),
    goodStrengthTotal: good,
    evilStrengthTotal: evil,
    playerCountSupport: getSupportedPlayerCounts(selectedIds, characters)
  };
}
