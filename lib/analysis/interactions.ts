import { CategoryRule, Character, Interaction, InteractionHint } from "@/types";

/**
 * Analyze which interactions are relevant for the selected characters
 */
export function analyzeInteractions(selectedIds: string[], interactions: Interaction[]): InteractionHint[] {
  const hints: InteractionHint[] = [];

  for (const interaction of interactions) {
    if (selectedIds.includes(interaction.a) && selectedIds.includes(interaction.b)) {
      hints.push({
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
  return hints.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

/**
 * Generate interactions based on category rules
 */
export function generateCategoryInteractions(
  characters: Character[],
  rules: CategoryRule[],
  existingInteractions: Interaction[]
): Interaction[] {
  // Build a set of already-defined pairs to avoid duplicates
  const existingPairs = new Set<string>(existingInteractions.flatMap((ix) => [`${ix.a}:${ix.b}`, `${ix.b}:${ix.a}`]));

  const generated: Interaction[] = [];

  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      const a = characters[i];
      const b = characters[j];

      // Skip if a manual interaction already covers this pair
      if (existingPairs.has(`${a.id}:${b.id}`) || existingPairs.has(`${b.id}:${a.id}`)) {
        continue;
      }

      for (const rule of rules) {
        // Check if a→b direction matches
        const aMatchesSource = matchesCharacterToRule(a, rule, "source");
        const bMatchesTarget = matchesCharacterToRule(b, rule, "target");

        // Check if b→a direction matches
        const bMatchesSource = matchesCharacterToRule(b, rule, "source");
        const aMatchesTarget = matchesCharacterToRule(a, rule, "target");

        if (aMatchesSource && bMatchesTarget) {
          generated.push(createInteraction(a, b, rule));
          break; // Only one rule per pair per pass
        } else if (bMatchesSource && aMatchesTarget) {
          generated.push(createInteraction(b, a, rule));
          break;
        }
      }
    }
  }

  return generated;
}

/**
 * Check if a character matches a rule's source or target
 */
function matchesCharacterToRule(character: Character, rule: CategoryRule, direction: "source" | "target"): boolean {
  const tagField = direction === "source" ? "sourceTag" : "targetTag";
  const categoryField = direction === "source" ? "sourceCategory" : "targetCategory";

  const tag = rule[tagField as keyof CategoryRule] as any;
  const category = rule[categoryField as keyof CategoryRule] as any;

  if (tag && !character.tags?.includes(tag)) return false;
  return !(category && character.abilityCategory !== category);
}

/**
 * Create an interaction from two characters and a rule
 */
function createInteraction(source: Character, target: Character, rule: CategoryRule): Interaction {
  return {
    a: source.id,
    b: target.id,
    type: rule.type,
    severity: rule.severity,
    title: rule.title.replaceAll("{source}", source.name).replaceAll("{target}", target.name),
    description: rule.description.replaceAll("{source}", source.name).replaceAll("{target}", target.name),
    strengthImpact: rule.strengthImpact,
    category: rule.category
  };
}
