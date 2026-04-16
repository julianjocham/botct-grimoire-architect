// Raw data from characters.json (bra1n/townsquare roles.json schema)
export interface RawCharacter {
  id: string;
  name: string;
  edition: string; // "tb" | "bmr" | "snv" | "" (experimental)
  team: "townsfolk" | "outsider" | "minion" | "demon" | "traveler" | "fabled";
  ability: string;
  setup: boolean;
  firstNight: number;
  firstNightReminder: string;
  otherNight: number;
  otherNightReminder: string;
  reminders: string[];
  remindersGlobal?: string[];
  image?: string;
}

// Enrichment data from enrichment.json, keyed by character id
export interface CharacterEnrichment {
  stComplexity: 1 | 2 | 3 | 4 | 5;
  abilityCategory: AbilityCategory;
  tags: CharacterTag[];
  strength: {
    composite: number; // -100 to +100; positive = benefits good team
    peakPower?: number; // -20 to +20; maximum single-action impact
    reliability?: number; // 0.0–1.0; how often the ability works as intended
    vulnerability?: number; // 0.0–1.0; ease of being countered or disabled
    scalingBonus?: number; // -5 to +5; extra value per additional player
  };
  counters: string[]; // character IDs
  counterDetail: Record<string, string>;
  stAdvice: string;
  newStWarning?: string;
  bluffAdvice?: string;
  jinxes?: Array<{ targetId: string; reason: string }>;
}

// Merged character used throughout the app
export interface Character extends RawCharacter {
  stComplexity: 1 | 2 | 3 | 4 | 5;
  abilityCategory: AbilityCategory;
  tags: CharacterTag[];
  strength: {
    composite: number;
    peakPower?: number;
    reliability?: number;
    vulnerability?: number;
    scalingBonus?: number;
  };
  counters: string[];
  counterDetail: Record<string, string>;
  stAdvice: string;
  newStWarning?: string;
  bluffAdvice?: string;
  jinxes?: Array<{ targetId: string; reason: string }>;
}

export type AbilityCategory =
  | "info-start"
  | "info-recurring"
  | "info-on-death"
  | "info-conditional"
  | "day-ability"
  | "once-per-game"
  | "protection"
  | "info-disruption"
  | "setup-modifier"
  | "demon-resilience"
  | "lethal-evil"
  | "social-evil"
  | "character-change"
  | "alignment-change"
  | "restriction"
  | "execution-trap"
  | "death-trigger";

export type CharacterTag =
  | "info-first-night"
  | "info-recurring"
  | "info-on-death"
  | "info-conditional"
  | "protection"
  | "poison-drunk"
  | "setup-modifier"
  | "alignment-change"
  | "character-change"
  | "lethal-good"
  | "lethal-evil"
  | "execution-modifier"
  | "demon-resilience"
  | "info-disruption"
  | "madness"
  | "once-per-game"
  | "day-ability";

// Pairwise interaction (jinxes from jinxes.json; all others generated from categoryRules.json)
export interface Interaction {
  a: string;
  b: string;
  type: "counter" | "synergy" | "dramatic" | "puzzle" | "jinx";
  severity: "critical" | "important" | "tip";
  title: string;
  description: string;
  strengthImpact: number;
  category: InteractionCategory;
}

// Rule for auto-generating category-based interactions
export interface CategoryRule {
  id: string;
  sourceTag?: CharacterTag;
  sourceCategory?: AbilityCategory;
  targetTag?: CharacterTag;
  targetCategory?: AbilityCategory;
  type: Interaction["type"];
  severity: Interaction["severity"];
  title: string;
  description: string;
  strengthImpact: number;
  category: InteractionCategory;
}

// Player count distribution entry
export interface PlayerCountEntry {
  playerCount: number;
  required: { townsfolk: number; outsider: number; minion: number; demon: number };
  supported: boolean; // script has enough chars of each type (incl. 3 TF bluffs)
  baronVariant?: { townsfolk: number; outsider: number }; // if Baron is on script
}

export type InteractionCategory =
  | "info-poisoning"
  | "death-rate"
  | "demon-resilience"
  | "info-saturation"
  | "setup-count"
  | "character-change"
  | "alignment-shift"
  | "execution-trap"
  | "jinx"
  | "night-complexity"
  | "info-disruption"
  | "info-on-death"
  | "lethal-evil"
  | "new-st-warning";

