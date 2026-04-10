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
    composite: number; // -100 to +100
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
  strength: { composite: number };
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

// Pairwise interaction from interactions.json
export interface Interaction {
  a: string;
  b: string;
  type: "counter" | "synergy" | "dramatic" | "puzzle";
  severity: "critical" | "important" | "tip";
  title: string;
  description: string;
  strengthImpact: number;
  category: InteractionCategory;
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
  | "new-st-warning";

// Edition config from editions.json
export interface EditionConfig {
  name: string;
  description: string;
  characters: string[];
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
}

// App state
export type EditionKey = "tb" | "bmr" | "snv" | "carousel";

export interface GrimoireState {
  edition: EditionKey;
  selectedIds: string[];
  searchQuery: string;
  nightPhase: "first" | "other";
  activeTab: "interactions" | "night" | "composition";
  detailCharacterId: string | null;
}

export type GrimoireAction =
  | { type: "SET_EDITION"; edition: EditionKey }
  | { type: "TOGGLE_CHARACTER"; id: string }
  | { type: "LOAD_PRESET"; ids: string[] }
  | { type: "CLEAR_SCRIPT" }
  | { type: "SET_SEARCH"; query: string }
  | { type: "SET_NIGHT_PHASE"; phase: "first" | "other" }
  | { type: "SET_TAB"; tab: GrimoireState["activeTab"] }
  | { type: "SET_DETAIL"; id: string | null };
