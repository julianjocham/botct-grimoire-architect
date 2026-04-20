# Rule-based character scores

This folder implements **ST Part A complexity**, **lethality per cycle**, and an **information index** merged onto each character for the app. In the UI they appear compactly as **ST · L · I** (with hover tooltips) on roster cards, the setup sidebar roster list, and dashboard tokens — see the project root `README.md` for product context.

Values are **heuristic** (tunable in code and via `data/scoreOverrides.json`); they are not official Blood on the Clocktower design.

## Information index: “sobriety” gating

The field `InfoGatheringInput.sobrietyGating` controls a single **multiplicative discount** on the information index **after** the frequency line and info-type weight are applied.

### Formula

```
index = round_1dp( frequencySum × typeWeight × gateMultiplier )
```

where:

- `frequencySum` = `firstNightFacts×2.2 + recurringInfoPerNight×9.5 + dayInfoEventsPerDay×7.0`
- `typeWeight` = weight for `infoType` (see `compute.ts`)
- `gateMultiplier` = **`INFO_SOBRIETY_GATE_MULTIPLIER` (0.88)** if `sobrietyGating` is true, else **1**

So when gating is on, the index is **12% lower** than the same inputs with gating off. The constant lives in `compute.ts` as `INFO_SOBRIETY_GATE_MULTIPLIER`.

### What it is meant to represent

Despite the name, this is **not** parsing the script for “register” or “only while sober” wording. It is a **coarse proxy** for the common BOTC pattern that **Townsfolk and Outsider** information can be **wrong or suppressed** while those players are **drunk or poisoned**, so their modeled “info throughput” in this index is slightly reduced.

It is **deliberately separate** from **ST Part A complexity** (operational load). Drunk/poison sensitivity for the storyteller was explicitly excluded from ST complexity; this gate only affects the **information index** ranking axis.

### Default inference (`defaults.ts`)

| Situation | `sobrietyGating` |
|-----------|------------------|
| No scored info (`infoType === "none"`, etc.) | `false` (gate irrelevant; index is 0) |
| **Spy** or **Widow** (evil grimoire-style info) | `false` — not modeled as good-team drunk/poison misinfo |
| **Townsfolk** or **Outsider** with ability text that counts as info | `true` |
| **Minion** or **Demon** with info-like text | `false` — evil info is not given the good-team discount in the default model |

So **“yes” in the UI** means: team is good-side **and** the role contributed to the info block; **“no”** means evil team, no info, or the Spy/Widow special case.

### Overrides

Per-character JSON patches in `data/scoreOverrides.json` are deep-merged after defaults and built-in overrides. You can set `"info": { "sobrietyGating": true|false }` for a character id to match a home rule or a different reading of an ability.

### Why 0.88?

There is **no first-principles derivation** of this number. It was chosen as a **small, arbitrary tuning knob** so good-team info roles do not rank identically to structurally similar evil info, without moving scores by an entire order of magnitude (~12% down felt “enough to notice in ordering, not enough to dominate the index”). It is **not** fitted to empirical win rates, poison frequency tables, or published odds.

If you dislike the constant, treat it like any other heuristic: change `INFO_SOBRIETY_GATE_MULTIPLIER` in `compute.ts`, or turn gating off per role via `scoreOverrides.json`.

### Could the gate depend on the chosen script?

**Conceptually, yes** — on a script with more ways to poison or manufacture drunks, good players’ information is *on average* less reliable, so a **script-level** adjustment to the information index (or to the multiplier) can be more faithful than a single global constant.

**Practically, it is easy to get wrong** unless you commit to a clear, maintainable model:

1. **What counts as a “poison slot”?** Officially only some effects are *Poisoned* or *Drunk* in the glossary sense. Do you count the **Poisoner** only, or also **Widow**, **Pukka**, **Cerenovus** (madness), **Philosopher**-style, **Marionette** edge cases, **Baron** (extra outsider → extra drunk possibility), **Lunatic**, travelers, fabled, homebrew? Each choice changes the number.

2. **Per-player vs per-role.** “How many ways to be poisoned” is really about **how many good players can be affected at once** and **whether your info role is the one poisoned**, not just a count of evil characters on the script. A simple count of minions with “poison” in the ability text is a **very rough** proxy.

3. **Where the code runs today.** Scores are built in `lib/data.ts` per raw character **without** knowing the user’s current script. Making gating **dynamic** means threading **script character ids** (or a precomputed summary) into the merge/scoring path whenever the script changes, then defining `gateMultiplier = f(scriptSummary, role)`.

**Reasonable directions** if you implement script-aware behavior later:

- **Script summary only:** e.g. `numGlossaryPoisonSources`, `numDrunkManufacturers`, `baronPresent` — combined into one **script truth factor** in `[min, max] ⊂ (0,1]` applied to **all** good-team info indices (simpler than per-role Bayesian math).
- **Per-role overrides:** keep 0.88 as default but use overrides for outliers (already supported).
- **Explicit roster:** advanced mode where the user marks “our game has X poisoners” — avoids mis-detecting scripts but needs UI.

None of these replace the fact that **0.88** is still a **policy constant** unless you derive bounds from data; script-aware code mostly moves **which** constant or **which curve** you apply, not magic accuracy.
