import type { CharacterScoreInputs } from "@/types/scoring";

/** Curated corrections where defaults (demon = 1 kill/night, heuristics) are wrong. */
export const BUILTIN_SCORE_OVERRIDES: Record<string, Partial<CharacterScoreInputs>> = {
  // Demons — night kill budget per “charged” night (worst case you score for script feel).
  po: { lethality: { maxKillsAttributedPerNight: 3, maxKillsAttributedPerDay: 0 } },
  shabaloth: { lethality: { maxKillsAttributedPerNight: 2, maxKillsAttributedPerDay: 0 } },
  alhadikhia: { lethality: { maxKillsAttributedPerNight: 3, maxKillsAttributedPerDay: 0 } },
  leviathan: { lethality: { maxKillsAttributedPerNight: 0, maxKillsAttributedPerDay: 0 } },
  riot: { lethality: { maxKillsAttributedPerNight: 0, maxKillsAttributedPerDay: 6 } },
  nodashii: { lethality: { maxKillsAttributedPerNight: 2, maxKillsAttributedPerDay: 0 } },
  minstrel: { lethality: { maxKillsAttributedPerNight: 2, maxKillsAttributedPerDay: 0 } },

  poisoner: { lethality: { maxKillsAttributedPerNight: 0, maxKillsAttributedPerDay: 0 } },
  cerenovus: { lethality: { maxKillsAttributedPerNight: 0, maxKillsAttributedPerDay: 0 } },
  witch: { lethality: { maxKillsAttributedPerNight: 0, maxKillsAttributedPerDay: 1 } },
  assassin: { lethality: { maxKillsAttributedPerNight: 1, maxKillsAttributedPerDay: 0 } },
  godfather: { lethality: { maxKillsAttributedPerNight: 0, maxKillsAttributedPerDay: 1 } },

  huntsman: { lethality: { maxKillsAttributedPerNight: 1, maxKillsAttributedPerDay: 0 } },
  slayer: { lethality: { maxKillsAttributedPerNight: 0, maxKillsAttributedPerDay: 1 } },
  virgin: { lethality: { maxKillsAttributedPerNight: 0, maxKillsAttributedPerDay: 1 } },
  gossip: { lethality: { maxKillsAttributedPerNight: 0, maxKillsAttributedPerDay: 2 } },
  moonchild: { lethality: { maxKillsAttributedPerNight: 1, maxKillsAttributedPerDay: 0 } }
};
