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

// Pairwise interaction sourced from official interaction data.
export interface Interaction {
  a: string;
  b: string;
  aName?: string;
  bName?: string;
  type: "counter" | "synergy" | "dramatic" | "puzzle" | "jinx";
  severity: "critical" | "important" | "tip";
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
