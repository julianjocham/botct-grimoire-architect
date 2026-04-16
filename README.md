# Grimoire Architect

A Storyteller tool for **Blood on the Clocktower** — a social deduction party game for 5–20 players. Grimoire Architect helps Storytellers build custom scripts, configure rosters, analyze game balance, understand character interactions, and run the game at the table.

---

## Who It's For

**Storytellers** — the game moderator who:

- Designs or selects scripts (character pools) for each game
- Assembles rosters for specific player counts
- Needs to understand power balance and character interactions before play
- Wants a reference tool for managing night actions and reminder text at the table

Secondary audience: **script designers** testing balance of custom character sets.

---

## What It Does

Grimoire Architect is a 3-step wizard that guides you from script selection through game setup to a dashboard with everything needed to run the game.

### Step 1 — Choose Your Script

Select a pre-built script or create a custom one from the full character pool.

**Pre-Built Options:**
- **3 Official Edition Scripts** — Trouble Brewing (Beginner), Bad Moon Rising (Intermediate), and Sects & Violets (Advanced), each with difficulty badges and play style descriptions
- **17 Community-Designed Premade Scripts** — hand-crafted scripts for quick setup, available in both full and Teensyville variants
- **Carousel / Experimental Characters** — optional pool of community-created and experimental characters to mix in

**Custom Script Builder:**
- Mix and match characters from all editions and the carousel
- Live composition dashboard shows Townsfolk, Outsiders, Minions, Demon counts
- Validates against team size requirements (supports 5–20 players)
- Warns about setup-modifying effects (e.g., Baron, Godfather, Balloonist shifts)
- Shows exactly which player counts the script can support
- Character filtering and search by name, ability text, category, or tag

### Step 2 — Set Up the Game Roster

Configure which characters appear in tonight's specific game.

- **Player Count Selection** — Choose 5–20 players
- **Character Toggling** — Enable/disable characters from your script in real-time
- **Traveler Support** — Add optional characters beyond the core script to balance or fill gaps
- **Live Analysis Sidebar** updates instantly:
  - **Team Strength** — Good vs. Evil power balance (−100 to +100 scale)
  - **Game Feel** — Four dimensions of how the game will play
  - **Night Complexity** — Step counts and difficulty rating for First Night and Other Nights
  - **Category Coverage** — Visual grid showing presence of 13 ability archetypes
  - **Composition Warnings** — Critical issues, important warnings, and tips prioritized by severity

- **Character Details Modal** — Click any character to see:
  - Full ability text and reminder instructions
  - Base strength and effective strength (with modifier breakdown)
  - Counter characters and how they disrupt this character
  - In-play interactions with other selected characters
  - Quick toggle to add/remove from roster

### Step 3 — Game Dashboard

View and manage everything needed to run the game.

**At-a-Glance Metrics:**
- **Team Strength Bars** — Composite Good vs. Evil power, plus individual character strength indicators
- **Game Feel Profile** — Visual progress for Info Level, Lethality, Chaos, and ST Load
- **Night Complexity Badge** — Difficulty rating (Beginner/Intermediate/Advanced/Expert) with step counts
- **Health Dashboard** — Team strength, warning count, and category coverage grid on one screen

**Night Order:**
- **First Night sequence** — Exact action order with official reminder text for each character
- **Other Nights sequence** — Order for subsequent nights
- **Interaction Hints** — Context callouts showing which characters interact during each step
- Toggleable between First Night and Other Nights views
- Numbered steps with character tokens for quick visual reference

**Interaction Analysis Feed:**
- All character pairings sorted by severity:
  - **⚠ Critical** — Broken combos or impossible situations
  - **⚡ Important** — Powerful synergies or dangerous power spikes
  - **⚖ Jinxes** — Official Djinn Jinx rules (cross-character effects)
  - **💡 Tips** — Tactical advice and interactions to watch
- Color-coded by severity with character chips for quick scanning

**Roster Display:**
- Characters listed by team (Good/Evil/Traveler)
- Visual team separation with color coding
- Role adjustment indicators for setup-modifiers
- Quick-reference character strength values

**Printable Script:**
- Print-friendly layout (Ctrl+P / Cmd+P) with:
  - Script title, player count, and generation date
  - Two-column night order (First Night and Other Nights side-by-side)
  - Full character abilities and reminder text
  - Ready to print and bring to the table

---

## Character Database

**181 total characters** from official editions and community pools:

- **27 Trouble Brewing** — Official beginner edition
- **30 Bad Moon Rising** — Official intermediate edition with setup modifiers
- **30 Sects & Violets** — Official advanced edition with character transformation
- **71 Carousel / Experimental** — Community-created and playtested characters for extended gameplay
- **12 Fabled** — Additional community-created roles
- **11 Loric** — Extended character pool

Each character includes:
- Full ability text and complexity rating
- Base strength value (−100 to +100)
- Strength modifiers based on script composition
- Category tags (13 types: information, protection, disruption, demon resilience, lethality, etc.)
- Counter characters that disrupt or weaken this role
- Related interactions and Jinxes

