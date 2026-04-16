import { filterByTags } from "../utils/filters";
import { Character, ScriptFeel } from "@/types";

/**
 * Calculate information level (info-producing good roles)
 */
function calculateInfoLevel(selected: Character[]): ScriptFeel["infoLevel"] {
  const infoTags = ["info-first-night", "info-recurring", "info-on-death", "info-conditional"] as const;
  const infoRoles = selected.filter(
    (c) => c.team === "townsfolk" && infoTags.some((tag) => c.tags?.includes(tag))
  ).length;

  if (infoRoles >= 8) return "Flooded";
  if (infoRoles >= 5) return "High";
  if (infoRoles >= 3) return "Moderate";
  if (infoRoles >= 1) return "Low";
  return "Blind";
}

/**
 * Calculate lethality level (night-kill sources)
 */
function calculateLethalityLevel(selected: Character[]): ScriptFeel["lethalityLevel"] {
  const killSources = selected.filter(
    (c) => c.team === "demon" || c.tags?.includes("lethal-evil") || c.tags?.includes("lethal-good")
  ).length;

  if (killSources >= 5) return "Massacre";
  if (killSources >= 3) return "Deadly";
  if (killSources >= 2) return "Standard";
  return "Gentle";
}

/**
 * Calculate chaos level (character swaps, alignment changes, madness)
 */
function calculateChaosLevel(selected: Character[]): ScriptFeel["chaosLevel"] {
  const chaosTags = ["character-change", "alignment-change", "madness"] as const;
  const chaosRoles = filterByTags(selected, chaosTags).length;

  if (chaosRoles >= 4) return "Pandemonium";
  if (chaosRoles >= 2) return "Chaotic";
  if (chaosRoles >= 1) return "Moderate";
  return "Orderly";
}

/**
 * Calculate ST workload (average complexity of selected characters)
 */
function calculateSTWorkload(selected: Character[]): ScriptFeel["stWorkload"] {
  const complexitySum = selected.reduce((sum, c) => sum + (c.stComplexity ?? 2), 0);
  const avgComplexity = selected.length > 0 ? complexitySum / selected.length : 0;

  if (avgComplexity >= 4) return "Exhausting";
  if (avgComplexity >= 3) return "Heavy";
  if (avgComplexity >= 2) return "Moderate";
  return "Light";
}

/**
 * Calculate overall script feel and characteristics
 */
export function calculateScriptFeel(selectedIds: string[], characters: Character[]): ScriptFeel {
  const selected = characters.filter((c) => selectedIds.includes(c.id));

  const infoLevel = calculateInfoLevel(selected);
  const lethalityLevel = calculateLethalityLevel(selected);
  const chaosLevel = calculateChaosLevel(selected);
  const stWorkload = calculateSTWorkload(selected);

  const summary = `${infoLevel.toUpperCase()} info, ${lethalityLevel.toUpperCase()} lethality, ${chaosLevel.toUpperCase()} chaos. ST workload: ${stWorkload.toUpperCase()}.`;

  return { infoLevel, lethalityLevel, chaosLevel, stWorkload, summary };
}
