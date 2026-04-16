import type { Character, EffectiveStrength } from "../types";
import { STRENGTH_MODIFIER_RULES, matchesRuleTarget, matchesRuleTrigger } from "./rules";

/**
 * Calculate a character's effective strength based on the selection
 */
export function calculateEffectiveStrength(
  characterId: string,
  selectedIds: string[],
  characters: Character[]
): EffectiveStrength {
  const character = characters.find((c) => c.id === characterId);
  if (!character) return { baseStrength: 0, modifier: 0, effectiveStrength: 0, reasons: [] };

  const baseStrength = character.strength?.composite ?? 0;
  const others = characters.filter((c) => selectedIds.includes(c.id) && c.id !== characterId);
  const reasons: EffectiveStrength["reasons"] = [];
  let modifier = 0;

  for (const rule of STRENGTH_MODIFIER_RULES) {
    if (!matchesRuleTarget(character, rule)) continue;

    const triggers = others.filter((c) => matchesRuleTrigger(c, rule));
    const matchCount = rule.maxMatches !== undefined ? Math.min(triggers.length, rule.maxMatches) : triggers.length;

    for (let i = 0; i < matchCount; i++) {
      modifier += rule.impactPerMatch;
      reasons.push({
        characterId: triggers[i].id,
        impact: rule.impactPerMatch,
        description: rule.reason
      });
    }
  }

  const effectiveStrength = Math.max(-100, Math.min(100, baseStrength + modifier));

  return {
    baseStrength,
    modifier,
    effectiveStrength,
    reasons
  };
}

/**
 * Calculate total strength for good and evil teams
 */
export function calculateStrengthTotals(
  selectedIds: string[],
  characters: Character[]
): { good: number; evil: number } {
  const selected = characters.filter((c) => selectedIds.includes(c.id));

  const good = selected
    .filter((c) => c.team === "townsfolk" || c.team === "outsider")
    .reduce((sum, c) => sum + (c.strength?.composite ?? 0), 0);

  const evil = selected
    .filter((c) => c.team === "minion" || c.team === "demon")
    .reduce((sum, c) => sum + (c.strength?.composite ?? 0), 0);

  return { good, evil };
}
