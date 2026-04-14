import type {
  Character,
  CharacterTag,
  Interaction,
  NightStep,
  InteractionHint,
  CompositionWarning,
  ScriptFeel,
  NightComplexityReport,
  EffectiveStrength,
  CategoryCoverage,
  ScriptRecommendation,
  ScriptAnalysis,
  AbilityCategory,
  PlayerCountEntry
} from "./types";
import playerCountsData from "@/data/playerCounts.json";

// ─── Night Order ────────────────────────────────────────────────────────────

export function generateNightOrder(
  characters: Character[],
  selectedIds: string[],
  phase: "first" | "other",
  interactions: Interaction[]
): NightStep[] {
  const field = phase === "first" ? "firstNight" : "otherNight";
  const reminderField = phase === "first" ? "firstNightReminder" : "otherNightReminder";

  return characters
    .filter((c) => selectedIds.includes(c.id) && c[field] > 0)
    .sort((a, b) => a[field] - b[field])
    .map((c, index) => ({
      order: index + 1,
      character: c,
      reminder: c[reminderField],
      contextHints: getNightContextHints(c.id, selectedIds, interactions)
    }));
}

function getNightContextHints(characterId: string, selectedIds: string[], interactions: Interaction[]): string[] {
  const hints: string[] = [];
  const enrich = interactions.filter(
    (i) =>
      (i.a === characterId || i.b === characterId) &&
      selectedIds.includes(i.a) &&
      selectedIds.includes(i.b) &&
      i.severity !== "tip"
  );
  for (const interaction of enrich) {
    hints.push(interaction.description);
  }
  return hints;
}

// ─── Effective Strength ─────────────────────────────────────────────────────

// A rule that adjusts a character's effective strength based on the ability
// types present elsewhere in the selection — no named character pairings needed.
// Target criteria are ANDed; within each field (tags/categories) it is OR.
interface StrengthModifierRule {
  targetCategories?: AbilityCategory[];
  targetTags?: CharacterTag[];
  targetTeams?: string[];
  triggerCategories?: AbilityCategory[];
  triggerTags?: CharacterTag[];
  triggerTeams?: string[];
  impactPerMatch: number;
  maxMatches?: number;
  reason: string;
}

const STRENGTH_MODIFIER_RULES: StrengthModifierRule[] = [
  // ── Info roles vs. drunk/poison sources ──────────────────────────────────
  // Any character that can drunk or poison others reduces info reliability
  {
    targetCategories: ["info-start", "info-recurring", "info-on-death", "info-conditional"],
    triggerTags: ["poison-drunk"],
    impactPerMatch: -10,
    reason: "drunk/poison source undermines info reliability"
  },
  // Recurring info roles get extra damage — they need to work every single night
  {
    targetCategories: ["info-recurring"],
    triggerTags: ["poison-drunk"],
    impactPerMatch: -5,
    reason: "recurring info is especially exposed to permanent drunk/poison"
  },
  // Info-disruption roles (Vortox, Spy, Drunk) warp info without direct poisoning
  {
    targetCategories: ["info-start", "info-recurring", "info-on-death", "info-conditional"],
    triggerCategories: ["info-disruption"],
    impactPerMatch: -5,
    reason: "info-disruption role warps or inverts information"
  },

  // ── Protection roles vs. bypass sources ──────────────────────────────────
  // Drunk/poison silently breaks protection — Monk fails, Soldier dies
  {
    targetCategories: ["protection"],
    triggerTags: ["poison-drunk"],
    impactPerMatch: -10,
    reason: "drunk/poison silently breaks protection"
  },
  // Multiple kill sources reduce how much a single protection role can cover
  {
    targetCategories: ["protection"],
    triggerTags: ["lethal-evil"],
    impactPerMatch: -8,
    maxMatches: 2,
    reason: "extra kill sources reduce single-target protection coverage"
  },

  // ── Once-per-game roles vs. drunk/poison ─────────────────────────────────
  {
    targetCategories: ["once-per-game"],
    triggerTags: ["poison-drunk"],
    impactPerMatch: -8,
    maxMatches: 1,
    reason: "may be drunk/poisoned at the moment of use"
  },

  // ── Demons gain power from demon-resilience support ───────────────────────
  {
    targetTeams: ["demon"],
    triggerTags: ["demon-resilience"],
    impactPerMatch: 10,
    reason: "demon-resilience minion extends demon survival"
  },

  // ── Demon-resilience roles are only active when a demon is in play ────────
  {
    targetTags: ["demon-resilience"],
    triggerTeams: ["demon"],
    impactPerMatch: 5,
    reason: "demon presence activates resilience abilities"
  },

  // ── Info-disruption gains value from recurring info roles to target ───────
  {
    targetCategories: ["info-disruption"],
    triggerCategories: ["info-recurring"],
    impactPerMatch: 5,
    maxMatches: 3,
    reason: "more recurring info targets to disrupt"
  }
];

