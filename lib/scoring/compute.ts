import type {
  CharacterScoreBreakdown,
  CharacterScoreInputs,
  CharacterScores,
  DaySurfaceArea,
  InfoGatheringInput,
  InfoType,
  NightWakePattern,
  ReminderStatefulness,
  StComplexityPartA
} from "@/types/scoring";

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

/**
 * Heuristic tuning only — not from official BOTC rules.
 *
 * **Frequency line** (`firstNightFacts`, `recurringInfoPerNight`, `dayInfoEventsPerDay`):
 * Coefficients 2.2 / 9.5 / 7.0 map “about how many info-like resolutions per full cycle” onto
 * one comparable scale. Recurring night info is weighted highest because it stacks every night;
 * first-night and day weights are lower starting guesses and exist so roles can be ranked
 * relative to each other inside this app.
 *
 * **Info-type weights**: Ordinal “how strong is one typical packet of this type” (fact vs
 * register vs full identity, etc.). Values are on ~0.4–1.0 so they only stretch/compress the
 * frequency line, not redefine it.
 *
 * **Sobriety gate ×0.88**: Applied when `info.sobrietyGating` is true (see `lib/scoring/README.md`).
 * Default inference sets this for good-team roles with scored info; not derived from ability wording alone.
 */
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

/** Multiplier applied when `InfoGatheringInput.sobrietyGating` is true (see `lib/scoring/README.md`). */
export const INFO_SOBRIETY_GATE_MULTIPLIER = 0.88 as const;

/** Rule-based info index: (frequency line) × (info-type weight) × (sobriety gate). No edition factor — custom scripts mix editions. */
export function computeInfoGathering(info: InfoGatheringInput): number {
  if (info.infoType === "none") return 0;
  const typeW = INFO_TYPE_WEIGHT[info.infoType];
  if (typeW <= 0) return 0;

  const freq =
    info.firstNightFacts * 2.2 +
    info.recurringInfoPerNight * 9.5 +
    info.dayInfoEventsPerDay * 7.0;

  const gated = info.sobrietyGating ? INFO_SOBRIETY_GATE_MULTIPLIER : 1;
  const raw = freq * typeW * gated;
  if (raw <= 0) return 0;
  return Math.round(raw * 10) / 10;
}

export function computeCharacterScores(inputs: CharacterScoreInputs): CharacterScores {
  return {
    stComplexity: computeStComplexity(inputs.st),
    lethalityPerCycle: computeLethalityPerCycle(inputs.lethality),
    infoGathering: computeInfoGathering(inputs.info)
  };
}

export function buildScoreBreakdown(inputs: CharacterScoreInputs): CharacterScoreBreakdown {
  const st = inputs.st;
  const nightPts = NIGHT_WAKE_WEIGHT[st.nightWakePattern];
  const dayPts = DAY_SURFACE_WEIGHT[st.daySurfaceArea];
  const gmPts = Math.min(3, Math.max(0, st.gmDecisionsPerWake));
  const reminderPts = REMINDER_WEIGHT[st.reminderStatefulness];
  const timingPts = Math.min(3, st.timingPhases.length);
  const dependencyPts = Math.min(3, Math.max(0, st.dependencyOnHiddenFacts));
  const totalRaw = nightPts + dayPts + gmPts + reminderPts + timingPts + dependencyPts;
  const band = computeStComplexity(st);

  const info = inputs.info;
  const typeW = INFO_TYPE_WEIGHT[info.infoType];
  const frequencySum =
    info.firstNightFacts * 2.2 + info.recurringInfoPerNight * 9.5 + info.dayInfoEventsPerDay * 7.0;
  const gated = info.sobrietyGating ? INFO_SOBRIETY_GATE_MULTIPLIER : 1;
  const rawProduct = info.infoType === "none" || typeW <= 0 ? 0 : frequencySum * typeW * gated;
  const score = computeInfoGathering(info);

  return {
    st: {
      totalRaw,
      band,
      nightWakePattern: st.nightWakePattern,
      nightPts,
      daySurfaceArea: st.daySurfaceArea,
      dayPts,
      gmDecisionsPerWake: st.gmDecisionsPerWake,
      gmPts,
      reminderStatefulness: st.reminderStatefulness,
      reminderPts,
      timingPhases: [...st.timingPhases],
      timingPts,
      dependencyOnHiddenFacts: st.dependencyOnHiddenFacts,
      dependencyPts
    },
    lethality: {
      maxKillsAttributedPerNight: inputs.lethality.maxKillsAttributedPerNight,
      maxKillsAttributedPerDay: inputs.lethality.maxKillsAttributedPerDay
    },
    info: {
      infoType: info.infoType,
      firstNightFacts: info.firstNightFacts,
      recurringInfoPerNight: info.recurringInfoPerNight,
      dayInfoEventsPerDay: info.dayInfoEventsPerDay,
      frequencySum,
      typeWeight: typeW,
      sobrietyGating: info.sobrietyGating,
      gatedMultiplier: gated,
      rawProduct,
      score
    }
  };
}
