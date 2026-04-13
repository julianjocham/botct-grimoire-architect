import playerCountsData from "@/data/playerCounts.json";

export const TEAM_ORDER = ["townsfolk", "outsider", "minion", "demon"] as const;

export const TEAM_LABEL: Record<string, string> = {
  townsfolk: "Townsfolk",
  outsider: "Outsiders",
  minion: "Minions",
  demon: "Demons",
};

export const TEAM_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  townsfolk: { border: "#2a4a7f", bg: "#0d1a2e", text: "#5b9bd5" },
  outsider: { border: "#4a2a7f", bg: "#1a0d2e", text: "#9b7fd5" },
  minion: { border: "#7f2a2a", bg: "#2e0d0d", text: "#d5825b" },
  demon: { border: "#7f1a1a", bg: "#2e0808", text: "#d55b5b" },
};

export const TEAM_ICON: Record<string, string> = {
  townsfolk: "👤",
  outsider: "👥",
  minion: "💀",
  demon: "🔴",
};

export const MAX_TARGETS = { townsfolk: 13, outsider: 4, minion: 4, demon: 1 };

export const COLORS = {
  townsfolk: "#2a7fd4",
  outsider: "#9b7fd5",
  minion: "#d5825b",
  demon: "#d55b5b",
};

export const SETUP_MODIFIERS: Record<
  string,
  { townsfolk?: number; outsider?: number; label: string }
> = {
  baron: { outsider: 2, townsfolk: -2, label: "Baron: +2 Outsiders, −2 Townsfolk" },
  godfather: { outsider: 1, townsfolk: -1, label: "Godfather: +1 Outsider, −1 Townsfolk" },
  vigormortis: { outsider: -1, townsfolk: 1, label: "Vigormortis: −1 Outsider, +1 Townsfolk" },
  fanggu: { outsider: 1, townsfolk: -1, label: "Fang Gu: +1 Outsider, −1 Townsfolk" },
  balloonist: { outsider: 1, townsfolk: -1, label: "Balloonist: +1 Outsider, −1 Townsfolk" },
};

export const RAW_COUNTS = playerCountsData.counts as Record<
  string,
  { townsfolk: number; outsider: number; minion: number; demon: number }
>;
