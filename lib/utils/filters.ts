import type { Character, AbilityCategory, CharacterTag } from "../types";
import { hasAnyTag, hasCategory, isTeam, isGood, isEvil } from "./matchers";

/**
 * Filter characters by team
 */
export function filterByTeam(characters: Character[], team: string): Character[] {
  return characters.filter((c) => isTeam(c, team));
}

/**
 * Filter characters by category
 */
export function filterByCategory(characters: Character[], category: AbilityCategory): Character[] {
  return characters.filter((c) => hasCategory(c, category));
}

/**
 * Filter characters that have any of the given tags
 */
export function filterByTags(characters: Character[], tags: CharacterTag[]): Character[] {
  return characters.filter((c) => hasAnyTag(c, tags));
}

/**
 * Filter good team characters (townsfolk + outsider)
 */
export function filterGood(characters: Character[]): Character[] {
  return characters.filter(isGood);
}

/**
 * Filter evil team characters (minion + demon)
 */
export function filterEvil(characters: Character[]): Character[] {
  return characters.filter(isEvil);
}

/**
 * Filter characters that are either townsfolk or outsider
 */
export function filterGoodTeam(characters: Character[]): Character[] {
  return characters.filter((c) => c.team === "townsfolk" || c.team === "outsider");
}

/**
 * Filter characters that are either minion or demon
 */
export function filterEvilTeam(characters: Character[]): Character[] {
  return characters.filter((c) => c.team === "minion" || c.team === "demon");
}

/**
 * Count characters by team
 */
export function countByTeam(characters: Character[]): Record<string, number> {
  return {
    townsfolk: filterByTeam(characters, "townsfolk").length,
    outsider: filterByTeam(characters, "outsider").length,
    minion: filterByTeam(characters, "minion").length,
    demon: filterByTeam(characters, "demon").length
  };
}

/**
 * Get character names from a list
 */
export function getNames(characters: Character[]): string[] {
  return characters.map((c) => c.name);
}
