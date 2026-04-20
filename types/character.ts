// ─── Character data model ─────────────────────────────────────────────────────

// Raw data from characters.json (bra1n/townsquare roles.json schema)
export interface RawCharacter {
  id: string;
  name: string;
  edition: string; // "tb" | "bmr" | "snv" | "" (experimental)
  team: "townsfolk" | "outsider" | "minion" | "demon" | "traveler" | "fabled" | "loric";
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
  stComplexity?: 1 | 2 | 3 | 4 | 5 | null;
  abilityCategory?: AbilityCategory;
  tags?: CharacterTag[];
  strength?: {
    composite: number; // -100 to +100; positive = benefits good team
    peakPower?: number; // -20 to +20; maximum single-action impact
    reliability?: number; // 0.0–1.0; how often the ability works as intended
    vulnerability?: number; // 0.0–1.0; ease of being countered or disabled
    scalingBonus?: number; // -5 to +5; extra value per additional player
  };
  counters?: string[] | Record<string, string>;
  stAdvice: string;
  newStWarning?: string;
  bluffAdvice?: string;
  jinxes?: Array<{ targetId: string; reason: string }>;
}

// Merged character used throughout the app
export interface Character extends RawCharacter {
  stComplexity: 1 | 2 | 3 | 4 | 5;
  /** Max deaths per full cycle (night + day) attributable to this character’s ability when “charged”. */
  lethalityPerCycle: number;
  /** 0–100 composite from info frequency, info type, and edition baseline. */
  infoGathering: number;
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
  | "info-evil"
  | "day-ability"
  | "once-per-game"
  | "protection"
  | "info-disruption"
  | "setup-modifier"
  | "demon-resilience"
  | "lethal-evil"
  | "lethal-good"
  | "social-evil"
  | "support-evil"
  | "character-change"
  | "alignment-change"
  | "restriction"
  | "execution-trap"
  | "death-trigger"
  | "win-condition"
  | "passive-good"
  | "passive-evil"
  | "passive"
  | "self-sacrifice"
  | "resurrection"
  | "delayed-kill"
  | "multi-kill"
  | "nomination-trap"
  | "exile-prevention"
  | "execution-force"
  | "ability-removal"
  | "game-altering"
  | "rule-change"
  | "conditional-lethal-evil"
  | "conditional-character-change"
  | "conditional-poison"
  | "conditional-execution"
  | "extra-action"
  | "character-swap"
  | "revenge"
  | "game-ending"
  | "targeted-character-kill"
  | "delayed-starting-info"
  | "info-self-prove"
  | "info-one-shot"
  | "multi-character-change"
  | "global-misinfo"
  | "poison-drunk"
  | "unknown";

export type CharacterTag =
  | "info-first-night"
  | "info-recurring"
  | "info-on-death"
  | "info-conditional"
  | "info-evil"
  | "protection"
  | "poison-drunk"
  | "setup-modifier"
  | "alignment-change"
  | "character-change"
  | "lethal-good"
  | "lethal-evil"
  | "ultra-lethal-evil"
  | "execution-modifier"
  | "execution-trap"
  | "demon-resilience"
  | "info-disruption"
  | "madness"
  | "once-per-game"
  | "day-ability"
  | "support-evil"
  | "win-condition"
  | "passive-good"
  | "passive-evil"
  | "passive"
  | "self-sacrifice"
  | "resurrection"
  | "delayed-kill"
  | "multi-kill"
  | "nomination-trap"
  | "exile-prevention"
  | "execution-force"
  | "ability-removal"
  | "game-altering"
  | "rule-change"
  | "conditional-lethal-evil"
  | "conditional-character-change"
  | "conditional-poison"
  | "conditional-execution"
  | "extra-action"
  | "character-swap"
  | "revenge"
  | "game-ending"
  | "targeted-character-kill"
  | "delayed-starting-info"
  | "info-self-prove"
  | "info-one-shot"
  | "multi-character-change"
  | "global-misinfo"
  | "extra-life"
  | "death-trigger"
  | "restriction"
  | "info"
  | "double-vote"
  | "nomination-modifier"
  | "resurrection-tag"
  | "unknown";

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
