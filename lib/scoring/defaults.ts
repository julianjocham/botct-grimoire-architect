import type { RawCharacter } from "@/types/character";
import type {
  CharacterScoreInputs,
  DaySurfaceArea,
  InfoGatheringInput,
  InfoType,
  NightWakePattern,
  ReminderStatefulness,
  StComplexityPartA,
  TimingPhase
} from "@/types/scoring";

const PASSIVE_OTHER_NIGHT_IDS = new Set(["tinker"]);

function abilityLooksLikeInfo(ability: string): boolean {
  const a = ability.toLowerCase();
  if (/when you learn that you died/.test(a)) return false;
  return (
    /\bstart knowing\b/.test(a) ||
    /\byou learn\b/.test(a) ||
    /\byou start knowing\b/.test(a) ||
    /\beach night\b.*\byou learn\b/.test(a) ||
    /\bsee the grimoire\b/.test(a) ||
    /\blook at the grimoire\b/.test(a) ||
    /\bviews the grimoire\b/.test(a)
  );
}

function inferNightWakePattern(c: RawCharacter): NightWakePattern {
  const fn = c.firstNight > 0;
  const on = c.otherNight > 0;
  if (PASSIVE_OTHER_NIGHT_IDS.has(c.id)) return "conditional";
  if (fn && on) return "multiple_phases";
  if (on) return "every_night";
  if (fn) return "first_only";
  return "none";
}

function inferReminderStatefulness(c: RawCharacter): ReminderStatefulness {
  const n = c.reminders?.length ?? 0;
  if (n === 0) return "stateless";
  if (n <= 2) return "few_tokens";
  if (n <= 4) return "many_tokens";
  return "persistent_alterations";
}

function inferTimingPhases(c: RawCharacter): TimingPhase[] {
  const phases: TimingPhase[] = [];
  if (c.firstNight > 0) phases.push("first_night");
  if (c.otherNight > 0) phases.push("other_nights");
  return phases;
}

function inferDaySurfaceArea(c: RawCharacter): DaySurfaceArea {
  const a = c.ability.toLowerCase();
  if (/\bpublicly\b/.test(a) && /nomination|execute|execution|vote/.test(a)) return "public_mechanic";
  if (c.id === "mayor" || c.id === "virgin") return "public_mechanic";
  if (/\bonce per game\b.*\bday\b/.test(a) || /\bduring the day\b.*\bonce\b/.test(a)) return "limited_uses";
  if (/\beach day\b/.test(a) && /choose|point|mark/.test(a)) return "limited_uses";
  if (/\bpassive\b/.test(a)) return "passive";
  return "none";
}

function inferGmDecisionsPerWake(c: RawCharacter): number {
  if (c.firstNight === 0 && c.otherNight === 0) return 0;
  if (c.team === "demon" && /choose/.test(c.ability.toLowerCase())) return 1;
  if (c.team === "minion" || c.team === "townsfolk" || c.team === "outsider") {
    if (c.otherNight > 0 || c.firstNight > 0) return 1;
  }
  return 0;
}

function inferDependencyOnHiddenFacts(c: RawCharacter): number {
  if (c.team === "demon") return 2;
  if (c.id === "spy" || c.id === "widow") return 2;
  if (abilityLooksLikeInfo(c.ability)) return 1;
  return 0;
}

function inferInfoBlock(c: RawCharacter): InfoGatheringInput {
  const looks = abilityLooksLikeInfo(c.ability);
  const fn = c.firstNight > 0;
  const on = c.otherNight > 0;

  let infoType: InfoType = "none";
  let firstNightFacts = 0;
  let recurringInfoPerNight = 0;
  let dayInfoEventsPerDay = 0;

  if (c.id === "spy" || c.id === "widow") {
    infoType = "full_identity";
    if (fn) firstNightFacts = 1;
    if (c.id === "spy" && on) recurringInfoPerNight = 1;
    return {
      infoType,
      firstNightFacts,
      recurringInfoPerNight,
      dayInfoEventsPerDay,
      sobrietyGating: false
    };
  }

  if (!looks && c.team !== "townsfolk" && c.team !== "outsider") {
    return { infoType: "none", firstNightFacts: 0, recurringInfoPerNight: 0, dayInfoEventsPerDay: 0, sobrietyGating: false };
  }

  if (!looks) {
    return { infoType: "none", firstNightFacts: 0, recurringInfoPerNight: 0, dayInfoEventsPerDay: 0, sobrietyGating: false };
  }

  if (/how many pairs|finger signal|0, 1, 2|number of|how many dead/.test(c.ability.toLowerCase())) infoType = "fact";
  else if (/either is|either of|demon\b.*\byou\b/.test(c.ability.toLowerCase())) infoType = "comparison";
  else if (/character token|which character|particular /.test(c.ability.toLowerCase())) infoType = "subset";
  else if (/register|reads as|appears as/.test(c.ability.toLowerCase())) infoType = "register";
  else infoType = "subset";

  if (fn && !on) {
    firstNightFacts = 1;
  } else if (on && !fn) {
    recurringInfoPerNight = 1;
  } else if (fn && on) {
    recurringInfoPerNight = 1;
  } else if (!fn && !on) {
    if (/\beach day\b/.test(c.ability.toLowerCase()) && /\blearn\b/.test(c.ability.toLowerCase())) {
      dayInfoEventsPerDay = 1;
    }
  }

  const sobrietyGating = c.team === "townsfolk" || c.team === "outsider";

  return {
    infoType,
    firstNightFacts,
    recurringInfoPerNight,
    dayInfoEventsPerDay,
    sobrietyGating
  };
}

function inferLethality(c: RawCharacter): CharacterScoreInputs["lethality"] {
  if (c.team === "demon") {
    return { maxKillsAttributedPerNight: 1, maxKillsAttributedPerDay: 0 };
  }
  return { maxKillsAttributedPerNight: 0, maxKillsAttributedPerDay: 0 };
}

function buildStPartA(c: RawCharacter): StComplexityPartA {
  return {
    nightWakePattern: inferNightWakePattern(c),
    daySurfaceArea: inferDaySurfaceArea(c),
    gmDecisionsPerWake: inferGmDecisionsPerWake(c),
    reminderStatefulness: inferReminderStatefulness(c),
    timingPhases: inferTimingPhases(c),
    dependencyOnHiddenFacts: inferDependencyOnHiddenFacts(c)
  };
}

export function defaultScoreInputsFromRaw(c: RawCharacter): CharacterScoreInputs {
  return {
    st: buildStPartA(c),
    lethality: inferLethality(c),
    info: inferInfoBlock(c)
  };
}