---

## Analysis & Metrics

### Game Feel (4 Dimensions)

How the game will play, updated live as you build the roster:

| Dimension | Spectrum | What It Means |
|-----------|----------|---------------|
| **Info Level** | Blind → Low → Moderate → High → Flooded | How much deductive information Good team gets from their roles |
| **Lethality** | Gentle → Standard → Deadly → Massacre | How many players Evil kills per night on average |
| **Chaos** | Orderly → Moderate → Chaotic → Pandemonium | How unpredictable and hard to read the game feels |
| **ST Load** | Light → Moderate → Heavy → Exhausting | How many night actions the Storyteller must manage |

### Strength System

- **Team Strength** — Composite power of Good vs. Evil (−100 to +100 scale)
- **Effective Strength** — Each character's power adjusted for interactions with co-selected characters
- **Context-Aware Modifiers** — Automatic strength adjustments based on script composition (e.g., Drunk is stronger without info roles, Oracle is weaker with Marionette)
- **Strength Breakdown** — See exactly how each character's strength is calculated with visible modifier rules

### Composition Analysis

Real-time warnings and recommendations:

**Critical Issues** ⚠
- Missing demon or townsfolk team
- Impossible character assembly for selected player count

**Important Warnings** ⚡
- Too few townsfolk, outsiders, or minions for balance
- Information density (too much or too little deductive power)
- Missing key ability types (no protection roles, no disruption)
- Setup modifier conflicts or excess

**Tips & Suggestions** 💡
- Category gaps — characters recommended to fill missing ability archetypes
- No day abilities (consider adding discussion-phase powers)
- Misinformation coverage (social deception roles)
- ST Load optimization for your group skill level

### Category Coverage Grid

Visual checklist of 13 ability archetypes:

**Good Team:** Information (start / recurring / on-death / conditional), Day Abilities, Protection, Once-Per-Game Utility

**Evil Team:** Information Disruption, Setup Modification, Demon Resilience, Lethal Attacks, Social Manipulation, Character Transformation

---

## Night Order & Interaction System

### Night Order Generation

- **First Night** — Initial setup night with all start-of-game actions
- **Other Nights** — Standard night sequence for subsequent rounds
- Automatically sequenced based on official rules and character priorities
- Interaction-aware hints show which characters' actions affect each other during each step

### Jinx System

**131 official Djinn Jinxes** codified:
- Cross-character rules and restrictions (e.g., "If Marionette is alive, add Atheist to seating...")
- Automatic detection and flagging during roster assembly
- Displayed in interaction feed with official rule text
- Some Jinxes create composition requirements (setup modifiers, etc.)

### Interaction Feed

All character pairings in your game analyzed and sorted by impact:

- **Broken Combos** — Two characters that can't work together
- **Power Spikes** — Character pairs with disproportionate synergy
- **Tactical Notes** — Strategic advice for character interactions
- Character tokens with team colors for quick visual reference

---

## Warnings & Recommendations

**Smart Composition Validator:**
- Flags issues as you build the roster (real-time feedback)
- Severity-based prioritization (critical → important → tip)
- Specific recommendations for which characters to add to fix gaps
- Explains why each warning matters for game experience

**Example Warnings:**
- "No protection roles — Good team has no way to save players from Evil kills"
- "Information is flooded — Good team will know too much and game will feel easy"
- "Setup modifier conflict — Baron + Godfather can't both shift slots in the same game"
- "ST Load is exhausting for an intermediate group — consider removing Marionette"

---

## Use Cases

- **Running a beginner game** — Pick Trouble Brewing from presets, review the roster supports your player count, print the night order.
- **Designing a balanced script** — Build from scratch, watch game feel and strength bars, use category coverage to ensure all ability types are represented.
- **Testing a homebrew character** — Add it from the Carousel pool, see how interactions and strength calculations change with other characters.
- **Game night prep** — Load a saved script, set player count, add travelers if needed, print and bring to the table.
- **Mid-game reference** — Use night order pane to check action sequence and reminder text during play; check interaction feed if something unexpected happens.
- **Teaching new Storytellers** — Start with a preset script, use warnings and category coverage to explain why each character was chosen.

---

## Running Locally

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Licensing & Attribution

This project is licensed under the **MIT License** — you're free to use, modify, and distribute this software with no copyright restrictions.

**Icons**: Character icons are dynamically loaded from [https://script.bloodontheclocktower.com/src/assets/icons](https://script.bloodontheclocktower.com/src/assets/icons) at runtime. This approach respects The Pandemonium Institute's copyright and follows their [community-created content policy](https://bloodontheclocktower.com/pages/community-created-content-policy). No icon files are bundled with this project.

This is a community-created tool for *Blood on the Clocktower*, an intellectual property of The Pandemonium Institute. It is not affiliated with or endorsed by TPI.
