import type { RawCharacter } from "@/types/character";
import type { CharacterScores } from "@/types/scoring";
import { BUILTIN_SCORE_OVERRIDES } from "./builtinOverrides";
import { computeCharacterScores } from "./compute";
import { defaultScoreInputsFromRaw } from "./defaults";
import { mergePartialScoreInputs } from "./merge";

export function buildCharacterScores(c: RawCharacter, filePatch?: unknown): CharacterScores {
  const base = defaultScoreInputsFromRaw(c);
  const withBuiltin = mergePartialScoreInputs(base, BUILTIN_SCORE_OVERRIDES[c.id] ?? {});
  const merged = mergePartialScoreInputs(withBuiltin, filePatch ?? {});
  return computeCharacterScores(merged, c);
}
