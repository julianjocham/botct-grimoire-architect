import { Interaction, InteractionHint } from "@/types";

/**
 * Analyze which interactions are relevant for the selected characters
 */
export function analyzeInteractions(selectedIds: string[], interactions: Interaction[]): InteractionHint[] {
  const directHints: InteractionHint[] = [];

  for (const interaction of interactions) {
    if (selectedIds.includes(interaction.a) && selectedIds.includes(interaction.b)) {
      directHints.push({
        severity: interaction.severity,
        involvedCharacters: [interaction.a, interaction.b],
        title: interaction.title,
        description: interaction.description,
        category: interaction.category
      });
    }
  }

  // Sort: critical first, then important, then tips
  const severityOrder = { critical: 0, important: 1, tip: 2 };
  return directHints.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
