// Rule-based character scores (inputs are merged from defaults, heuristics, and built-in overrides).

export type NightWakePattern = "none" | "first_only" | "every_night" | "conditional" | "multiple_phases";

export type DaySurfaceArea = "none" | "passive" | "limited_uses" | "always_on" | "public_mechanic";

export type ReminderStatefulness = "stateless" | "few_tokens" | "many_tokens" | "persistent_alterations";

export type TimingPhase = "first_night" | "other_nights" | "day" | "dusk" | "dawn" | "nomination" | "execution";

export type InfoType =
  | "none"
  | "fact"
  | "comparison"
  | "subset"
  | "full_identity"
  | "player_chosen_pointer"
  | "register"
  | "public_signal";

/** Part A only: operational / timing load for the Storyteller (no drunk–poison multipliers). */
export interface StComplexityPartA {
  nightWakePattern: NightWakePattern;
  daySurfaceArea: DaySurfaceArea;
  /** Meaningful ST choices or validations each time the character’s ability resolves (0–3 capped in scoring). */
  gmDecisionsPerWake: number;
  reminderStatefulness: ReminderStatefulness;
  timingPhases: TimingPhase[];
  /** How many hidden grimoire facts must be correct to run the ability as written (0–3 capped in scoring). */
  dependencyOnHiddenFacts: number;
}

/** Max deaths this character’s ability can cause in a single night / day when “charged” (0 if none). */
export interface LethalityInput {
  maxKillsAttributedPerNight: number;
  maxKillsAttributedPerDay: number;
}

export interface InfoGatheringInput {
  infoType: InfoType;
  firstNightFacts: number;
  recurringInfoPerNight: number;
  dayInfoEventsPerDay: number;
  /**
   * When true, the information index is multiplied by **0.88** after frequency × type (see `computeInfoGathering`).
   * In the default model this is set for **Townsfolk and Outsiders** that actually contribute info, as a coarse
   * proxy that their info may be wrong or suppressed while **drunk or poisoned**. It is **not** part of ST
   * Part A complexity. Evil roles (and explicit Spy/Widow) default to false. Override per role in
   * `data/scoreOverrides.json` if needed.
   */
  sobrietyGating: boolean;
}

export interface CharacterScoreInputs {
  st: StComplexityPartA;
  lethality: LethalityInput;
  info: InfoGatheringInput;
}

export interface CharacterScores {
  stComplexity: 1 | 2 | 3 | 4 | 5;
  lethalityPerCycle: number;
  /** Rule-based info index (frequency × type weight × gate), rounded to 1 decimal; not capped at 100. */
  infoGathering: number;
}

/** Inputs + intermediate numbers used for per-stat hover explanations in the UI. */
export interface CharacterScoreBreakdown {
  st: {
    totalRaw: number;
    band: 1 | 2 | 3 | 4 | 5;
    nightWakePattern: NightWakePattern;
    nightPts: number;
    daySurfaceArea: DaySurfaceArea;
    dayPts: number;
    gmDecisionsPerWake: number;
    gmPts: number;
    reminderStatefulness: ReminderStatefulness;
    reminderPts: number;
    timingPhases: TimingPhase[];
    timingPts: number;
    dependencyOnHiddenFacts: number;
    dependencyPts: number;
  };
  lethality: {
    maxKillsAttributedPerNight: number;
    maxKillsAttributedPerDay: number;
  };
  info: {
    infoType: InfoType;
    firstNightFacts: number;
    recurringInfoPerNight: number;
    dayInfoEventsPerDay: number;
    /** firstNightFacts×2.2 + recurring×9.5 + day×7.0 */
    frequencySum: number;
    typeWeight: number;
    sobrietyGating: boolean;
    gatedMultiplier: number;
    /** frequencySum × typeWeight × gatedMultiplier */
    rawProduct: number;
    /** Same as merged `infoGathering` (1 decimal). */
    score: number;
  };
}
