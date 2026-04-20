import { filterByTeam } from "../utils/filters";
import { Character, CompositionWarning } from "@/types";

/**
 * Create a composition warning
 */
function createWarning(type: string, message: string, severity: "critical" | "important" | "tip"): CompositionWarning {
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
    warnings.push(createWarning("no-demon", "No Demon on the script. You need at least one.", "critical"));

  return warnings;
}

/**
 * Game-roster balance heuristics were tag-driven and drifted from the official data model.
 * Reserved for future score-driven tips; empty for now so the UI is not misleading.
 */
function checkGameBalance(_selected: Character[]): CompositionWarning[] {
  return [];
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
