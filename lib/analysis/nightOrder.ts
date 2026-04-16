import type { Character, Interaction, NightStep } from "../types";

/**
 * Get context hints for a character during night phase
 */
export function getNightContextHints(
  characterId: string,
  selectedIds: string[],
  interactions: Interaction[]
): string[] {
  const hints: string[] = [];
  const relevant = interactions.filter(
    (i) =>
      (i.a === characterId || i.b === characterId) &&
      selectedIds.includes(i.a) &&
      selectedIds.includes(i.b) &&
      i.severity !== "tip"
  );

  for (const interaction of relevant) {
    hints.push(interaction.description);
  }

  return hints;
}

/**
 * Generate night order for first night or other nights
 */
export function generateNightOrder(
  characters: Character[],
  selectedIds: string[],
  phase: "first" | "other",
  interactions: Interaction[]
): NightStep[] {
  const field = phase === "first" ? "firstNight" : "otherNight";
  const reminderField = phase === "first" ? "firstNightReminder" : "otherNightReminder";

  return characters
    .filter((c) => selectedIds.includes(c.id) && c[field] > 0)
    .sort((a, b) => a[field] - b[field])
    .map((c, index) => ({
      order: index + 1,
      character: c,
      reminder: c[reminderField],
      contextHints: getNightContextHints(c.id, selectedIds, interactions)
    }));
}
