import { CategoryRule, Character, Interaction, InteractionHint } from "@/types";

/**
 * Analyze which interactions are relevant for the selected characters
 */
export function analyzeInteractions(selectedIds: string[], interactions: Interaction[]): InteractionHint[] {
  const directHints: InteractionHint[] = [];
  const groupedByRule = new Map<string, Interaction[]>();

  for (const interaction of interactions) {
    if (selectedIds.includes(interaction.a) && selectedIds.includes(interaction.b)) {
      if (interaction.generatedByCategoryRule && interaction.ruleId) {
        const bucket = groupedByRule.get(interaction.ruleId) ?? [];
        bucket.push(interaction);
        groupedByRule.set(interaction.ruleId, bucket);
        continue;
      }
      directHints.push({
        severity: interaction.severity,
        involvedCharacters: [interaction.a, interaction.b],
        title: interaction.title,
        description: interaction.description,
        category: interaction.category
      });
    }
  }

  const aggregatedHints = Array.from(groupedByRule.values()).map((group) => {
    if (group.length === 1) {
      const only = group[0];
      return {
        severity: only.severity,
        involvedCharacters: [only.a, only.b],
        title: only.title,
        description: only.description,
        category: only.category
      } satisfies InteractionHint;
    }

    const first = group[0];
    const sourceNames = new Map<string, string>();
    const targetNames = new Map<string, string>();
    for (const ix of group) {
      sourceNames.set(ix.a, ix.aName ?? ix.a);
      targetNames.set(ix.b, ix.bName ?? ix.b);
    }

    const involvedCharacters = Array.from(new Set(group.flatMap((ix) => [ix.a, ix.b])));
    const allPairs = group.map((ix) => `${ix.aName ?? ix.a} -> ${ix.bName ?? ix.b}`).join("; ");
    const targetList = Array.from(targetNames.values()).join(", ");
    const sourceList = Array.from(sourceNames.values()).join(", ");
    let title = `${group.length} similar ${first.category.replaceAll("-", " ")} interactions`;
    let description = `This interaction pattern appears across ${group.length} role pairs. Pairs: ${allPairs}.`;

    if (sourceNames.size === 1) {
      const [source] = sourceNames.values();
      const primaryTarget = first.bName ?? first.b;
      title = first.title;
      description = `${first.description} Also applies to other matching targets: ${targetList}. Primary example: ${source} -> ${primaryTarget}. Pairs: ${allPairs}.`;
    } else if (targetNames.size === 1) {
      const [target] = targetNames.values();
      const primarySource = first.aName ?? first.a;
      title = first.title;
      description = `${first.description} Also applies from other matching sources: ${sourceList}. Primary example: ${primarySource} -> ${target}. Pairs: ${allPairs}.`;
    } else {
      title = `${first.title} (and similar matches)`;
      description = `${first.description} This same pattern appears across additional matching pairs. Pairs: ${allPairs}.`;
    }

    return {
      severity: first.severity,
      involvedCharacters,
      title,
      description,
      category: first.category
    } satisfies InteractionHint;
  });

  // Sort: critical first, then important, then tips
  const severityOrder = { critical: 0, important: 1, tip: 2 };
  return [...directHints, ...aggregatedHints].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
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
    aName: source.name,
    bName: target.name,
    type: rule.type,
    severity: rule.severity,
    title: rule.title.replaceAll("{source}", source.name).replaceAll("{target}", target.name),
    description: rule.description.replaceAll("{source}", source.name).replaceAll("{target}", target.name),
    strengthImpact: rule.strengthImpact,
    category: rule.category,
    ruleId: rule.id,
    generatedByCategoryRule: true,
    ruleTitleTemplate: rule.title,
    ruleDescriptionTemplate: rule.description
  };
}
