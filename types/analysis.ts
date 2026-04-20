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

/** Roster-wide sums / averages of the rule-based per-character scores (edition-agnostic). */
export interface ScriptRosterScoreFeel {
  stComplexitySum: number;
  /** Mean ST Part-A band (1–5), one decimal. */
  stComplexityAvg: number;
  lethalityPerCycleSum: number;
  /** Sum of `infoGathering` for townsfolk, outsiders, and travelers. */
  infoGatheringGoodSum: number;
  /** Sum of `infoGathering` for minions and demons. */
  infoGatheringEvilSum: number;
  /** Total info index (all in-play characters). */
  infoGatheringSum: number;
  characterCount: number;
  /** Count of characters in the “good info” bucket (for bar scaling). */
  infoGoodRosterCount: number;
  /** Count of characters in the “evil info” bucket (for bar scaling). */
  infoEvilRosterCount: number;
}

export interface RosterScoreContributionEntry {
  id: string;
  name: string;
  value: number;
}

/** Per-character contributions for roster-level tooltips (only non-zero / meaningful rows per metric). */
export interface RosterScoreContributions {
  /** ST band 1–5 for each character (everyone in roster). */
  stComplexity: RosterScoreContributionEntry[];
  /** `lethalityPerCycle` > 0 only, highest first. */
  lethality: RosterScoreContributionEntry[];
  /** Good-side info index > 0 only. */
  infoGood: RosterScoreContributionEntry[];
  /** Evil-side info index > 0 only. */
  infoEvil: RosterScoreContributionEntry[];
}

/** Script / table “feel” from scored metrics. */
export interface ScriptFeel {
  rosterScores: ScriptRosterScoreFeel;
  contributions: RosterScoreContributions;
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
