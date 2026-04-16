import { getCategoryCoverage } from "./coverage";
import { AbilityCategory, Character, ScriptRecommendation } from "@/types";

const GOOD_CATEGORY_LABELS: Partial<Record<AbilityCategory, string>> = {
  "info-start": "first-night info",
  "info-recurring": "recurring nightly info",
  "info-on-death": "death-triggered info",
  "info-conditional": "conditional info",
  "day-ability": "day abilities",
  "once-per-game": "once-per-game power",
  "protection": "protection roles"
};

const EVIL_CATEGORY_LABELS: Partial<Record<AbilityCategory, string>> = {
  "info-disruption": "misinformation (Poisoner/Spy/Drunk)",
  "setup-modifier": "setup modifiers (Baron/Godfather)",
  "demon-resilience": "demon resilience",
  "lethal-evil": "extra kill power",
  "social-evil": "social disruption (Witch/Cerenovus)",
  "character-change": "character-swap chaos"
};

const GOOD_CATEGORIES: AbilityCategory[] = ["info-start", "info-recurring", "protection", "day-ability"];

const EVIL_CATEGORIES: AbilityCategory[] = ["info-disruption", "demon-resilience"];

/**
 * Get script recommendations for filling gaps
 */
export function getRecommendations(selectedIds: string[], characters: Character[]): ScriptRecommendation[] {
  const coverage = getCategoryCoverage(selectedIds, characters);
  const recommendations: ScriptRecommendation[] = [];
  const selected = characters.filter((c) => selectedIds.includes(c.id));

  // Check good team gaps
  for (const cat of GOOD_CATEGORIES) {
    if (!coverage.good[cat]) {
      const candidates = characters
        .filter(
          (c) =>
            c.abilityCategory === cat &&
            (c.team === "townsfolk" || c.team === "outsider") &&
            !selectedIds.includes(c.id)
        )
        .slice(0, 3);

      if (candidates.length > 0) {
        recommendations.push({
          category: cat,
          reason: `No ${GOOD_CATEGORY_LABELS[cat]} on the script.`,
          severity: cat === "protection" || cat === "info-recurring" ? "important" : "tip",
          suggestedIds: candidates.map((c) => c.id)
        });
      }
    }
  }

  // Check evil team gaps (only if good has strong info)
  const hasGoodInfo = (coverage.good["info-recurring"]?.length ?? 0) >= 2;

  for (const cat of EVIL_CATEGORIES) {
    if (!coverage.evil[cat] && hasGoodInfo) {
      const candidates = characters
        .filter(
          (c) => c.abilityCategory === cat && (c.team === "minion" || c.team === "demon") && !selectedIds.includes(c.id)
        )
        .slice(0, 3);

      if (candidates.length > 0) {
        recommendations.push({
          category: cat,
          reason: `Good has strong info but evil lacks ${EVIL_CATEGORY_LABELS[cat]}.`,
          severity: "important",
          suggestedIds: candidates.map((c) => c.id)
        });
      }
    }
  }

  return recommendations;
}
