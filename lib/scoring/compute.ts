import type { CharacterScoreInputs, CharacterScores, DaySurfaceArea, InfoGatheringInput, InfoType, NightWakePattern, ReminderStatefulness, StComplexityPartA } from "@/types/scoring";
import type { RawCharacter } from "@/types/character";

type EditionKey = string;

const EDITION_INFO_WEIGHT: Record<EditionKey, number> = {
  tb: 1,
  bmr: 0.92,
  snv: 0.78,
  carousel: 0.85,
  "": 0.85
};

const NIGHT_WAKE_WEIGHT: Record<NightWakePattern, number> = {
  none: 0,
  first_only: 1,
  conditional: 1,
  every_night: 3,
  multiple_phases: 4
};

const DAY_SURFACE_WEIGHT: Record<DaySurfaceArea, number> = {
  none: 0,
  passive: 1,
  limited_uses: 2,
  always_on: 2,
  public_mechanic: 3
};

const REMINDER_WEIGHT: Record<ReminderStatefulness, number> = {
  stateless: 0,
  few_tokens: 1,
  many_tokens: 2,
  persistent_alterations: 3
};

const INFO_TYPE_WEIGHT: Record<InfoType, number> = {
  none: 0,
  fact: 0.42,
  comparison: 0.55,
  subset: 0.65,
  player_chosen_pointer: 0.62,
  register: 0.78,
  public_signal: 0.48,
  full_identity: 0.95
};

function clampInt(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function stPartRawPoints(st: StComplexityPartA): number {
  const night = NIGHT_WAKE_WEIGHT[st.nightWakePattern];
  const day = DAY_SURFACE_WEIGHT[st.daySurfaceArea];
  const gm = Math.min(3, Math.max(0, st.gmDecisionsPerWake));
  const rem = REMINDER_WEIGHT[st.reminderStatefulness];
  const timing = Math.min(3, st.timingPhases.length);
  const dep = Math.min(3, Math.max(0, st.dependencyOnHiddenFacts));
  return night + day + gm + rem + timing + dep;
}

/** Map raw Part A totals to 1–5 (inclusive). */
export function computeStComplexity(st: StComplexityPartA): 1 | 2 | 3 | 4 | 5 {
  const p = stPartRawPoints(st);
  if (p <= 2) return 1;
  if (p <= 5) return 2;
  if (p <= 8) return 3;
  if (p <= 11) return 4;
  return 5;
}

export function computeLethalityPerCycle(lethality: CharacterScoreInputs["lethality"]): number {
  return Math.max(0, lethality.maxKillsAttributedPerNight + lethality.maxKillsAttributedPerDay);
}

function editionTruthWeight(edition: string): number {
  return EDITION_INFO_WEIGHT[edition] ?? EDITION_INFO_WEIGHT[""];
}

export function computeInfoGathering(info: InfoGatheringInput, edition: string): number {
  if (info.infoType === "none") return 0;
  const typeW = INFO_TYPE_WEIGHT[info.infoType];
  if (typeW <= 0) return 0;

  const freq =
    info.firstNightFacts * 2.2 +
    info.recurringInfoPerNight * 9.5 +
    info.dayInfoEventsPerDay * 7.0;

  const gated = info.sobrietyGating ? 0.88 : 1;
  const raw = freq * typeW * editionTruthWeight(edition) * gated;
  return clampInt(raw, 0, 100);
}

export function computeCharacterScores(inputs: CharacterScoreInputs, character: RawCharacter): CharacterScores {
  return {
    stComplexity: computeStComplexity(inputs.st),
    lethalityPerCycle: computeLethalityPerCycle(inputs.lethality),
    infoGathering: computeInfoGathering(inputs.info, character.edition)
  };
}
