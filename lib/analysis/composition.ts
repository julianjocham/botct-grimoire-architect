import type { Character, CompositionWarning } from "../types";
import { filterByTeam, filterByTags } from "../utils/filters";

/**
 * Create a composition warning
 */
function createWarning(
  type: string,
  message: string,
  severity: "critical" | "important" | "tip"
): CompositionWarning {
  return { type, message, severity };
}

/**
 * Check script requirements (full composition validation)
 */
function checkScriptRequirements(selected: Character[]): CompositionWarning[] {
  const warnings: CompositionWarning[] = [];
  const townsfolk = filterByTeam(selected, "townsfolk");
  const outsiders = filterByTeam(selected, "outsider");
  const minions = filterByTeam(selected, "minion");
  const demons = filterByTeam(selected, "demon");

  if (townsfolk.length < 9)
    warnings.push(
      createWarning(
        "too-few-townsfolk",
        `Only ${townsfolk.length} Townsfolk. A full script needs at least 9 (ideally 13).`,
        "important"
      )
    );

  if (outsiders.length < 2)
    warnings.push(
      createWarning(
        "too-few-outsiders",
        `Only ${outsiders.length} Outsiders. A full script needs at least 2 (ideally 4).`,
        "important"
      )
    );

  if (minions.length < 2)
    warnings.push(
      createWarning(
        "too-few-minions",
        `Only ${minions.length} Minions. A full script needs at least 2 (ideally 4).`,
        "important"
      )
    );

  if (demons.length === 0)
    warnings.push(
      createWarning(
        "no-demon",
        "No Demon on the script. You need at least one.",
        "critical"
      )
    );

  return warnings;
}

/**
 * Check game balance warnings (apply in both modes)
 */
function checkGameBalance(selected: Character[]): CompositionWarning[] {
  const warnings: CompositionWarning[] = [];

  // Info saturation
  const infoRecurring = selected.filter(
    (c) => c.tags?.includes("info-recurring") && c.team !== "demon" && c.team !== "minion"
  );

  if (infoRecurring.length > 5)
    warnings.push(
      createWarning(
        "high-info",
        `High info density (${infoRecurring.length} recurring). Evil needs strong misinformation.`,
        "tip"
      )
    );

  const infoFirstNight = filterByTags(selected, ["info-first-night"]);
  if (infoRecurring.length === 0 && infoFirstNight.length < 2)
    warnings.push(
      createWarning(
        "low-info",
        "Very low information. Good team is flying blind.",
        "important"
      )
    );

  // Protection
  const protection = filterByTags(filterByTeam(selected, "townsfolk"), ["protection"]);
  if (protection.length === 0)
    warnings.push(
      createWarning(
        "no-protection",
        "No protection roles. Demon kills will be unimpeded every night.",
        "tip"
      )
    );

  // Misinformation
  const misinformation = filterByTags(selected, ["info-disruption", "poison-drunk"]);
  if (misinformation.length === 0 && infoRecurring.length >= 2)
    warnings.push(
      createWarning(
        "no-misinformation",
        "Good has strong info but evil has no misinformation tools.",
        "important"
      )
    );

  // Setup modifiers
  const setupMods = selected.filter((c) => c.setup);
  if (setupMods.length > 2)
    warnings.push(
      createWarning(
        "excessive-setup-modifiers",
        `${setupMods.length} setup modifiers. Outsider count may be confusing.`,
        "important"
      )
    );

  // Day abilities
  const dayAbilities = filterByTags(filterByTeam(selected, "townsfolk"), ["day-ability"]);
  if (dayAbilities.length === 0)
    warnings.push(
      createWarning(
        "no-day-abilities",
        "No day-ability Townsfolk. Daytime play is purely social.",
        "tip"
      )
    );

  return warnings;
}

/**
 * Analyze script composition for warnings and issues
 * mode "script" — checks full requirements (13 TF, 4 OS, 4 Mn, 1 Dm)
 * mode "game" — skips count requirements, focuses on balance
 */
export function analyzeComposition(
  selectedIds: string[],
  characters: Character[],
  mode: "script" | "game" = "script"
): CompositionWarning[] {
  const selected = characters.filter((c) => selectedIds.includes(c.id));
  const warnings: CompositionWarning[] = [];

  if (mode === "script") {
    warnings.push(...checkScriptRequirements(selected));
  }

  warnings.push(...checkGameBalance(selected));

  return warnings;
}
