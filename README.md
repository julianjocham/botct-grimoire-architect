# Grimoire Architect

A Storyteller tool for **Blood on the Clocktower** — a social deduction party game for 5–20 players. Grimoire Architect helps Storytellers build custom scripts, configure rosters, analyze game feel and role-level load, and run the game at the table.

---

## Who It's For

**Storytellers** — the game moderator who:

- Designs or selects scripts (character pools) for each game
- Assembles rosters for specific player counts
- Wants heuristic balance signals (game feel, ST load, lethality, information) and official reminder order before play
- Wants a reference for night order, optional demon bluffs, and printouts

Secondary audience: **script designers** testing how a character set “feels” in the model and whether Djinn jinxes apply once both roles are in play.

---

## What It Does

Grimoire Architect is a 3-step flow: **script** → **setup (roster)** → **dashboard**.

### Step 1 — Choose Your Script

Select a pre-built script or create a custom one from the full character pool.

**Pre-Built Options:**

- **3 Official Edition Scripts** — Trouble Brewing (Beginner), Bad Moon Rising (Intermediate), and Sects & Violets (Advanced), each with difficulty badges and play style descriptions
- **Community Premade Scripts** — hand-crafted full scripts and Teensyville (5–6 player) scripts for quick setup
- **Carousel / Experimental Characters** — optional pool of community-created and experimental characters to mix in

**Custom Script Builder:**

- Mix and match characters from all editions and the carousel
- Live composition targets for full scripts (with Baron-aware townsfolk/outsider targets) or Teensyville minimums
- Validates team counts for the script type you chose
- Character filtering and search by name, ability text, category, or tag
- Choose **full script** or **Teensyville** before building; validation and player-count options follow that mode

### Step 2 — Set Up the Game Roster

Configure which characters appear in tonight's specific game.

- **Player Count** — 5–15 for standard scripts (16–20 add traveler slots on top of the core 15). Teensyville uses 5–6 only.
- **Character Toggling** — Enable/disable characters from your script in real time; distribution panel shows progress toward required Townsfolk / Outsider / Minion / Demon counts (adjusted for setup modifiers such as Baron).
- **Traveler Support** — At 16+ players, pick travelers from the script (custom) or edition traveler list (official scripts).
- **Fabled & Loric** — When those roles are on the script, optional sections let you include them in the grimoire.
- **Live analysis (sidebar)** — **Game feel** (four axes) for the current roster, plus a **per-character score strip** for everyone selected: **ST** (Storyteller Part A complexity band), **L** (lethality attributed per cycle), **I** (information index). Hover tooltips explain how each value is derived from the heuristic model.
- **Character tiles** — Effective strength, minibar, count of **counters** from the enrichment data that are also in play, and optional **gap hints** (◈) when adding a role would cover a missing good/evil ability category the UI tracks for suggestions.
- **Character Details** — Click any character to see full ability text, strength bar with **roster-based modifiers** (who shifted the score and why), sub-dimensions where defined, Storyteller advice, “new ST” callouts, official night reminders, **counters that are actually in this game**, demon bluff advice where present, and add/remove for the roster.

### Step 3 — Game Dashboard

View and manage what you need at the table.

**In-play strip**

- Characters grouped by team (and travelers), each showing the same **ST · L · I** strip as in setup; click opens the detail sheet.

**Night order**

- **First Night** and **Other Nights** toggles with numbered steps, official reminder text, and **Djinn jinx callouts**: when two characters in the roster have an official jinx entry, the full jinx rule appears under each involved step (so you see it in night context, not in a separate feed). Hints use important/critical severities from the data (tip-level entries are omitted from these step callouts).

**Right column**

- **Game feel** for the in-play roster
- **Night complexity** summary (rating plus step counts for first vs. other nights)
- **Demon bluffs** — Pick up to three **Townsfolk from the script who are not in the grimoire** as quick ST-facing bluff reminders (with the same score strip on each chip).

**Print**