// Edition config from editions.json
export interface EditionConfig {
  name: string;
  description: string;
  characters: string[];
  travelers?: string[];
}

// Night order step
export interface NightStep {
  order: number;
  character: Character;
  reminder: string;
  contextHints: string[];
}

// Interaction hint surfaced in the UI
export interface InteractionHint {
  severity: "critical" | "important" | "tip";
  involvedCharacters: string[];
  title: string;
  description: string;
  category: InteractionCategory;
}

// Script composition analysis
export interface CompositionWarning {
  type: string;
  message: string;
  severity: "critical" | "important" | "tip";
}

// One entry in the FEEL_BARS display config
export interface FeelBarConfig {
  key: "infoLevel" | "lethalityLevel" | "chaosLevel" | "stWorkload";
  label: string;
  levels: string[];
}

// Script feel descriptors
export interface ScriptFeel {
  infoLevel: "Blind" | "Low" | "Moderate" | "High" | "Flooded";
  lethalityLevel: "Gentle" | "Standard" | "Deadly" | "Massacre";
  chaosLevel: "Orderly" | "Moderate" | "Chaotic" | "Pandemonium";
  stWorkload: "Light" | "Moderate" | "Heavy" | "Exhausting";
  summary: string;
}

// Night complexity report
export interface NightComplexityReport {
  firstNightSteps: number;
  otherNightSteps: number;
  stateTrackingRoles: string[];
  complexityRating: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  warnings: string[];
}

// Effective strength after accounting for script context
export interface EffectiveStrength {
  baseStrength: number;
  modifier: number;
  effectiveStrength: number;
  reasons: Array<{ characterId: string; impact: number; description: string }>;
}

// Category coverage for script health bar
export interface CategoryCoverage {
  good: Partial<Record<AbilityCategory, string[]>>;
  evil: Partial<Record<AbilityCategory, string[]>>;
}

// Recommendation for filling script gaps
export interface ScriptRecommendation {
  category: AbilityCategory;
  reason: string;
  severity: "important" | "tip";
  suggestedIds: string[];
}

// Full script analysis output
export interface ScriptAnalysis {
  interactionHints: InteractionHint[];
  compositionWarnings: CompositionWarning[];
  nightOrder: { first: NightStep[]; other: NightStep[] };
  nightComplexity: NightComplexityReport;
  scriptFeel: ScriptFeel;
  categoryCoverage: CategoryCoverage;
  recommendations: ScriptRecommendation[];
  goodStrengthTotal: number;
  evilStrengthTotal: number;
  playerCountSupport: PlayerCountEntry[];
}

// ─── Wizard state ─────────────────────────────────────────────────────────────

export type AppStep = "script" | "setup" | "dashboard";
export type EditionKey = "tb" | "bmr" | "snv" | "custom";

export interface GrimoireState {
  step: AppStep;

  // Step 1 – the script pool (all characters that could appear)
  scriptSource: EditionKey | null;
  scriptIds: string[];

  // Step 2 – the in-play game characters
  playerCount: number | null;
  gameIds: string[];

  // Shared UI
  nightPhase: "first" | "other";
  searchQuery: string;
  detailCharacterId: string | null;
}

export type GrimoireAction =
  | { type: "SELECT_EDITION"; edition: Exclude<EditionKey, "custom">; ids: string[] }
  | { type: "SELECT_CUSTOM" }
  | { type: "TOGGLE_SCRIPT_CHAR"; id: string }
  | { type: "GO_TO_SETUP" }
  | { type: "GO_BACK_TO_SCRIPT" }
  | { type: "GO_TO_DASHBOARD" }
  | { type: "GO_BACK_TO_SETUP" }
  | { type: "SET_PLAYER_COUNT"; count: number | null }
  | { type: "TOGGLE_GAME_CHAR"; id: string }
  | { type: "SET_NIGHT_PHASE"; phase: "first" | "other" }
  | { type: "SET_SEARCH"; query: string }
  | { type: "SET_DETAIL"; id: string | null }
  | { type: "RESET" };
