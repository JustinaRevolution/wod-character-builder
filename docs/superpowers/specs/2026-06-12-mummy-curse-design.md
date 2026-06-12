# Mummy: the Curse — Design Spec
**Date:** 2026-06-12
**Status:** Approved

---

## Overview

Complete Mummy: the Curse support in the character creator, bringing it to the same standard as Vampire, Werewolf, and Mage. Four parts:

1. Rewrite `mummy.json` from scratch — every field in the existing stub is wrong
2. New `pillars` powers type: a rules-enforcing Pillar dot allocator
3. Affinity picker (3 slots: 2 auto-assigned, 1 free choice) and Utterance picker (1–2 picks)
4. Extract Affinities (~47), Utterances (~15–20 samples), and Mummy-specific merits into data files

Decrees, Guilds, Memory, and Sekhem already exist as concepts in the stub but all have incorrect data and will be replaced.

---

## Rules (verified against Mummy: the Curse 1e core, chargen chapter)

**Pillars:** 9 dot-points to distribute across 5 Pillars (Ab, Ba, Ka, Ren, Sheut). The decree determines the defining Pillar — no other Pillar may exceed the defining Pillar's rating. At most one Pillar may remain at 0. The 5th dot in any Pillar costs 2 points (not 1), and requires all other four Pillars to have at least 1 dot.

Point cost: `points_spent = sum(all pillar dots) + count(pillars at 5)`

**Affinities:** Each mummy starts with three:
- One **Soul Affinity** — auto-assigned by decree. Soul Affinities are tied to the decree's defining Pillar; the player picks from the Soul Affinities available for that Pillar (specific Judge determines which, but all are valid chargen choices).
- One **Guild Affinity** — auto-assigned by guild. Each guild has exactly one baseline Guild Affinity.
- One **free Affinity** — player picks any Affinity (Soul, Guild, or Misc) for which they meet prerequisites, excluding the two already assigned.

Prerequisites for most Affinities are a dot minimum in a specific Pillar. Miscellaneous Affinities may have no Pillar prerequisite, or an unusual prerequisite (like Cult rating) — these are shown with a note and not automatically gated.

**Utterances:** Choose 1 Utterance at chargen; gain a 2nd bonus Utterance if all five Pillars have at least 1 dot by the end of the step. A mummy may only choose an Utterance if she meets the Pillar minimum for tier 1. Each Utterance has 3 tiers — the builder displays all three for reference but only tier-1 eligibility gates selection.

**Memory:** Starts at 3 (not 0).

**Sekhem:** Not assigned at chargen — always resets to 10 at the start of each Descent. Shown on the character sheet as an informational fixed value.

---

## Data

### `src/data/lines/mummy.json` — complete rewrite

```json
{
  "id": "mummy", "name": "Mummy: the Curse", "shortName": "Mummy", "color": "#c8a040",
  "template": {
    "group1": {
      "label": "Decree", "field": "decree",
      "options": [
        {
          "id": "heart",   "name": "Decree of the Heart",
          "description": "The Lion-Headed — passionate, emotional, instinctive.",
          "hint": "Defining Pillar: Ab. Favored Attributes: Presence and Strength.",
          "definingPillar": "ab"
        },
        {
          "id": "spirit",  "name": "Decree of the Spirit",
          "description": "The Falcon-Headed — impulsive, adventurous, proud.",
          "hint": "Defining Pillar: Ba. Favored Attributes: Resolve and Wits.",
          "definingPillar": "ba"
        },
        {
          "id": "essence", "name": "Decree of the Essence",
          "description": "The Bull-Headed — reliable, obstinate, obsessive.",
          "hint": "Defining Pillar: Ka. Favored Attributes: Resolve and Stamina.",
          "definingPillar": "ka"
        },
        {
          "id": "name",    "name": "Decree of the Name",
          "description": "The Serpent-Headed — studious, prying, disciplined.",
          "hint": "Defining Pillar: Ren. Favored Attributes: Intelligence and Manipulation.",
          "definingPillar": "ren"
        },
        {
          "id": "shadow",  "name": "Decree of the Shadow",
          "description": "The Jackal-Headed — contemplative, morbid, mystical.",
          "hint": "Defining Pillar: Sheut. Favored Attributes: Composure and Stamina.",
          "definingPillar": "sheut"
        }
      ]
    },
    "group2": {
      "label": "Guild", "field": "guild",
      "options": [
        { "id": "maa_kep",    "name": "Maa-Kep",    "description": "Engravers of Amulets. Managers and organizers. Favored vessels: amulets.", "guildAffinity": "affable_aid" },
        { "id": "mesen_nebu", "name": "Mesen-Nebu", "description": "First Alchemists. Power brokers and sensualists. Favored vessels: regia.", "guildAffinity": "<looked up during extraction>" },
        { "id": "sesha_hebsu","name": "Sesha-Hebsu","description": "Inscribers of Texts. Scholars and scribes. Favored vessels: texts.",   "guildAffinity": "<looked up during extraction>" },
        { "id": "su_menent",  "name": "Su-Menent",  "description": "Shepherds of the Shell. Funerary priests and ritualists. Favored vessels: uter.", "guildAffinity": "<looked up during extraction>" },
        { "id": "tef_aabhi",  "name": "Tef-Aabhi",  "description": "Builders of Effigies. Masons and engineers. Favored vessels: effigies.", "guildAffinity": "<looked up during extraction>" }
      ]
    }
  },
  "powers": {
    "type": "pillars",
    "label": "Pillars",
    "description": "Distribute 9 dot-points across your five Pillars. No Pillar may exceed your defining Pillar. Only one Pillar may be left at 0. The 5th dot in any Pillar costs 2 points and requires all others to have at least 1.",
    "totalDots": 9,
    "definingFrom": "group1",
    "items": [
      { "id": "ab",    "name": "Ab",    "description": "Heart — will, emotion, motivation." },
      { "id": "ba",    "name": "Ba",    "description": "Spirit — identity, memory, divine connection." },
      { "id": "ka",    "name": "Ka",    "description": "Essence — physical power, vital force." },
      { "id": "ren",   "name": "Ren",   "description": "Name — reputation, destiny, true name." },
      { "id": "sheut", "name": "Sheut", "description": "Shadow — the hidden self, death and time." }
    ]
  },
  "resource": {
    "pool": { "name": "Sekhem", "startValue": 10 }
  },
  "integrity": { "name": "Memory", "startValue": 3 }
}
```

