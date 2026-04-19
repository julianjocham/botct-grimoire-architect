import { AbilityCategory, FeelBarConfig } from "@/types";

export const FEEL_COLOR: Record<string, string> = {
  Blind: "#c0392b",
  Low: "#e67e22",
  Moderate: "#b8965a",
  High: "#2a7fd4",
  Flooded: "#1a5fa8",
  Gentle: "#2d6a4f",
  Standard: "#b8965a",
  Deadly: "#e67e22",
  Massacre: "#c0392b",
  Orderly: "#2d6a4f",
  Chaotic: "#e67e22",
  Pandemonium: "#c0392b",
  Light: "#2d6a4f",
  Heavy: "#e67e22",
  Exhausting: "#c0392b"
};

export const FEEL_BARS: FeelBarConfig[] = [
  { key: "infoLevel", label: "Info", levels: ["Blind", "Low", "Moderate", "High", "Flooded"] },
  {
    key: "lethalityLevel",
    label: "Lethality",
    levels: ["Gentle", "Standard", "Deadly", "Massacre"]
  },
  { key: "chaosLevel", label: "Chaos", levels: ["Orderly", "Moderate", "Chaotic", "Pandemonium"] },
  { key: "stWorkload", label: "ST Load", levels: ["Light", "Moderate", "Heavy", "Exhausting"] }
];

export const EDITIONS = [
  {
    key: "tb" as const,
    name: "Trouble Brewing",
    tagline: "The classic beginner script — clear roles, straightforward deduction.",
    difficulty: "Beginner",
    diffColor: "#2d6a4f"
  },
  {
    key: "bmr" as const,
    name: "Bad Moon Rising",
    tagline: "Deadly and chaotic — multiple demons, surprising kill sources.",
    difficulty: "Intermediate",
    diffColor: "#d4a017"
  },
  {
    key: "snv" as const,
    name: "Sects & Violets",
    tagline: "Information overload — rich info roles clashing with clever evil.",
    difficulty: "Advanced",
    diffColor: "#c0392b"
  }
] as const;

export const GOOD_CATEGORIES: AbilityCategory[] = [
  "info-start",
  "info-recurring",
  "info-on-death",
  "info-conditional",
  "protection",
  "day-ability",
  "once-per-game",
  "lethal-good",
  "passive-good",
  "self-sacrifice",
  "resurrection",
  "nomination-trap",
  "exile-prevention",
  "execution-force",
  "ability-removal",
  "extra-action",
  "targeted-character-kill",
  "delayed-starting-info",
  "info-self-prove",
  "info-one-shot",
  "multi-character-change",
  "global-misinfo",
  "revenge",
  "game-ending",
  "game-altering",
  "rule-change",
  "character-swap"
];

export const EVIL_CATEGORIES: AbilityCategory[] = [
  "info-disruption",
  "info-evil",
  "setup-modifier",
  "demon-resilience",
  "lethal-evil",
  "social-evil",
  "support-evil",
  "passive-evil",
  "delayed-kill",
  "multi-kill",
  "conditional-lethal-evil",
  "conditional-character-change",
  "conditional-poison",
  "conditional-execution",
  "game-altering",
  "rule-change",
  "character-swap"
];

export const CAT_SHORT: Partial<Record<AbilityCategory, string>> = {
  "info-start": "Info (1st)",
  "info-recurring": "Info (Rec)",
  "info-on-death": "Info (Death)",
  "info-conditional": "Info (Cond)",
  "info-evil": "Evil Intel",
  "protection": "Protection",
  "day-ability": "Day Ability",
  "once-per-game": "Once/Game",
  "lethal-good": "Good Kill",
  "passive-good": "Passive Good",
  "info-disruption": "Misinfo",
  "setup-modifier": "Setup Mod",
  "demon-resilience": "Demon Res.",
  "lethal-evil": "Extra Kill",
  "social-evil": "Social Evil",
  "support-evil": "Evil Support",
  "passive-evil": "Passive Evil",
  "character-change": "Char Change",
  "alignment-change": "Align Change",
  "restriction": "Restriction",
  "execution-trap": "Exec Trap",
  "death-trigger": "Death Trig",
  "win-condition": "Win Cond",
  "passive": "Passive",
  "self-sacrifice": "Self-Sac",
  "resurrection": "Resurrect",
  "delayed-kill": "Delayed Kill",
  "multi-kill": "Multi-Kill",
  "nomination-trap": "Nom Trap",
  "exile-prevention": "Exile Prev",
  "execution-force": "Exec Force",
  "ability-removal": "Ability Rem",
  "game-altering": "Game-Alter",
  "rule-change": "Rule Change",
  "conditional-lethal-evil": "Cond Kill",
  "conditional-character-change": "Cond Char Chg",
  "conditional-poison": "Cond Poison",
  "conditional-execution": "Cond Exec",
  "extra-action": "Extra Action",
  "character-swap": "Char Swap",
  "revenge": "Revenge",
  "game-ending": "Game End",
  "targeted-character-kill": "Char Kill",
  "delayed-starting-info": "Delayed 1st",
  "info-self-prove": "Self-Prove",
  "info-one-shot": "Info (1x)",
  "multi-character-change": "Multi Char Chg",
  "global-misinfo": "Global Misinfo",
  "unknown": "Unknown"
};

// Specialized maps per dimension
export const INFO_LEVEL: Record<string, number> = {
  Blind: 0,
  Low: 1,
  Moderate: 2,
  High: 3,
  Flooded: 4
};
export const LETHAL_LEVEL: Record<string, number> = {
  Gentle: 0,
  Standard: 1,
  Deadly: 2,
  Massacre: 3
};
export const CHAOS_LEVEL: Record<string, number> = {
  Orderly: 0,
  Moderate: 1,
  Chaotic: 2,
  Pandemonium: 3
};
export const ST_LEVEL: Record<string, number> = { Light: 0, Moderate: 1, Heavy: 2, Exhausting: 3 };
