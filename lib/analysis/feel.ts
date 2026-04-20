import {
  Character,
  RosterScoreContributionEntry,
  RosterScoreContributions,
  ScriptFeel,
  ScriptRosterScoreFeel
} from "@/types";

const BAR_SEGMENTS_DEFAULT = 12;
const BAR_SEGMENTS_COMPACT = 6;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function isGoodInfoSide(team: Character["team"]): boolean {
  return team === "townsfolk" || team === "outsider" || team === "traveler";
}

function isEvilInfoSide(team: Character["team"]): boolean {
  return team === "minion" || team === "demon";
}

function sortContribDesc(a: RosterScoreContributionEntry, b: RosterScoreContributionEntry): number {
  if (b.value !== a.value) return b.value - a.value;
  return a.name.localeCompare(b.name);
}

function buildContributions(selected: Character[]): RosterScoreContributions {
  const stComplexity: RosterScoreContributionEntry[] = selected
    .filter((c) => c.stComplexity > 1)
    .map((c) => ({ id: c.id, name: c.name, value: c.stComplexity }))
    .sort(sortContribDesc);

  const lethality: RosterScoreContributionEntry[] = selected
    .filter((c) => c.lethalityPerCycle > 0)
    .map((c) => ({ id: c.id, name: c.name, value: round1(c.lethalityPerCycle) }))
    .sort(sortContribDesc);

  const infoGood: RosterScoreContributionEntry[] = selected
    .filter((c) => isGoodInfoSide(c.team) && c.infoGathering > 0)
    .map((c) => ({ id: c.id, name: c.name, value: round1(c.infoGathering) }))
    .sort(sortContribDesc);

  const infoEvil: RosterScoreContributionEntry[] = selected
    .filter((c) => isEvilInfoSide(c.team) && c.infoGathering > 0)
    .map((c) => ({ id: c.id, name: c.name, value: round1(c.infoGathering) }))
    .sort(sortContribDesc);

  return { stComplexity, lethality, infoGood, infoEvil };
}

function buildRosterScores(selected: Character[]): ScriptRosterScoreFeel {
  if (selected.length === 0) {
    return {
      stComplexitySum: 0,
      stComplexityAvg: 0,
      lethalityPerCycleSum: 0,
      infoGatheringGoodSum: 0,
      infoGatheringEvilSum: 0,
      infoGatheringSum: 0,
      characterCount: 0,
      infoGoodRosterCount: 0,
      infoEvilRosterCount: 0
    };
  }

  const goodSide = selected.filter((c) => isGoodInfoSide(c.team));
  const evilSide = selected.filter((c) => isEvilInfoSide(c.team));

  const infoGatheringGoodSum = round1(goodSide.reduce((s, c) => s + c.infoGathering, 0));
  const infoGatheringEvilSum = round1(evilSide.reduce((s, c) => s + c.infoGathering, 0));
  const infoGatheringSum = round1(selected.reduce((s, c) => s + c.infoGathering, 0));

  const stComplexitySum = selected.reduce((s, c) => s + c.stComplexity, 0);
  const lethalityPerCycleSum = round1(selected.reduce((s, c) => s + c.lethalityPerCycle, 0));

  return {
    stComplexitySum,
    stComplexityAvg: round1(stComplexitySum / selected.length),
    lethalityPerCycleSum,
    infoGatheringGoodSum,
    infoGatheringEvilSum,
    infoGatheringSum,
    characterCount: selected.length,
    infoGoodRosterCount: goodSide.length,
    infoEvilRosterCount: evilSide.length
  };
}

/**
 * Normalized fill (0–1) for bars. When the raw value is positive but tiny vs the cap, at least one segment
 * still lights so small totals (e.g. Σ lethality = 1) remain visible.
 */
function fillBar(value: number, denom: number, segments: number): number {
  if (value <= 0 || denom <= 0) return 0;
  const raw = Math.min(1, value / denom);
  const minFill = 1 / segments;
  return Math.max(minFill, raw);
}

export type ScoreFeelBarFills = {
  st: number;
  lethality: number;
  infoGood: number;
  infoEvil: number;
};

/**
 * Normalized fills for dashboard (12 segments) vs health strip (6 segments).
 */
export function scoreFeelBarFills(roster: ScriptRosterScoreFeel, segments = BAR_SEGMENTS_DEFAULT): ScoreFeelBarFills {
  if (roster.characterCount === 0) {
    return { st: 0, lethality: 0, infoGood: 0, infoEvil: 0 };
  }
  const n = roster.characterCount;
  const lethDenom = Math.max(1, n * 1.25);
  const goodDenom = Math.max(2, roster.infoGoodRosterCount * 3);
  const evilDenom = Math.max(2, roster.infoEvilRosterCount * 3);

  return {
    st: fillBar(roster.stComplexityAvg, 5, segments),
    lethality: fillBar(roster.lethalityPerCycleSum, lethDenom, segments),
    infoGood: fillBar(roster.infoGatheringGoodSum, goodDenom, segments),
    infoEvil: fillBar(roster.infoGatheringEvilSum, evilDenom, segments)
  };
}

export function scoreFeelBarFillsCompact(roster: ScriptRosterScoreFeel): ScoreFeelBarFills {
  return scoreFeelBarFills(roster, BAR_SEGMENTS_COMPACT);
}

/**
 * Roster “feel” from rule-based scores (ST complexity, lethality/cycle, good vs evil info index).
 */
export function calculateScriptFeel(selectedIds: string[], characters: Character[]): ScriptFeel {
  const selected = characters.filter((c) => selectedIds.includes(c.id));
  const rosterScores = buildRosterScores(selected);
  const contributions = buildContributions(selected);
  const { stComplexityAvg, lethalityPerCycleSum, infoGatheringGoodSum, infoGatheringEvilSum, characterCount } =
    rosterScores;

  const summary =
    characterCount === 0
      ? "No characters selected."
      : `Avg ST complexity ${stComplexityAvg}/5 (Σ${rosterScores.stComplexitySum}). Max kills/cycle Σ${lethalityPerCycleSum}. Good info Σ${infoGatheringGoodSum}, evil info Σ${infoGatheringEvilSum}.`;

  return { rosterScores, contributions, summary };
}