function matchesTarget(c: Character, rule: StrengthModifierRule): boolean {
  if (rule.targetCategories && !rule.targetCategories.includes(c.abilityCategory)) return false;
  if (rule.targetTags && !rule.targetTags.some((t) => c.tags?.includes(t))) return false;
  if (rule.targetTeams && !rule.targetTeams.includes(c.team)) return false;
  return true;
}

function matchesTrigger(c: Character, rule: StrengthModifierRule): boolean {
  if (rule.triggerCategories && !rule.triggerCategories.includes(c.abilityCategory)) return false;
  if (rule.triggerTags && !rule.triggerTags.some((t) => c.tags?.includes(t))) return false;
  if (rule.triggerTeams && !rule.triggerTeams.includes(c.team)) return false;
  return true;
}

export function calculateEffectiveStrength(
  characterId: string,
  selectedIds: string[],
  characters: Character[]
): EffectiveStrength {
  const character = characters.find((c) => c.id === characterId);
  if (!character) return { baseStrength: 0, modifier: 0, effectiveStrength: 0, reasons: [] };

  const base = character.strength?.composite ?? 0;
  const others = characters.filter((c) => selectedIds.includes(c.id) && c.id !== characterId);
  const reasons: EffectiveStrength["reasons"] = [];
  let modifier = 0;

  for (const rule of STRENGTH_MODIFIER_RULES) {
    if (!matchesTarget(character, rule)) continue;

    const triggers = others.filter((c) => matchesTrigger(c, rule));
    const matchCount = rule.maxMatches !== undefined
      ? Math.min(triggers.length, rule.maxMatches)
      : triggers.length;

    for (let i = 0; i < matchCount; i++) {
      modifier += rule.impactPerMatch;
      reasons.push({
        characterId: triggers[i].id,
        impact: rule.impactPerMatch,
        description: rule.reason
      });
    }
  }

  return {
    baseStrength: base,
    modifier,
    effectiveStrength: Math.max(-100, Math.min(100, base + modifier)),
    reasons
  };
}

// ─── Interaction Feed ────────────────────────────────────────────────────────

export function analyzeInteractions(selectedIds: string[], interactions: Interaction[]): InteractionHint[] {
  const hints: InteractionHint[] = [];

  for (const interaction of interactions) {
    if (selectedIds.includes(interaction.a) && selectedIds.includes(interaction.b)) {
      hints.push({
        severity: interaction.severity,
        involvedCharacters: [interaction.a, interaction.b],
        title: interaction.title,
        description: interaction.description,
        category: interaction.category
      });
    }
  }

  // Sort: critical first, then important, then tips
  return hints.sort((a, b) => {
    const order = { critical: 0, important: 1, tip: 2 };
    return order[a.severity] - order[b.severity];
  });
}

// ─── Composition Warnings ────────────────────────────────────────────────────

/**
 * mode "script" — checks full-script requirements (13 TF, 4 OS, 4 Mn, 1 Dm).
 *                 Used when building or reviewing the script pool.
 * mode "game"   — skips count-requirement warnings; counts are set by player
 *                 count and are always correct by construction in Step 2.
 *                 Focuses only on balance / thematic issues.
 */
