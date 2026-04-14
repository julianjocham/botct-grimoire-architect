import { AbilityCategory, FeelBarConfig } from "@/lib/types";

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
  "protection",
  "day-ability",
  "once-per-game"
];

export const EVIL_CATEGORIES: AbilityCategory[] = [
  "info-disruption",
  "setup-modifier",
  "demon-resilience",
  "lethal-evil"
];

export const CAT_SHORT: Partial<Record<AbilityCategory, string>> = {
  "info-start": "Info (1st)",
  "info-recurring": "Info (Rec)",
  "info-on-death": "Info (Death)",
  "protection": "Protection",
  "day-ability": "Day Ability",
  "once-per-game": "Once/Game",
  "info-disruption": "Misinfo",
  "setup-modifier": "Setup Mod",
  "demon-resilience": "Demon Res.",
  "lethal-evil": "Extra Kill"
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