The `guildAffinity` ids for Mesen-Nebu, Sesha-Hebsu, Su-Menent, and Tef-Aabhi are looked up from the guilds chapter (pp. 31–55) during extraction.

### `src/data/affinities.json` (new)

Flat array of ~47 entries. Shape:

```json
[
  {
    "id": "blessed_soul",
    "name": "Blessed Soul",
    "type": "soul",
    "pillar": "ab",
    "prerequisite": 1,
    "description": "One or two sentences from the book."
  },
  {
    "id": "entombed_glory",
    "name": "Entombed Glory",
    "type": "misc",
    "pillar": null,
    "prerequisite": null,
    "description": "..."
  },
  {
    "id": "god_kings_scepter",
    "name": "God-King's Scepter",
    "type": "misc",
    "pillar": null,
    "prerequisite": null,
    "cultPrerequisite": 3,
    "description": "..."
  }
]
```

`type` is `"soul"` | `"guild"` | `"misc"`. Bane Affinities are excluded (out of scope for chargen). Affinities with non-Pillar prerequisites (Cult rating, etc.) set `pillar: null`, `prerequisite: null`, and carry a `cultPrerequisite` or similar field — the UI shows these with a note rather than automated gating.

### `src/data/utterances.json` (new)

Array of ~15–20 sample Utterances. Shape:

```json
[
  {
    "id": "awaken_the_dead",
    "name": "Awaken the Dead",
    "tiers": [
      { "tier": 1, "pillar": "ba",    "level": 1, "tags": [],         "description": "..." },
      { "tier": 2, "pillar": "sheut", "level": 3, "tags": [],         "description": "..." },
      { "tier": 3, "pillar": "ren",   "level": 5, "tags": [],         "description": "..." }
    ]
  },
  {
    "id": "blessed_is_the_god_king",
    "name": "Blessed is the God-King",
    "tiers": [
      { "tier": 1, "pillar": "ren",       "level": 1, "tags": ["Subtle"], "description": "..." },
      { "tier": 2, "pillar": "ab",        "level": 3, "tags": ["Subtle"], "description": "..." },
      { "tier": 3, "pillar": "defining",  "level": 5, "tags": ["Epic"],   "description": "..." }
    ]
  }
]
```

`tags` captures `"Subtle"`, `"Epic"`, and `"Curse"` markers. For the special "Defining" Pillar tier (like Blessed is the God-King tier 3), the `pillar` field is `"defining"` — the component resolves it to the character's actual defining Pillar at render time.

### `src/data/mummy-merits.json` (new)

Same shape as `vampire-merits.json`. Six Mummy-specific merits: Cult (special), Enigma (●–●●●●●), Guild Status (●–●●●●●), Tomb (special), Relic (●+), Vestige (●+). Descriptions kept brief (1–2 sentences per dot level).

---

## Component: `PillarsPowers` (new, inside StepPowers.jsx)

Rendered when `lineData.powers.type === "pillars"`. Three stacked sections:

### Pillar allocator (top)

- Dot rows for all 5 Pillars
- Defining Pillar badged "Defining" (derived from the selected decree via `definingFrom`)
- Live counter: "N of 9 dot-points spent (5th dot costs 2)"
- Dots above the current defining Pillar value are greyed and unclickable for non-defining Pillars
- Inline validation errors:
  - "Spend exactly 9 dot-points (N spent)."
  - "No Pillar may exceed your defining Pillar."
  - "At most one Pillar may be left at 0."
  - "To take the 5th dot in a Pillar, all others must have at least 1."

