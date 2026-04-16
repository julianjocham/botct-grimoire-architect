import rawCharacters from "@/data/characters.json";
import enrichmentData from "@/data/enrichment.json";
import jinxesData from "@/data/jinxes.json";
import editionsData from "@/data/editions.json";
import categoryRulesData from "@/data/categoryRules.json";
import { generateCategoryInteractions } from "./engine";
import type { Character, Interaction, RawCharacter, CharacterEnrichment, EditionConfig, CategoryRule } from "./types";

const enrichment = enrichmentData as Record<string, CharacterEnrichment>;

function mergeCharacter(c: RawCharacter): Character {
  const e = enrichment[c.id];
  return {
    ...c,
    stComplexity: e?.stComplexity ?? 2,
    abilityCategory: e?.abilityCategory ?? "info-start",
    tags: e?.tags ?? [],
    strength: e?.strength ?? { composite: 0 },
    counters: e?.counters ?? [],
    counterDetail: e?.counterDetail ?? {},
    stAdvice: e?.stAdvice ?? "",
    newStWarning: e?.newStWarning,
    bluffAdvice: e?.bluffAdvice,
    jinxes: e?.jinxes ?? []
  } as Character;
}

// Non-traveler, non-fabled characters — the main pool
export const allCharacters: Character[] = (rawCharacters as RawCharacter[])
  .filter((c) => c.team !== "traveler" && c.team !== "fabled")
  .map(mergeCharacter);

// All traveler characters (used for 16+ player games)
export const allTravelers: Character[] = (rawCharacters as RawCharacter[])
  .filter((c) => c.team === "traveler")
  .map(mergeCharacter);

export const categoryRules: CategoryRule[] = categoryRulesData.rules as CategoryRule[];

// All interactions: official jinxes (pair-specific game rules) + category-generated interactions
export const allInteractions: Interaction[] = [
  ...(jinxesData as Interaction[]),
  ...generateCategoryInteractions(allCharacters, categoryRules, jinxesData as Interaction[]),
];

export const editions = editionsData as Record<string, EditionConfig>;

// Get regular characters for a given edition
export function getEditionPool(edition: string): Character[] {
  if (edition === "carousel") return allCharacters;
  const editionConfig = editions[edition];
  if (!editionConfig) return [];
  return allCharacters.filter((c) => editionConfig.characters.includes(c.id));
}

// Get travelers available for a given edition (empty for custom)
export function getEditionTravelers(edition: string): Character[] {
  const editionConfig = editions[edition] as EditionConfig & { travelers?: string[] };
  if (!editionConfig?.travelers?.length) return [];
  return allTravelers.filter((c) => editionConfig.travelers!.includes(c.id));
}
