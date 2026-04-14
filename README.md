# Grimoire Architect

A Storyteller tool for **Blood on the Clocktower** — a social deduction party game for 5–20 players. Grimoire Architect helps the Storyteller (the game's moderator) build scripts, configure game rosters, and understand the balance and complexity of their game before and during play.

---

## Who It's For

**Storytellers** — the person who runs the game, assigns roles, manages night actions, and narrates the story. They need to:

- Choose which characters are available in a given session (the _script_)
- Assemble the actual roster for the specific group size
- Understand character interactions, power balance, and night complexity before play begins
- Have a printable reference for the table

Secondary audience: **script designers** who are testing balance of custom character sets.

---

## What It Does

The app is a three-step wizard that guides the Storyteller from script selection through roster assembly to a full game dashboard.

### Step 1 — Choose Your Script

A script is the pool of characters that _could_ appear in a game. The Storyteller selects from:

- **Three official pre-built scripts** — Trouble Brewing (Beginner), Bad Moon Rising (Intermediate), and Sects & Violets (Advanced) — each with a difficulty badge and a short description of the play style they produce.
- **Custom script builder** — Mix characters from all editions. A live composition dashboard shows how many Townsfolk, Outsiders, Minions, and Demons are in the script, validated against the targets needed to support the full range of player counts. The builder warns about the special effects (e.g. shifting Townsfolk slots to Outsiders), enforces a minimum viable composition, and shows exactly which player counts (5–20) the script can support.

### Step 2 — Set Up the Game Roster

With a script chosen, the Storyteller picks which characters will actually appear in tonight's game for the specific number of players. The app:

- **Calculates required character counts** for the selected player count, including adjustments for setup-modifying characters like the Baron, Godfather, or Balloonist.
- **Shows live balance feedback** — team strength bars, game feel indicators, interaction warnings — updating as characters are toggled in or out.
- **Flags critical problems** (a team is impossible to assemble, a character count is wrong) and surfaces important suggestions (the script is light on information roles, or heavy on kills).
- Supports adding **Travelers** — optional characters outside the main script that can fill gaps.

### Step 3 — Game Dashboard

Once the roster is locked, the dashboard gives the Storyteller everything needed at the table:

- **Night order** — The exact sequence of character actions for First Night and Other Nights, with the official reminder text for each character and context hints about interactions happening that night.
- **Interaction feed** — All relevant pairings between characters in play, sorted by severity: critical issues (⚠ broken combos or impossible situations), important warnings (⚡ synergies and power spikes), Djinn Jinx rules (⚖), and tips (💡 tactical advice).
- **Team strength** — A visual power balance between Good and Evil, based on the composite strength scores of the characters in play and how they modify each other.
- **Script feel** — Four dimensions that describe the play experience this roster will produce: how much information the good team gets, how lethal the game is, how chaotic and unpredictable play will feel, and how demanding night management is for the Storyteller.
- **Printable script** — A print view of the full roster with character abilities and night reminders, ready to take to the table.

---

## Key Insights the App Surfaces

| Metric                   | What It Tells You                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| **Team Strength**        | Composite power balance between Good and Evil on a −100 to +100 scale                           |
| **Effective Strength**   | Each character's power adjusted for interactions with others in the same roster                 |
| **Info Level**           | How much deductive information the good team has access to (Blind → Flooded)                    |
| **Lethality**            | How deadly the script is (Gentle → Massacre)                                                    |
| **Chaos**                | How unpredictable and hard to read the game will be (Orderly → Pandemonium)                     |
| **ST Load**              | How complex night management is for the Storyteller (Light → Exhausting)                        |
| **Night Complexity**     | Rating (Beginner/Intermediate/Advanced/Expert) plus step counts for both night phases           |
| **Category Coverage**    | Which ability archetypes are represented — info, protection, disruption, demon resilience, etc. |
| **Player Count Support** | Which player counts (5–15) the script or roster can accommodate                                 |

---

## Use Cases

- **Running a beginner game** — Select Trouble Brewing, confirm the roster covers the player count, review the night order before play starts.
- **Designing a custom script** — Build from scratch, watch the composition dashboard to hit target counts, verify no critical jinxes or broken interactions exist.
- **Balancing a script** — Use the category coverage grid and team strength bars to spot gaps (no protection roles, Evil too strong, ST Load too heavy for the group).
- **Game night prep** — Set the player count the morning of, lock in travelers if needed, print the script for the table.
- **Mid-game reference** — Use the night order pane to quickly check action sequence and reminders during play.

---

## Running Locally

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).