export function analyzeComposition(
  selectedIds: string[],
  characters: Character[],
  mode: "script" | "game" = "script"
): CompositionWarning[] {
  const warnings: CompositionWarning[] = [];
  const selected = characters.filter((c) => selectedIds.includes(c.id));

  const byTeam = (team: string) => selected.filter((c) => c.team === team);
  const demons = byTeam("demon");

  if (mode === "script") {
    // Full-script requirements — only relevant when building/reviewing the script pool
    const townsfolk = byTeam("townsfolk");
    const outsiders = byTeam("outsider");
    const minions = byTeam("minion");

    if (townsfolk.length < 9)
      warnings.push({
        type: "too-few-townsfolk",
        message: `Only ${townsfolk.length} Townsfolk. A full script needs at least 9 (ideally 13) to support games up to 15 players.`,
        severity: "important"
      });
    if (outsiders.length < 2)
      warnings.push({
        type: "too-few-outsiders",
        message: `Only ${outsiders.length} Outsiders. A full script needs at least 2 (ideally 4).`,
        severity: "important"
      });
    if (minions.length < 2)
      warnings.push({
        type: "too-few-minions",
        message: `Only ${minions.length} Minions. A full script needs at least 2 (ideally 4).`,
        severity: "important"
      });
    if (demons.length === 0)
      warnings.push({
        type: "no-demon",
        message: "No Demon on the script. You need at least one.",
        severity: "critical"
      });
  }

  // ── Game-balance warnings (apply in both modes) ──────────────────────────

  // Info saturation
  const infoRecurring = selected.filter(
    (c) => c.tags?.includes("info-recurring") && c.team !== "demon" && c.team !== "minion"
  );
  if (infoRecurring.length > 5)
    warnings.push({
      type: "high-info",
      message: `High info density (${infoRecurring.length} recurring info roles). Evil needs strong misinformation tools or good will solve the puzzle quickly.`,
      severity: "tip"
    });
  if (infoRecurring.length === 0 && selected.filter((c) => c.tags?.includes("info-first-night")).length < 2)
    warnings.push({
      type: "low-info",
      message:
        "Very low information. Good team is flying blind — ensure there are day abilities or other ways to find evil.",
      severity: "important"
    });

  // Protection
  const protection = selected.filter((c) => c.tags?.includes("protection") && c.team === "townsfolk");
  if (protection.length === 0)
    warnings.push({
      type: "no-protection",
      message: "No protection roles on this script. Demon kills will be unimpeded every night.",
      severity: "tip"
    });

  // Misinformation
  const misinformation = selected.filter(
    (c) => c.tags?.includes("info-disruption") || c.tags?.includes("poison-drunk")
  );
  if (misinformation.length === 0 && infoRecurring.length >= 2)
    warnings.push({
      type: "no-misinformation",
      message:
        "Good team has strong info but evil has no misinformation tools. Consider adding Poisoner, Spy, or Drunk.",
      severity: "important"
    });

  // Setup modifiers
  const setupMods = selected.filter((c) => c.setup);
  if (setupMods.length > 2)
    warnings.push({
      type: "excessive-setup-modifiers",
      message: `${setupMods.length} setup-modifying characters (${setupMods.map((c) => c.name).join(", ")}). Outsider count may be confusing to track.`,
      severity: "important"
    });

  // Day abilities
  const dayAbilities = selected.filter((c) => c.tags?.includes("day-ability") && c.team === "townsfolk");
  if (dayAbilities.length === 0)
    warnings.push({
      type: "no-day-abilities",
      message: "No day-ability Townsfolk. Daytime play is purely social with no mechanical tools.",
      severity: "tip"
    });

  return warnings;
}

// ─── Script Feel ─────────────────────────────────────────────────────────────

