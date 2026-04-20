import type { CharacterScoreInputs } from "@/types/scoring";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge score input objects (JSON overrides win). Arrays on the right replace the left. */
export function mergeScoreInputs(
  base: CharacterScoreInputs,
  patch: Partial<CharacterScoreInputs>
): CharacterScoreInputs {
  const out: CharacterScoreInputs = {
    st: { ...base.st },
    lethality: { ...base.lethality },
    info: { ...base.info }
  };
  if (patch.st) {
    out.st = { ...out.st, ...patch.st };
    if (patch.st.timingPhases) out.st.timingPhases = [...patch.st.timingPhases];
  }
  if (patch.lethality) out.lethality = { ...out.lethality, ...patch.lethality };
  if (patch.info) out.info = { ...out.info, ...patch.info };
  return out;
}

export function mergePartialScoreInputs(base: CharacterScoreInputs, patch: unknown): CharacterScoreInputs {
  if (patch == null || !isPlainObject(patch) || Object.keys(patch).length === 0) return base;
  return mergeScoreInputs(base, patch as Partial<CharacterScoreInputs>);
}
