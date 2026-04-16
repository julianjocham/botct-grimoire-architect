import type { Character, AbilityCategory, CharacterTag } from "../types";

/**
 * Criteria for matching characters by tags, categories, or teams
 */
export interface MatchCriteria {
  tags?: CharacterTag[];
  categories?: AbilityCategory[];
  teams?: string[];
}

/**
 * Check if a character matches all provided criteria (AND logic within field, OR within field)
 */
export function matchesCriteria(character: Character, criteria: MatchCriteria): boolean {
  if (criteria.categories && !criteria.categories.includes(character.abilityCategory)) return false;
  if (criteria.tags && !criteria.tags.some((t) => character.tags?.includes(t))) return false;
  return !(criteria.teams && !criteria.teams.includes(character.team));

}

/**
 * Check if character has any of the given tags
 */
export function hasAnyTag(character: Character, tags: CharacterTag[]): boolean {
  return tags.some((t) => character.tags?.includes(t));
}

/**
 * Check if character has a specific category
 */
export function hasCategory(character: Character, category: AbilityCategory): boolean {
  return character.abilityCategory === category;
}

/**
 * Check if character is on a specific team
 */
export function isTeam(character: Character, team: string): boolean {
  return character.team === team;
}

/**
 * Check if character is good team (townsfolk or outsider)
 */
export function isGood(character: Character): boolean {
  return character.team === "townsfolk" || character.team === "outsider";
}

/**
 * Check if character is evil team (minion or demon)
 */
export function isEvil(character: Character): boolean {
  return character.team === "minion" || character.team === "demon";
}
