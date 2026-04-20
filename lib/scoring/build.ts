import type { RawCharacter } from "@/types/character";
import type { CharacterScoreBreakdown, CharacterScores } from "@/types/scoring";
import { BUILTIN_SCORE_OVERRIDES } from "./builtinOverrides";
import { buildScoreBreakdown, computeCharacterScores } from "./compute";
import { defaultScoreInputsFromRaw } from "./defaults";
import { mergePartialScoreInputs } from "./merge";

export type BuiltCharacterScores = CharacterScores & { scoreBreakdown: CharacterScoreBreakdown };

export function buildCharacterScores(c: RawCharacter, filePatch?: unknown): BuiltCharacterScores {
  const base = defaultScoreInputsFromRaw(c);
  const withBuiltin = mergePartialScoreInputs(base, BUILTIN_SCORE_OVERRIDES[c.id] ?? {});
  const merged = mergePartialScoreInputs(withBuiltin, filePatch ?? {});
  const scores = computeCharacterScores(merged);
  const scoreBreakdown = buildScoreBreakdown(merged);
  return { ...scores, scoreBreakdown };
}
