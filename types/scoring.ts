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
  /** 0–100 composite (frequency × type weight × edition baseline; tune later). */
  infoGathering: number;
}