export function calculateScriptFeel(selectedIds: string[], characters: Character[]): ScriptFeel {
  const selected = characters.filter((c) => selectedIds.includes(c.id));

  // Info level: count info-producing good roles
  const infoRoles = selected.filter(
    (c) =>
      c.team === "townsfolk" &&
      (c.tags?.includes("info-first-night") ||
        c.tags?.includes("info-recurring") ||
        c.tags?.includes("info-on-death") ||
        c.tags?.includes("info-conditional"))
  ).length;

  const infoLevel: ScriptFeel["infoLevel"] =
    infoRoles >= 8
      ? "Flooded"
      : infoRoles >= 5
        ? "High"
        : infoRoles >= 3
          ? "Moderate"
          : infoRoles >= 1
            ? "Low"
            : "Blind";

  // Lethality: count night-kill sources
  const killSources = selected.filter(
    (c) => c.team === "demon" || c.tags?.includes("lethal-evil") || c.tags?.includes("lethal-good")
  ).length;

  const lethalityLevel: ScriptFeel["lethalityLevel"] =
    killSources >= 5 ? "Massacre" : killSources >= 3 ? "Deadly" : killSources >= 2 ? "Standard" : "Gentle";

  // Chaos: character swaps, alignment changes, madness
  const chaosTags = ["character-change", "alignment-change", "madness"] as const;
  const chaosRoles = selected.filter((c) => chaosTags.some((tag) => c.tags?.includes(tag))).length;

  const chaosLevel: ScriptFeel["chaosLevel"] =
    chaosRoles >= 4 ? "Pandemonium" : chaosRoles >= 2 ? "Chaotic" : chaosRoles >= 1 ? "Moderate" : "Orderly";

  // ST workload: sum of stComplexity for selected chars
  const complexitySum = selected.reduce((sum, c) => sum + (c.stComplexity ?? 2), 0);
  const avgComplexity = selected.length > 0 ? complexitySum / selected.length : 0;

  const stWorkload: ScriptFeel["stWorkload"] =
    avgComplexity >= 4 ? "Exhausting" : avgComplexity >= 3 ? "Heavy" : avgComplexity >= 2 ? "Moderate" : "Light";

  const summary = `${infoLevel.toUpperCase()} info, ${lethalityLevel.toUpperCase()} lethality, ${chaosLevel.toUpperCase()} chaos. ST workload: ${stWorkload.toUpperCase()}.`;

  return { infoLevel, lethalityLevel, chaosLevel, stWorkload, summary };
}

// ─── Night Complexity ─────────────────────────────────────────────────────────

export function calculateNightComplexity(selectedIds: string[], characters: Character[]): NightComplexityReport {
  const selected = characters.filter((c) => selectedIds.includes(c.id));
  const firstNightSteps = selected.filter((c) => c.firstNight > 0).length;
  const otherNightSteps = selected.filter((c) => c.otherNight > 0).length;
  const stateTrackingRoles = selected.filter((c) => (c.stComplexity ?? 1) >= 4).map((c) => c.name);

  const warnings: string[] = [];
  if (otherNightSteps > 8) warnings.push(`${otherNightSteps} actions per night — allow extra time.`);
  if (stateTrackingRoles.length > 2)
    warnings.push(`${stateTrackingRoles.length} state-tracking roles require ongoing bookkeeping.`);

  const complexityRating: NightComplexityReport["complexityRating"] =
    otherNightSteps >= 8 || stateTrackingRoles.length >= 3
      ? "Expert"
      : otherNightSteps >= 5 || stateTrackingRoles.length >= 2
        ? "Advanced"
        : otherNightSteps >= 3
          ? "Intermediate"
          : "Beginner";

  return {
    firstNightSteps,
    otherNightSteps,
    stateTrackingRoles,
    complexityRating,
    warnings
  };
}

// ─── Category Coverage ────────────────────────────────────────────────────────

