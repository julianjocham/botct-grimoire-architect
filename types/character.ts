// ─── Character data model ─────────────────────────────────────────────────────

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

// ─── Strength ─────────────────────────────────────────────────────────────────

// Effective strength after accounting for script context (computed per character)
export interface EffectiveStrength {
  baseStrength: number;
  modifier: number;
  effectiveStrength: number;
  reasons: Array<{ characterId: string; impact: number; description: string }>;
}

// ─── Component props ──────────────────────────────────────────────────────────

export interface CharacterDetailProps {
  character: Character;
  effectiveStrength: EffectiveStrength;
  allCharacters: Character[];
  selectedIds: string[];
  onClose: () => void;
  onToggle: (id: string) => void;
  onNavigate: (id: string) => void;
}

export interface CharacterTokenProps {
  character: Character;
  selected?: boolean;
  onToggle: (id: string) => void;
  onDetail: (id: string) => void;
  effectiveStrength?: number;
  compact?: boolean;
  countersOnScript?: number;
}

export interface StrengthBarProps {
  value: number; // -100 to +100
  showNumber?: boolean;
  effectiveValue?: number;
  small?: boolean;
}
