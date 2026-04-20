import rawCharacters from "@/data/characters.json";
import enrichmentData from "@/data/enrichment.json";
import jinxesData from "@/data/jinxes.json";
import editionsData from "@/data/editions.json";
import scoreOverridesData from "@/data/scoreOverrides.json";
import { buildCharacterScores } from "@/lib/scoring/build";
import { Character, CharacterEnrichment, EditionConfig, Interaction, RawCharacter } from "@/types";

const enrichment = enrichmentData as Record<string, CharacterEnrichment>;
const scoreOverrides = scoreOverridesData as Record<string, unknown>;

function mergeCharacter(c: RawCharacter): Character {
  const e = enrichment[c.id];
  const counters = Array.isArray(e?.counters) ? e.counters : Object.keys(e?.counters ?? {});
  const scores = buildCharacterScores(c, scoreOverrides[c.id]);
  return {
    ...c,
    stComplexity: scores.stComplexity,
    lethalityPerCycle: scores.lethalityPerCycle,
    infoGathering: scores.infoGathering,
    scoreBreakdown: scores.scoreBreakdown,
    abilityCategory: e?.abilityCategory ?? "unknown",
    tags: e?.tags ?? [],
    strength: e?.strength ?? { composite: 0 },
    counters,
    stAdvice: e?.stAdvice ?? "",
    newStWarning: e?.newStWarning,
    bluffAdvice: e?.bluffAdvice,
    jinxes: e?.jinxes ?? []
  } as Character;
}

// Non-traveler, non-fabled characters — the main pool
export const allCharacters: Character[] = (rawCharacters as RawCharacter[])
  .filter((c) => c.team !== "traveler" && c.team !== "fabled" && c.team !== "loric")
  .map(mergeCharacter);

// All traveler characters (used for 16+ player games)
export const allTravelers: Character[] = (rawCharacters as RawCharacter[])
  .filter((c) => c.team === "traveler")
  .map(mergeCharacter);

// All fabled characters (optional additions for special game modes)
export const allFabled: Character[] = (rawCharacters as RawCharacter[])
  .filter((c) => c.team === "fabled")
  .map(mergeCharacter);

// All loric characters
export const allLoric: Character[] = (rawCharacters as RawCharacter[])
  .filter((c) => c.team === "loric")
  .map(mergeCharacter);

// Full character pool including travelers, fabled, loric — used by the custom script builder
export const allCharactersWithExtras: Character[] = [...allCharacters, ...allTravelers, ...allFabled, ...allLoric];

// All interactions use official data only.
export const allInteractions: Interaction[] = jinxesData as Interaction[];

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
