import type { Character, PlayerCountEntry } from "../types";
import { filterByTeam } from "../utils/filters";
import playerCountsData from "@/data/playerCounts.json";

/**
 * Get supported player counts for a script
 */
export function getSupportedPlayerCounts(
  selectedIds: string[],
  characters: Character[]
): PlayerCountEntry[] {
  const selected = characters.filter((c) => selectedIds.includes(c.id));

  const tfCount = filterByTeam(selected, "townsfolk").length;
  const osCount = filterByTeam(selected, "outsider").length;
  const mnCount = filterByTeam(selected, "minion").length;
  const dmCount = filterByTeam(selected, "demon").length;

  const hasBaron = selectedIds.includes("baron");

  const counts = playerCountsData.counts as Record<
    string,
    { townsfolk: number; outsider: number; minion: number; demon: number }
  >;

  const results: PlayerCountEntry[] = [];

  for (let pc = 5; pc <= 15; pc++) {
    const req = counts[String(pc)];

    // Script needs req.townsfolk in-play TF + 3 unused TF for demon bluffs
    const needTF = req.townsfolk + 3;
    const needOS = req.outsider;
    const needMn = req.minion;

    const supported = tfCount >= needTF && osCount >= needOS && mnCount >= needMn && dmCount >= 1;

    const entry: PlayerCountEntry = {
      playerCount: pc,
      required: {
        townsfolk: req.townsfolk,
        outsider: req.outsider,
        minion: req.minion,
        demon: req.demon
      },
      supported
    };

    // Baron shifts 2 OS in, 2 TF out — show the variant distribution
    if (hasBaron) {
      entry.baronVariant = {
        townsfolk: req.townsfolk - 2,
        outsider: req.outsider + 2
      };
    }

    results.push(entry);
  }

  return results;
}
