import { Character, AbilityCategory } from "./character";
import { InteractionHint } from "./interaction";

// ─── Script analysis output ───────────────────────────────────────────────────

// Player count distribution entry
export interface PlayerCountEntry {
  playerCount: number;
  required: { townsfolk: number; outsider: number; minion: number; demon: number };
  supported: boolean; // script has enough chars of each type (incl. 3 TF bluffs)
  baronVariant?: { townsfolk: number; outsider: number }; // if Baron is on script
}

// Night order step (resolved character + context-aware reminder)
export interface NightStep {
  order: number;
  character: Character;
  reminder: string;
  contextHints: string[];
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

// Script composition warning
export interface CompositionWarning {
  type: string;
  message: string;
  severity: "critical" | "important" | "tip";
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

// ─── Component props ──────────────────────────────────────────────────────────

export interface NightOrderProps {
  steps: NightStep[];
  phase: "first" | "other";
  onPhaseChange: (phase: "first" | "other") => void;
}

export interface ScriptHealthBarProps {
  analysis: ScriptAnalysis;
}
