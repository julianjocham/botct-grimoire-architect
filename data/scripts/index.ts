import { PremadeScript, ScriptType } from "@/types";

import troubleBrewing from "./trouble-brewing.json";
import badMoonRising from "./bad-moon-rising.json";
import sectsAndViolets from "./sects-and-violets.json";
import laissezUnFaire from "./laissez-un-faire.json";
import frankensteinsMayor from "./frankensteins-mayor.json";
import aLleechOfDistrust from "./a-lleech-of-distrust.json";
import noGreaterJoy from "./no-greater-joy.json";
import raceToTheBottom from "./race-to-the-bottom.json";
import gaslightGatekeepGiggle from "./gaslight-gatekeep-giggle.json";
import nobodyFuckingMove from "./nobody-fucking-move.json";
import catfishing from "./catfishing.json";
import extensionCord from "./extension-cord.json";
import noRolesBarred from "./no-roles-barred.json";
import everyoneCanPlay from "./everyone-can-play.json";
import trust from "./trust.json";
import theMidnightOasis from "./the-midnight-oasis.json";
import piesBaking from "./pies-baking.json";
import uncertainDeath from "./uncertain-death.json";
import haroldHoltsRevenge from "./harold-holts-revenge.json";
import hideAndSeek from "./hide-and-seek.json";

type ScriptJson = [{ id: "_meta"; name: string; type: string; author?: string }, ...string[]];

function parseScript(id: string, raw: ScriptJson): PremadeScript {
  const [meta, ...characters] = raw;
  return { id, name: meta.name, type: meta.type as ScriptType, author: meta.author, characters };
}

export const premadeScripts: PremadeScript[] = [
  parseScript("trouble-brewing", troubleBrewing as ScriptJson),
  parseScript("bad-moon-rising", badMoonRising as ScriptJson),
  parseScript("sects-and-violets", sectsAndViolets as ScriptJson),
  parseScript("laissez-un-faire", laissezUnFaire as ScriptJson),
  parseScript("frankensteins-mayor", frankensteinsMayor as ScriptJson),
  parseScript("a-lleech-of-distrust", aLleechOfDistrust as ScriptJson),
  parseScript("no-greater-joy", noGreaterJoy as ScriptJson),
  parseScript("race-to-the-bottom", raceToTheBottom as ScriptJson),
  parseScript("gaslight-gatekeep-giggle", gaslightGatekeepGiggle as ScriptJson),
  parseScript("nobody-fucking-move", nobodyFuckingMove as ScriptJson),
  parseScript("catfishing", catfishing as ScriptJson),
  parseScript("extension-cord", extensionCord as ScriptJson),
  parseScript("no-roles-barred", noRolesBarred as ScriptJson),
  parseScript("everyone-can-play", everyoneCanPlay as ScriptJson),
  parseScript("trust", trust as ScriptJson),
  parseScript("the-midnight-oasis", theMidnightOasis as ScriptJson),
  parseScript("pies-baking", piesBaking as ScriptJson),
  parseScript("uncertain-death", uncertainDeath as ScriptJson),
  parseScript("harold-holts-revenge", haroldHoltsRevenge as ScriptJson),
  parseScript("hide-and-seek", hideAndSeek as ScriptJson),
];