- **Print** from the dashboard with a mode selector: full pack (pretty or clean parchment styling) or **script-only** print (pretty or clean) with character overview; when not script-only, separate pages for First Night and Other Nights order (**reminder text**; jinx callouts are an on-screen night list feature and are not duplicated on the default print night pages).

---

## Character Database

**181 characters** in the dataset (non-traveler core pool plus travelers, fabled, and loric used where applicable):

- **Trouble Brewing, Bad Moon Rising, Sects & Violets** — official edition pools as in the app
- **Carousel / Experimental** — extended community pool
- **Travelers** — for high player counts and edition-specific lists
- **Fabled** — optional meta roles when included on a script
- **Loric** — extended pool

Each character includes official script fields where applicable, enrichment (strength, counters, tags, ability category, Storyteller notes), and heuristic scores (ST complexity, lethality, information index) merged from `lib/scoring` and optional `data/scoreOverrides.json`.

---

## Analysis & Metrics

### Game Feel (4 Dimensions)

How the game tends to play in the model, updated as you change the roster:

| Dimension      | Spectrum                                   | What It Means                                                  |
| -------------- | ------------------------------------------ | -------------------------------------------------------------- |
| **Info Level** | Blind → Low → Moderate → High → Flooded    | How much deductive information Good tends to get from roles    |
| **Lethality**  | Gentle → Standard → Deadly → Massacre      | How lethal pressure reads in the model                         |
| **Chaos**      | Orderly → Moderate → Chaotic → Pandemonium | How unpredictable the script reads                             |
| **ST Load**    | Light → Moderate → Heavy → Exhausting      | How heavy operational / cognitive load reads for the Storyteller |

### Role-level scores (ST · L · I)

Heuristic, tunable metrics (not official BOTC design): **ST** is Storyteller Part A–style complexity, **L** is attributed kills per cycle, **I** is an information-throughput index (see `lib/scoring/README.md` for formulas and tuning).

### Strength on the roster

- **Composite strength** from enrichment, with **effective strength** adjusted when specific other characters are selected (reasons listed in the character detail panel).
- These are advisory signals for script tuning, not win-rate predictors.

### Roster construction UX

- Hard requirements: correct **counts** per player count (including setup modifiers and traveler slots).
- Soft guidance: **game feel**, **ST/L/I** tooltips, **category gap** highlights on tiles, and **counter** presence markers — not a separate “warnings dashboard” in the sidebar.

---

## Night Order & Djinn Jinxes

### Night order

- Steps are ordered from character night-order fields for **First Night** vs **Other Nights**, with official reminder strings on each line.

### Jinx data

- **131 official Djinn jinx rules** live in `data/jinxes.json` and are loaded as the only **pairwise interaction** source in the app.
- When **both** characters of a jinx pair are in the **game** roster, the rule is surfaced as **context text on the night list** for each character involved (see Step 3 above). There is no separate scrolling “interaction feed” in the current UI.

---

## Use Cases

- **Running a beginner game** — Pick Trouble Brewing, set player count, fill the grimoire, review night order and jinx callouts, print if needed.
- **Designing a script** — Build custom or premade, watch game feel and role-level scores, use gap hints and counters while toggling characters.
- **Teensyville** — Switch script type to Teensyville, pick a small script or build to minimums, play 5–6.
- **Game night prep** — Dashboard for order, bluffs, and print layouts.
- **Teaching new Storytellers** — Tooltips on ST/L/I explain what the numbers are trying to approximate.

---

## Running Locally

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). The UI supports **English** and **German** (toggle in the header).

---

## Licensing & Attribution

This project is licensed under the **MIT License** — you're free to use, modify, and distribute this software with no copyright restrictions.

**Icons**: Character icons are dynamically loaded from [https://script.bloodontheclocktower.com/src/assets/icons](https://script.bloodontheclocktower.com/src/assets/icons) at runtime. This approach respects The Pandemonium Institute's copyright and follows their [community-created content policy](https://bloodontheclocktower.com/pages/community-created-content-policy). No icon files are bundled with this project.

This is a community-created tool for _Blood on the Clocktower_, an intellectual property of The Pandemonium Institute. It is not affiliated with or endorsed by TPI.