### Affinity picker (middle — active once Pillars are valid)

Three labeled slots:

**Soul Affinity (auto):** Dropdown showing only Soul Affinities (`type === "soul"`) where `pillar === decree.definingPillar`. Pre-selected to the first option; player may pick any that appears (all are valid chargen outcomes — the specific Judge determines which, but the builder presents all legal options for the chosen decree). Non-removable.

**Guild Affinity (auto):** Fixed display showing the name of `guild.guildAffinity`. No interaction needed.

**Free Affinity:** Browseable list of all remaining Affinities. Eligible entries have their Pillar prerequisite met by the current allocation. Affinities with non-Pillar prerequisites (Cult, etc.) appear with a "(check prerequisites)" note and are always selectable. Excludes the already-assigned Soul and Guild Affinities. Single pick.

### Utterance picker (bottom — active once Pillars are valid)

- Lists all Utterances where the character meets tier 1's Pillar minimum
- Each entry expandable to show all three tiers (pillar, level, tags, description)
- Tier 3 entries with `pillar: "defining"` display the actual defining Pillar name in brackets
- Pick 1 slot always active; pick 2 slot unlocks when all five Pillars have ≥ 1 dot
- A selected Utterance can be deselected by clicking it again

---

## State

```js
{
  ab: 3, ba: 2, ka: 3, ren: 1, sheut: 0,    // pillar id → dots
  _soul_affinity: "blessed_soul",             // id from affinities.json
  _guild_affinity: "affable_aid",             // id from affinities.json (auto)
  _free_affinity: "dauntless_explorer",       // id from affinities.json
  _utterances: ["awaken_the_dead"]            // 0–2 utterance ids
}
```

Underscore-prefixed keys follow the established `_rotes` / `_keys` convention. The existing `!k.startsWith('_')` filter in `StepReview` and `CharacterSheet` already handles them correctly — only the display blocks need to be added.

---

## Validation Utility

### `src/utils/pillarValidation.js` (new)

```js
export function validatePillars(powers, { definingPillarId }) → string[]
// Checks: point total === 9, no pillar > defining pillar, ≤1 zero,
// no five-and-zero conflict.

export function pillarPointsSpent(powers) → number
// sum(dots) + count(pillars at 5)

export function utteranceQualifies(utterance, powers) → boolean
// true if character meets tier 1 Pillar minimum
```

`App.jsx` step-5 `canAdvance` guard reconstructs `definingPillarId` from `lineData.template.group1` + `template.decree`, then blocks advancing if `validatePillars` returns errors OR `powers._free_affinity` is unset.

---

## Review and Sheet Display

`StepReview` and `CharacterSheet` each gain:

```jsx
{/* Pillar dots already render through existing powers display */}
{(powers._soul_affinity || powers._guild_affinity || powers._free_affinity) && (
  <div>Affinities: {[soul name, guild name, free name].filter(Boolean).join(', ')}</div>
)}
{(powers._utterances || []).length > 0 && (
  <div>Utterances: {utterance names joined by ', '}</div>
)}
```

Names are looked up from `affinities.json` and `utterances.json` by id.

---

## Merits Wiring

`StepMerits.jsx`: import `MUMMY_MERITS` from `mummy-merits.json`; add `mummy: MUMMY_MERITS` to the `LINE_MERITS` map. Identical pattern to the Mage wiring.

---

## Testing

Same pattern as existing lines:

- **`pillarValidation.test.js`**: unit tests for `validatePillars` (valid builds, point-total errors, defining-cap violation, two-zeros, five-and-zero conflict) and `pillarPointsSpent` (5th-dot accounting).
- **`StepPowers.test.jsx`**: component tests for `PillarsPowers` — Defining badge, dot counter, greyed dots above defining cap, validation messages, Affinity slot locking/unlocking, Utterance second slot unlocking on all-Pillars-filled.
- **`StepReview.test.jsx` / `CharacterSheet.test.jsx`**: Affinity and Utterance display, underscore keys not rendered raw.
- **`StepMerits.test.jsx`**: Mummy tab shows Cult and Enigma.

---

## Extraction Workflow

Same rhythm as Mage: one PDF pass per data file, commit per file.

1. **mummy.json rewrite** — decree + guild data, Pillar items (all known, ready to commit)
2. **affinities.json** — ~47 Affinities from pp. 99–110; guild→Affinity mappings from pp. 31–55
3. **utterances.json** — sample Utterances from pp. 113–142 (approx.)
4. **mummy-merits.json** — Mummy merits from pp. 78–83

---

## Out of Scope

- Bane Affinities (acquired through specific play events, not chargen)
- Utterance tiers 2 and 3 as gating mechanics (in-play concern; displayed for reference only)
- Judge selection (42+ named Judges — builder presents all legal Soul Affinities for the chosen decree instead)
- In-play Sekhem mechanics (Descent, degeneration, Pillar recovery)
- Vessels and the Lifeweb (entirely in-play systems)
