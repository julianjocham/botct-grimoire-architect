import { Character } from "./character";
import { Interaction } from "./interaction";

// ─── Edition ──────────────────────────────────────────────────────────────────

// Edition config from editions.json
export interface EditionConfig {
  name: string;
  description: string;
  characters: string[];
  travelers?: string[];
}

// ─── App / wizard state ───────────────────────────────────────────────────────

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

// ─── UI display config ────────────────────────────────────────────────────────

// Config for rendering feel-level bars in the UI
export interface FeelBarConfig {
  key: "infoLevel" | "lethalityLevel" | "chaosLevel" | "stWorkload";
  label: string;
  levels: string[];
}

// ─── Step component props ─────────────────────────────────────────────────────

export interface ScriptStepProps {
  scriptSource: EditionKey | null;
  scriptIds: string[];
  allCharacters: Character[];
  editionPools: { tb: Character[]; bmr: Character[]; snv: Character[] };
  searchQuery: string;
  onSelectEdition: (ed: string, ids: string[]) => void;
  onSelectCustom: () => void;
  onToggleScriptChar: (id: string) => void;
  onContinue: () => void;
  onSearch: (q: string) => void;
  onDetail: (id: string) => void;
}

export interface GameSetupStepProps {
  scriptSource: EditionKey | null;
  scriptIds: string[];
  playerCount: number | null;
  gameIds: string[];
  allCharacters: Character[];
  editionTravelers: Character[];
  onSetPlayerCount: (n: number | null) => void;
  onToggleGameChar: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onDetail: (id: string) => void;
}

export interface AnalysisSidebarProps {
  gameIds: string[];
  allCharacters: Character[];
}

export interface DashboardStepProps {
  scriptSource: EditionKey | null;
  scriptIds: string[];
  playerCount: number;
  gameIds: string[];
  allCharacters: Character[];
  editionTravelers: Character[];
  interactions: Interaction[];
  nightPhase: "first" | "other";
  onNightPhaseChange: (p: "first" | "other") => void;
  onDetail: (id: string) => void;
  onBackToSetup: () => void;
  onReset: () => void;
}
