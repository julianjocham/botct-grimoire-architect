const TEAM_TO_ALIGNMENT: Record<string, string> = {
  townsfolk: "g",
  outsider: "g",
  minion: "e",
  demon: "e",
  traveler: "g"
};

const STANDARD_EDITIONS = new Set(["tb", "bmr", "snv"]);
const BASE_URL = "https://script.bloodontheclocktower.com/src/assets/icons";

export function getCharacterIconUrl(characterId: string, edition: string, team: string): string {
  // Fabled characters - no alignment suffix
  if (team === "fabled") {
    return `${BASE_URL}/fabled/${characterId}.webp`;
  }

  // Loric characters - no alignment suffix
  if (team === "loric") {
    return `${BASE_URL}/loric/${characterId}.webp`;
  }

  // Regular alignment-based characters
  const alignment = TEAM_TO_ALIGNMENT[team] || "g";

  // Use carousel folder for characters without a standard edition or missing edition
  if (!edition || !STANDARD_EDITIONS.has(edition)) {
    return `${BASE_URL}/carousel/${characterId}_${alignment}.webp`;
  }

  // Standard edition folders (tb, bmr, snv)
  return `${BASE_URL}/${edition}/${characterId}_${alignment}.webp`;
}
