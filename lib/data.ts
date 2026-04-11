import rawCharacters from "@/data/characters.json";
import enrichmentData from "@/data/enrichment.json";
import interactionsData from "@/data/interactions.json";
import editionsData from "@/data/editions.json";
import type {
  Character,
  Interaction,
  RawCharacter,
  CharacterEnrichment,
  EditionConfig,
} from "./types";

const enrichment = enrichmentData as Record<string, CharacterEnrichment>;

// Merge raw character data with enrichment
export const allCharacters: Character[] = (rawCharacters as RawCharacter[])
  .filter((c) => c.team !== "traveler" && c.team !== "fabled") // exclude travelers for now
  .map((c) => {
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
      jinxes: e?.jinxes ?? [],
    } as Character;
  });

export const interactions: Interaction[] = interactionsData as Interaction[];

export const editions = editionsData as Record<string, EditionConfig>;

// Get characters available for a given edition
export function getEditionPool(edition: string): Character[] {
  if (edition === "carousel") return allCharacters;
  const editionConfig = editions[edition];
  if (!editionConfig) return [];
  return allCharacters.filter((c) => editionConfig.characters.includes(c.id));
}
