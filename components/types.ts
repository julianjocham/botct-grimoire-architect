import {
  Character,
  CompositionWarning,
  EditionKey,
  EffectiveStrength,
  Interaction,
  InteractionHint,
  NightStep,
  PlayerCountEntry,
  ScriptAnalysis,
  ScriptRecommendation,
} from "@/lib/types";

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

export interface ScriptHealthBarProps {
  analysis: ScriptAnalysis;
}

export interface CharacterPoolProps {
  pool: Character[];
  allCharacters: Character[];
  selectedIds: string[];
  searchQuery: string;
  onSearch: (q: string) => void;
  onToggle: (id: string) => void;
  onDetail: (id: string) => void;
}

export interface ScriptStepProps {
  scriptSource: EditionKey | null;
  scriptIds: string[];
  allCharacters: Character[];
  editionPools: { tb: Character[]; bmr: Character[]; snv: Character[] };
  searchQuery: string;
  onSelectEdition: (ed: "tb" | "bmr" | "snv", ids: string[]) => void;
  onSelectCustom: () => void;
  onToggleScriptChar: (id: string) => void;
  onContinue: () => void;
  onSearch: (q: string) => void;
  onDetail: (id: string) => void;
}

export interface NightOrderProps {
  steps: NightStep[];
  phase: "first" | "other";
  onPhaseChange: (phase: "first" | "other") => void;
}

export interface InteractionFeedProps {
  hints: InteractionHint[];
  characters: Character[];
  onDetail: (id: string) => void;
}

export interface GamePanelProps {
  playerCount: number | null;
  onSetPlayerCount: (count: number | null) => void;
  gameCharacterIds: string[];
  selectedIds: string[];
  allCharacters: Character[];
  onToggleGameCharacter: (id: string) => void;
  onClearGame: () => void;
  onDetail: (id: string) => void;
}

export interface CompositionPanelProps {
  warnings: CompositionWarning[];
  recommendations: ScriptRecommendation[];
  allCharacters: Character[];
  selectedIds: string[];
  playerCountSupport: PlayerCountEntry[];
  selectedPlayerCount?: number | null;
  onToggle: (id: string) => void;
  onDetail: (id: string) => void;
}
