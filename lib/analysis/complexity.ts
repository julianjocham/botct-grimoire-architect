import type { Character, NightComplexityReport } from "../types";

/**
 * Calculate night complexity report
 */
export function calculateNightComplexity(
  selectedIds: string[],
  characters: Character[]
): NightComplexityReport {
  const selected = characters.filter((c) => selectedIds.includes(c.id));

  const firstNightSteps = selected.filter((c) => c.firstNight > 0).length;
  const otherNightSteps = selected.filter((c) => c.otherNight > 0).length;
  const stateTrackingRoles = selected.filter((c) => (c.stComplexity ?? 1) >= 4).map((c) => c.name);

  const warnings: string[] = [];

  if (otherNightSteps > 8) {
    warnings.push(`${otherNightSteps} actions per night — allow extra time.`);
  }

  if (stateTrackingRoles.length > 2) {
    warnings.push(`${stateTrackingRoles.length} state-tracking roles require ongoing bookkeeping.`);
  }

  const complexityRating: NightComplexityReport["complexityRating"] =
    otherNightSteps >= 8 || stateTrackingRoles.length >= 3
      ? "Expert"
      : otherNightSteps >= 5 || stateTrackingRoles.length >= 2
        ? "Advanced"
        : otherNightSteps >= 3
          ? "Intermediate"
          : "Beginner";

  return {
    firstNightSteps,
    otherNightSteps,
    stateTrackingRoles,
    complexityRating,
    warnings
  };
}
