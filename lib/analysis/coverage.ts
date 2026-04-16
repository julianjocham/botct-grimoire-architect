import { filterGoodTeam, filterEvilTeam, getNames } from "../utils/filters";
import { AbilityCategory, CategoryCoverage, Character } from "@/types";

const GOOD_CATEGORIES: AbilityCategory[] = [
  "info-start",
  "info-recurring",
  "info-on-death",
  "info-conditional",
  "day-ability",
  "once-per-game",
  "protection"
];

const EVIL_CATEGORIES: AbilityCategory[] = [
  "info-disruption",
  "setup-modifier",
  "demon-resilience",
  "lethal-evil",
  "social-evil",
  "character-change"
];

/**
 * Get category coverage for script health
 */
export function getCategoryCoverage(selectedIds: string[], characters: Character[]): CategoryCoverage {
  const selected = characters.filter((c) => selectedIds.includes(c.id));

  const goodCoverage: Partial<Record<AbilityCategory, string[]>> = {};
  const evilCoverage: Partial<Record<AbilityCategory, string[]>> = {};

  // Check good team coverage
  for (const cat of GOOD_CATEGORIES) {
    const chars = filterGoodTeam(selected.filter((c) => c.abilityCategory === cat));
    if (chars.length > 0) {
      goodCoverage[cat] = getNames(chars);
    }
  }

  // Check evil team coverage
  for (const cat of EVIL_CATEGORIES) {
    const chars = filterEvilTeam(selected.filter((c) => c.abilityCategory === cat));
    if (chars.length > 0) {
      evilCoverage[cat] = getNames(chars);
    }
  }

  return { good: goodCoverage, evil: evilCoverage };
}
