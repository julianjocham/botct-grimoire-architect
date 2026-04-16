import { Character, AbilityCategory, CharacterTag } from "./character";

// ─── Interaction data model ───────────────────────────────────────────────────

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

// Interaction hint surfaced in the UI
export interface InteractionHint {
  severity: "critical" | "important" | "tip";
  involvedCharacters: string[];
  title: string;
  description: string;
  category: InteractionCategory;
}

// ─── Component props ──────────────────────────────────────────────────────────

export interface InteractionFeedProps {
  hints: InteractionHint[];
  characters: Character[];
  onDetail: (id: string) => void;
}