export function getCategoryCoverage(selectedIds: string[], characters: Character[]): CategoryCoverage {
  const selected = characters.filter((c) => selectedIds.includes(c.id));

  const goodCategories: AbilityCategory[] = [
    "info-start",
    "info-recurring",
    "info-on-death",
    "info-conditional",
    "day-ability",
    "once-per-game",
    "protection"
  ];
  const evilCategories: AbilityCategory[] = [
    "info-disruption",
    "setup-modifier",
    "demon-resilience",
    "lethal-evil",
    "social-evil",
    "character-change"
  ];

  const goodCoverage: Partial<Record<AbilityCategory, string[]>> = {};
  const evilCoverage: Partial<Record<AbilityCategory, string[]>> = {};

  for (const cat of goodCategories) {
    const chars = selected
      .filter((c) => c.abilityCategory === cat && (c.team === "townsfolk" || c.team === "outsider"))
      .map((c) => c.name);
    if (chars.length > 0) goodCoverage[cat] = chars;
  }

  for (const cat of evilCategories) {
    const chars = selected
      .filter((c) => c.abilityCategory === cat && (c.team === "minion" || c.team === "demon"))
      .map((c) => c.name);
    if (chars.length > 0) evilCoverage[cat] = chars;
  }

  return { good: goodCoverage, evil: evilCoverage };
}

// ─── Recommendations ──────────────────────────────────────────────────────────

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

export function getRecommendations(selectedIds: string[], characters: Character[]): ScriptRecommendation[] {
  const coverage = getCategoryCoverage(selectedIds, characters);
  const recommendations: ScriptRecommendation[] = [];
  const selected = characters.filter((c) => selectedIds.includes(c.id));

  const goodCategories: AbilityCategory[] = ["info-start", "info-recurring", "protection", "day-ability"];
  const evilCategories: AbilityCategory[] = ["info-disruption", "demon-resilience"];

  for (const cat of goodCategories) {
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
          reason: `No ${GOOD_CATEGORY_LABELS[cat]} on the script. Good team may lack tools in this area.`,
          severity: cat === "protection" || cat === "info-recurring" ? "important" : "tip",
          suggestedIds: candidates.map((c) => c.id)
        });
      }
    }
  }

  for (const cat of evilCategories) {
    const hasGoodInfo = (coverage.good["info-recurring"]?.length ?? 0) >= 2;
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

// ─── Player Count Support ─────────────────────────────────────────────────────

export function getSupportedPlayerCounts(selectedIds: string[], characters: Character[]): PlayerCountEntry[] {
  const selected = characters.filter((c) => selectedIds.includes(c.id));
  const tfCount = selected.filter((c) => c.team === "townsfolk").length;
  const osCount = selected.filter((c) => c.team === "outsider").length;
  const mnCount = selected.filter((c) => c.team === "minion").length;
  const dmCount = selected.filter((c) => c.team === "demon").length;

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

// ─── Strength Totals ──────────────────────────────────────────────────────────

export function calculateStrengthTotals(
  selectedIds: string[],
  characters: Character[]
): { good: number; evil: number } {
  const selected = characters.filter((c) => selectedIds.includes(c.id));
  const good = selected
    .filter((c) => c.team === "townsfolk" || c.team === "outsider")
    .reduce((sum, c) => sum + (c.strength?.composite ?? 0), 0);
  const evil = selected
    .filter((c) => c.team === "minion" || c.team === "demon")
    .reduce((sum, c) => sum + (c.strength?.composite ?? 0), 0);
  return { good, evil };
}

// ─── Full Analysis ─────────────────────────────────────────────────────────────

export function analyzeScript(
  selectedIds: string[],
  characters: Character[],
  interactions: Interaction[],
  mode: "script" | "game" = "script"
): ScriptAnalysis {
  const { good, evil } = calculateStrengthTotals(selectedIds, characters);
  return {
    interactionHints: analyzeInteractions(selectedIds, interactions),
    compositionWarnings: analyzeComposition(selectedIds, characters, mode),
    nightOrder: {
      first: generateNightOrder(characters, selectedIds, "first", interactions),
      other: generateNightOrder(characters, selectedIds, "other", interactions)
    },
    nightComplexity: calculateNightComplexity(selectedIds, characters),
    scriptFeel: calculateScriptFeel(selectedIds, characters),
    categoryCoverage: getCategoryCoverage(selectedIds, characters),
    recommendations: getRecommendations(selectedIds, characters),
    goodStrengthTotal: good,
    evilStrengthTotal: evil,
    playerCountSupport: getSupportedPlayerCounts(selectedIds, characters)
  };
}
