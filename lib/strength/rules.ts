import type { Character, AbilityCategory, CharacterTag } from "../types";
import { matchesCriteria, type MatchCriteria } from "../utils/matchers";

/**
 * Rule that adjusts a character's effective strength based on ability types
 * present elsewhere in the selection
 */
export interface StrengthModifierRule {
  // Target criteria (the character being evaluated)
  targetCategories?: AbilityCategory[];
  targetTags?: CharacterTag[];
  targetTeams?: string[];

  // Trigger criteria (other characters that affect the target)
  triggerCategories?: AbilityCategory[];
  triggerTags?: CharacterTag[];
  triggerTeams?: string[];

  impactPerMatch: number;
  maxMatches?: number;
  reason: string;
}

export const STRENGTH_MODIFIER_RULES: StrengthModifierRule[] = [
  // ── Info roles vs. drunk/poison sources ──────────────────────────────────
  {
    targetCategories: ["info-start", "info-recurring", "info-on-death", "info-conditional"],
    triggerTags: ["poison-drunk"],
    impactPerMatch: -10,
    reason: "drunk/poison source undermines info reliability"
  },
  {
    targetCategories: ["info-recurring"],
    triggerTags: ["poison-drunk"],
    impactPerMatch: -5,
    reason: "recurring info is especially exposed to permanent drunk/poison"
  },
  {
    targetCategories: ["info-start", "info-recurring", "info-on-death", "info-conditional"],
    triggerCategories: ["info-disruption"],
    impactPerMatch: -5,
    reason: "info-disruption role warps or inverts information"
  },

  // ── Protection roles vs. bypass sources ──────────────────────────────────
  {
    targetCategories: ["protection"],
    triggerTags: ["poison-drunk"],
    impactPerMatch: -10,
    reason: "drunk/poison silently breaks protection"
  },
  {
    targetCategories: ["protection"],
    triggerTags: ["lethal-evil"],
    impactPerMatch: -8,
    maxMatches: 2,
    reason: "extra kill sources reduce single-target protection coverage"
  },

  // ── Once-per-game roles vs. drunk/poison ─────────────────────────────────
  {
    targetCategories: ["once-per-game"],
    triggerTags: ["poison-drunk"],
    impactPerMatch: -8,
    maxMatches: 1,
    reason: "may be drunk/poisoned at the moment of use"
  },

  // ── Demons gain power from demon-resilience support ───────────────────────
  {
    targetTeams: ["demon"],
    triggerTags: ["demon-resilience"],
    impactPerMatch: 10,
    reason: "demon-resilience minion extends demon survival"
  },

  // ── Demon-resilience roles are only active when a demon is in play ────────
  {
    targetTags: ["demon-resilience"],
    triggerTeams: ["demon"],
    impactPerMatch: 5,
    reason: "demon presence activates resilience abilities"
  },

  // ── Info-disruption gains value from recurring info roles to target ───────
  {
    targetCategories: ["info-disruption"],
    triggerCategories: ["info-recurring"],
    impactPerMatch: 5,
    maxMatches: 3,
    reason: "more recurring info targets to disrupt"
  }
];

/**
 * Convert rule criteria into matcher criteria
 */
function ruleCriteriaToMatcher(
  categories?: AbilityCategory[],
  tags?: CharacterTag[],
  teams?: string[]
): MatchCriteria {
  return { categories, tags, teams };
}

/**
 * Check if a character matches target criteria of a rule
 */
export function matchesRuleTarget(character: Character, rule: StrengthModifierRule): boolean {
  const criteria = ruleCriteriaToMatcher(
    rule.targetCategories,
    rule.targetTags,
    rule.targetTeams
  );
  return matchesCriteria(character, criteria);
}

/**
 * Check if a character matches trigger criteria of a rule
 */
export function matchesRuleTrigger(character: Character, rule: StrengthModifierRule): boolean {
  const criteria = ruleCriteriaToMatcher(
    rule.triggerCategories,
    rule.triggerTags,
    rule.triggerTeams
  );
  return matchesCriteria(character, criteria);
}
