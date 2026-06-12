# Mummy: the Curse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add complete Mummy: the Curse support — Pillar allocation UI, Affinity/Utterance pickers, and Mummy-specific merits — to the nWoD character builder.

**Architecture:** Rewrite `mummy.json` from scratch (all existing data is wrong); extract Affinities, Utterances, and merits from the PDF into data files; add a `pillars` powers type with a dedicated `PillarsPowers` component; a `pillarValidation.js` utility enforces the 9-dot Pillar rules; `App.jsx` gains a step-5 gate identical in structure to the existing Arcana gate.

**Tech Stack:** React 18, Vite, Tailwind CSS, Vitest + Testing Library. PDF: `/home/justina/Desktop/TTRPG Workshop/New World of Darkness/Mummy - The Curse.pdf`. Run tests: `npm run test -- --run`. Run a single file: `npm run test -- --run src/utils/pillarValidation.test.js`.

---

## File Map

**Rewrite:** `src/data/lines/mummy.json`

**Create:**
- `src/data/affinities.json`
- `src/data/utterances.json`
- `src/data/mummy-merits.json`
- `src/utils/pillarValidation.js`
- `src/utils/pillarValidation.test.js`

**Modify:**
- `src/components/wizard/StepPowers.jsx` — new `PillarsPowers` + `UtteranceEntry` components; `pillars` branch in dispatch
- `src/components/wizard/StepPowers.test.jsx` — new `pillars` type test suite
- `src/App.jsx` — `pillars` branch in step-5 `canAdvance` guard
- `src/components/wizard/StepReview.jsx` — Affinities + Utterances display blocks
- `src/components/wizard/StepReview.test.jsx` — 2 new tests
- `src/components/sheet/CharacterSheet.jsx` — same Affinities + Utterances blocks
- `src/components/sheet/CharacterSheet.test.jsx` — 2 new tests
- `src/components/wizard/StepMerits.jsx` — import MUMMY_MERITS, add to LINE_MERITS
- `src/components/wizard/StepMerits.test.jsx` — 1 new test

---

## Context for all tasks

**State shape** for a Mummy character's `powers` object:
```js
{
  ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1,  // pillar id → dots
  _soul_affinity: "blessed_soul",           // affinity id (auto-picked from decree)
  _guild_affinity: "affable_aid",           // affinity id (auto from guild)
  _free_affinity: "dauntless_explorer",     // affinity id (player's free pick)
  _utterances: ["awaken_the_dead"]          // 0–2 utterance ids
}
```
Underscore-prefixed keys are meta-data, NOT Pillar dots. The `!k.startsWith('_')` filter already in `StepReview.jsx` and `CharacterSheet.jsx` handles this correctly.

**Pillar point formula:** `points_spent = sum(all pillar dots) + count(pillars at 5)` — the 5th dot in any Pillar costs 2 points.

**Validation rules:**
1. `points_spent === 9`
2. No non-defining Pillar exceeds the defining Pillar (from decree)
3. At most one Pillar at 0
4. If any Pillar is at 5, all others must be ≥ 1

**Affinities shape** (`src/data/affinities.json`):
```json
[
  { "id": "blessed_soul", "name": "Blessed Soul", "type": "soul", "pillar": "ab", "prerequisite": 1, "description": "..." },
  { "id": "entombed_glory", "name": "Entombed Glory", "type": "misc", "pillar": null, "prerequisite": null, "description": "..." },
  { "id": "god_kings_scepter", "name": "God-King's Scepter", "type": "misc", "pillar": null, "prerequisite": null, "cultPrerequisite": 3, "description": "..." }
]
```
`type` is `"soul"` | `"guild"` | `"misc"`. Bane Affinities are excluded (out of scope).

**Utterances shape** (`src/data/utterances.json`):
```json
[
  {
    "id": "awaken_the_dead", "name": "Awaken the Dead",
    "tiers": [
      { "tier": 1, "pillar": "ba",    "level": 1, "tags": [],       "description": "..." },
      { "tier": 2, "pillar": "sheut", "level": 3, "tags": [],       "description": "..." },
      { "tier": 3, "pillar": "ren",   "level": 5, "tags": [],       "description": "..." }
    ]
  }
]
```
`tags` captures `"Subtle"`, `"Epic"`, `"Curse"`. When tier 3's `pillar` is `"defining"`, the component resolves it to the character's actual defining Pillar name at render time.

---

## Task 1: Rewrite `mummy.json`

**Files:** Rewrite `src/data/lines/mummy.json`

Context: the current file has fabricated decree names (Ab-Henu, Ames-Ankh…), wrong guild names, Sekhem listed as a Pillar, 5 starting dots (should be 9), and Memory starting at 0 (should be 3). Every field needs replacement.

The 5 Guilds and their baseline Guild Affinities are in the guilds chapter (pp. 31–55 of the PDF). Read those pages to find the guild affinity name for each guild, then snake_case each name to form its id (e.g., "Affable Aid" → `"affable_aid"`). Maa-Kep's is already known: `"affable_aid"`.

- [ ] **Step 1: Read PDF pp. 31–50 — guilds chapter first half**

```
Read: /home/justina/Desktop/TTRPG Workshop/New World of Darkness/Mummy - The Curse.pdf
pages: "31-50"
```

Look for each guild section. For each of the 5 guilds find: the name of the one baseline Guild Affinity that all members of that guild receive automatically (look for language like "bonus Affinity", "Guild Affinity", or a single named power listed as the default). Note the affinity name and snake_case it.

- [ ] **Step 2: Read PDF pp. 51–55 if any guilds remain**

```
Read: /home/justina/Desktop/TTRPG Workshop/New World of Darkness/Mummy - The Curse.pdf
pages: "51-55"
```

- [ ] **Step 3: Write mummy.json**

Write `src/data/lines/mummy.json` with this exact structure, filling in the `guildAffinity` ids you found above:

```json
{
  "id": "mummy", "name": "Mummy: the Curse", "shortName": "Mummy", "color": "#c8a040",
  "template": {
    "group1": {
      "label": "Decree", "field": "decree",
      "options": [
        { "id": "heart",   "name": "Decree of the Heart",   "description": "The Lion-Headed — passionate, emotional, instinctive.",    "hint": "Defining Pillar: Ab. Favored Attributes: Presence and Strength.",    "definingPillar": "ab" },
        { "id": "spirit",  "name": "Decree of the Spirit",  "description": "The Falcon-Headed — impulsive, adventurous, proud.",       "hint": "Defining Pillar: Ba. Favored Attributes: Resolve and Wits.",        "definingPillar": "ba" },
        { "id": "essence", "name": "Decree of the Essence", "description": "The Bull-Headed — reliable, obstinate, obsessive.",        "hint": "Defining Pillar: Ka. Favored Attributes: Resolve and Stamina.",     "definingPillar": "ka" },
        { "id": "name",    "name": "Decree of the Name",    "description": "The Serpent-Headed — studious, prying, disciplined.",      "hint": "Defining Pillar: Ren. Favored Attributes: Intelligence and Manipulation.", "definingPillar": "ren" },
        { "id": "shadow",  "name": "Decree of the Shadow",  "description": "The Jackal-Headed — contemplative, morbid, mystical.",    "hint": "Defining Pillar: Sheut. Favored Attributes: Composure and Stamina.", "definingPillar": "sheut" }
      ]
    },
    "group2": {
      "label": "Guild", "field": "guild",
      "options": [
        { "id": "maa_kep",    "name": "Maa-Kep",    "description": "Engravers of Amulets. Managers and organizers. Favored vessels: amulets.",   "guildAffinity": "affable_aid" },
        { "id": "mesen_nebu", "name": "Mesen-Nebu", "description": "First Alchemists. Power brokers and sensualists. Favored vessels: regia.",   "guildAffinity": "<ID FROM PDF>" },
        { "id": "sesha_hebsu","name": "Sesha-Hebsu","description": "Inscribers of Texts. Scholars and scribes. Favored vessels: texts.",           "guildAffinity": "<ID FROM PDF>" },
        { "id": "su_menent",  "name": "Su-Menent",  "description": "Shepherds of the Shell. Funerary priests and ritualists. Favored vessels: uter.", "guildAffinity": "<ID FROM PDF>" },
        { "id": "tef_aabhi",  "name": "Tef-Aabhi",  "description": "Builders of Effigies. Masons and engineers. Favored vessels: effigies.",       "guildAffinity": "<ID FROM PDF>" }
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

Replace each `<ID FROM PDF>` with the snake_cased affinity name you found.

- [ ] **Step 4: Verify JSON is valid**

```bash
node -e "const d = require('./src/data/lines/mummy.json'); console.log(d.template.group1.options.length, 'decrees,', d.template.group2.options.length, 'guilds,', d.powers.items.length, 'pillars'); console.log('Memory start:', d.integrity.startValue); console.log('Guilds:', d.template.group2.options.map(g=>g.id+':'+g.guildAffinity).join(', '))"
```

Expected: `5 decrees, 5 guilds, 5 pillars` / `Memory start: 3` / each guild shows its affinity id.

- [ ] **Step 5: Commit**

```bash
git add src/data/lines/mummy.json
git commit -m "data: rewrite mummy.json with correct decrees, guilds, pillars"
```

---

## Task 2: Extract `affinities.json`

**Files:** Create `src/data/affinities.json`

The Mummy affinities live in two places:
- **Guild Affinities** are described within each guild's chapter (pp. 31–55) — read the same pages as Task 1.
- **Soul and Misc Affinities** are in an alphabetical list starting around p. 99 ("Ancient Horror Unveiling" is the first entry).

Extract all ~47 Affinities. Bane Affinities are excluded (the spec says they're acquired through play, not chargen).

The affinity `type` field rules:
- `"soul"` — the book marks these as "Soul Affinities": they are tied to a specific Pillar, have covert/non-obvious supernatural effects, and are favored by the associated decree. Look for the label "Soul Affinities" in the category description.
- `"guild"` — the Guild Affinity listed for each guild in the guilds chapter.
- `"misc"` — everything else (Miscellaneous Affinities per the book's description).

For `pillar`: use the id matching the prerequisite Pillar (`"ab"`, `"ba"`, `"ka"`, `"ren"`, `"sheut"`). If no Pillar prerequisite, use `null`.
For `prerequisite`: the dot number (1–5). If none, `null`.
For `cultPrerequisite`: only on God-King's Scepter (Cult 3). All others omit this field.
For `description`: 1–2 sentences from the book, paraphrased (not quoted verbatim).

- [ ] **Step 1: Read PDF pp. 31–50 (guilds chapter)**

```
Read: /home/justina/Desktop/TTRPG Workshop/New World of Darkness/Mummy - The Curse.pdf
pages: "31-50"
```

Extract each guild's Guild Affinity entry (name, prerequisite if any, brief description).

- [ ] **Step 2: Read PDF pp. 51–55 if needed**

```
Read: /home/justina/Desktop/TTRPG Workshop/New World of Darkness/Mummy - The Curse.pdf
pages: "51-55"
```

- [ ] **Step 3: Read PDF pp. 99–110 (affinities alphabetical list)**

```
Read: /home/justina/Desktop/TTRPG Workshop/New World of Darkness/Mummy - The Curse.pdf
pages: "99-110"
```

Extract every Affinity entry: name, prerequisite line, and a 1–2 sentence description.

- [ ] **Step 4: Write affinities.json**

Write `src/data/affinities.json`. Sort entries alphabetically by name. Example entries (fill in real descriptions):

```json
[
  {
    "id": "affable_aid",
    "name": "Affable Aid",
    "type": "guild",
    "pillar": "ba",
    "prerequisite": 1,
    "description": "Paraphrased 1-2 sentence description."
  },
  {
    "id": "ancient_horror_unveiling",
    "name": "Ancient Horror Unveiling",
    "type": "misc",
    "pillar": "sheut",
    "prerequisite": 3,
    "description": "Paraphrased description."
  },
  {
    "id": "entombed_glory",
    "name": "Entombed Glory",
    "type": "misc",
    "pillar": null,
    "prerequisite": null,
    "description": "Paraphrased description."
  },
  {
    "id": "god_kings_scepter",
    "name": "God-King's Scepter",
    "type": "misc",
    "pillar": null,
    "prerequisite": null,
    "cultPrerequisite": 3,
    "description": "Paraphrased description."
  }
]
```

Ensure the guild affinity IDs here match the `guildAffinity` values in `mummy.json` from Task 1 exactly.

- [ ] **Step 5: Verify**

```bash
node -e "const a = require('./src/data/affinities.json'); const byType = a.reduce((m,x)=>(m[x.type]=(m[x.type]||0)+1,m),{}); console.log('Total:', a.length); console.log('By type:', JSON.stringify(byType)); console.log('Soul pillars:', [...new Set(a.filter(x=>x.type==='soul').map(x=>x.pillar))].sort().join(', '))"
```

Expected: Total 40–50 entries; `soul` type should have at least one entry per pillar (ab, ba, ka, ren, sheut); `guild` type should have 5 entries (one per guild).

- [ ] **Step 6: Commit**

```bash
git add src/data/affinities.json
git commit -m "data: extract affinities.json — ~47 Soul/Guild/Misc Affinities"
```

---

## Task 3: Extract `utterances.json`

**Files:** Create `src/data/utterances.json`

The Utterances chapter starts at p. 111. The actual Utterance entries begin at p. 113 (after the rules intro). Each Utterance has 3 tiers, each tier with: a Pillar id, a dot minimum, optional tags (Subtle, Epic, Curse), and a description. The chapter may continue to p. 140–150 — read in 20-page batches until you've captured all sample Utterances.

For `pillar` in each tier: use the Pillar id (`"ba"`, `"sheut"`, etc.). The special case: "Blessed is the God-King" tier 3 requires the character's own defining Pillar at 5 — use `"defining"` as the pillar value for this tier.

For `tags`: look for the words "Subtle", "Epic", or "Curse" appearing in brackets or beside the tier's Pillar requirement.

For `description`: 1–2 sentence paraphrase per tier (not quoted verbatim).

- [ ] **Step 1: Read PDF pp. 113–132**

```
Read: /home/justina/Desktop/TTRPG Workshop/New World of Darkness/Mummy - The Curse.pdf
pages: "113-132"
```

- [ ] **Step 2: Read PDF pp. 133–152 if more Utterances remain**

```
Read: /home/justina/Desktop/TTRPG Workshop/New World of Darkness/Mummy - The Curse.pdf
pages: "133-152"
```

Stop when you reach the end of the Utterances chapter (next chapter heading).

- [ ] **Step 3: Write utterances.json**

Write `src/data/utterances.json`. Sort entries alphabetically by name:

```json
[
  {
    "id": "awaken_the_dead",
    "name": "Awaken the Dead",
    "tiers": [
      { "tier": 1, "pillar": "ba",    "level": 1, "tags": [],         "description": "Paraphrased tier 1 description." },
      { "tier": 2, "pillar": "sheut", "level": 3, "tags": [],         "description": "Paraphrased tier 2 description." },
      { "tier": 3, "pillar": "ren",   "level": 5, "tags": [],         "description": "Paraphrased tier 3 description." }
    ]
  },
  {
    "id": "blessed_is_the_god_king",
    "name": "Blessed is the God-King",
    "tiers": [
      { "tier": 1, "pillar": "ren",       "level": 1, "tags": ["Subtle"], "description": "Paraphrased." },
      { "tier": 2, "pillar": "ab",        "level": 3, "tags": ["Subtle"], "description": "Paraphrased." },
      { "tier": 3, "pillar": "defining",  "level": 5, "tags": ["Epic"],   "description": "Paraphrased." }
    ]
  },
  {
    "id": "chthonic_dominion",
    "name": "Chthonic Dominion",
    "tiers": [
      { "tier": 1, "pillar": "ba",    "level": 1, "tags": [],         "description": "Paraphrased." },
      { "tier": 2, "pillar": "sheut", "level": 2, "tags": [],         "description": "Paraphrased." },
      { "tier": 3, "pillar": "ren",   "level": 4, "tags": [],         "description": "Paraphrased." }
    ]
  }
]
```

- [ ] **Step 4: Verify**

```bash
node -e "const u = require('./src/data/utterances.json'); console.log('Utterances:', u.length); u.forEach(x=>{ if(x.tiers.length!==3) console.log('BAD tiers:', x.name); }); console.log('Has defining tier:', u.some(x=>x.tiers.some(t=>t.pillar==='defining')))"
```

Expected: 12–20 Utterances; each with exactly 3 tiers; `Has defining tier: true`.

- [ ] **Step 5: Commit**

```bash
git add src/data/utterances.json
git commit -m "data: extract utterances.json — sample Utterances for Mummy chargen"
```

---

## Task 4: Extract `mummy-merits.json`

**Files:** Create `src/data/mummy-merits.json`

Read the Mummy merits section (pp. 78–83) and extract 6 Mummy-specific merits: Cult (special), Enigma (●–●●●●●), Guild Status (●–●●●●●), Tomb (special), Relic (●+), Vestige (●+).

Study `src/data/vampire-merits.json` first to understand the exact shape required:

```bash
node -e "const v = require('./src/data/vampire-merits.json'); console.log(JSON.stringify(v[0], null, 2))"
```

Each merit has: `id`, `name`, `category` (use `"mummy"`), `min_dots`, `max_dots`, `description`, optionally `prerequisites`.

- [ ] **Step 1: Read vampire-merits.json to understand shape**

Read `src/data/vampire-merits.json` (use the Read tool) to see the exact field names and types.

- [ ] **Step 2: Read PDF pp. 78–83**

```
Read: /home/justina/Desktop/TTRPG Workshop/New World of Darkness/Mummy - The Curse.pdf
pages: "78-83"
```

Extract each merit's name, dot range, prerequisites, and a 1–2 sentence description.

- [ ] **Step 3: Write mummy-merits.json**

Write `src/data/mummy-merits.json` following the exact same shape as vampire-merits.json:

```json
[
  {
    "id": "cult",
    "name": "Cult",
    "category": "mummy",
    "min_dots": 1,
    "max_dots": 5,
    "description": "Paraphrased description.",
    "prerequisites": "Mummy only"
  },
  {
    "id": "enigma",
    "name": "Enigma",
    "category": "mummy",
    "min_dots": 1,
    "max_dots": 5,
    "description": "Paraphrased description.",
    "prerequisites": "No Fame"
  },
  {
    "id": "guild_status",
    "name": "Guild Status",
    "category": "mummy",
    "min_dots": 1,
    "max_dots": 5,
    "description": "Paraphrased description."
  },
  {
    "id": "relic",
    "name": "Relic",
    "category": "mummy",
    "min_dots": 1,
    "max_dots": 5,
    "description": "Paraphrased description."
  },
  {
    "id": "tomb",
    "name": "Tomb",
    "category": "mummy",
    "min_dots": 1,
    "max_dots": 10,
    "description": "Paraphrased description."
  },
  {
    "id": "vestige",
    "name": "Vestige",
    "category": "mummy",
    "min_dots": 1,
    "max_dots": 5,
    "description": "Paraphrased description."
  }
]
```

Fill in real descriptions and correct dot ranges from the PDF.

- [ ] **Step 4: Verify**

```bash
node -e "const m = require('./src/data/mummy-merits.json'); console.log(m.length, 'merits'); m.forEach(x=>console.log(x.name, x.min_dots+'–'+x.max_dots))"
```

Expected: 6 merits listed with their dot ranges.

- [ ] **Step 5: Commit**

```bash
git add src/data/mummy-merits.json
git commit -m "data: extract mummy-merits.json — Cult, Enigma, Guild Status, Relic, Tomb, Vestige"
```

---

## Task 5: `pillarValidation.js` and tests

**Files:**
- Create: `src/utils/pillarValidation.js`
- Create: `src/utils/pillarValidation.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/pillarValidation.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { validatePillars, pillarPointsSpent, utteranceQualifies } from './pillarValidation'

describe('pillarPointsSpent', () => {
  it('counts normally when no pillar is at 5', () => {
    expect(pillarPointsSpent({ ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1 })).toBe(9)
  })

  it('adds 1 extra point for the pillar at 5', () => {
    // ab=5 costs 6 points; ba=1,ka=1,ren=1,sheut=0 → 3 points; total=9
    expect(pillarPointsSpent({ ab: 5, ba: 1, ka: 1, ren: 1, sheut: 0 })).toBe(9)
  })

  it('ignores underscore meta-keys', () => {
    expect(pillarPointsSpent({ ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1, _soul_affinity: 'x' })).toBe(9)
  })
})

describe('validatePillars', () => {
  const defining = { definingPillarId: 'ab' }

  it('returns no errors for a legal 9-point build', () => {
    expect(validatePillars({ ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1 }, defining)).toEqual([])
  })

  it('returns no errors when one pillar is at 0', () => {
    expect(validatePillars({ ab: 3, ba: 2, ka: 2, ren: 2, sheut: 0 }, defining)).toEqual([])
  })

  it('errors when point total is under 9', () => {
    const errors = validatePillars({ ab: 2, ba: 2, ka: 2, ren: 1, sheut: 1 }, defining)
    expect(errors).toContain('Spend exactly 9 dot-points (8 spent).')
  })

  it('errors when point total is over 9', () => {
    const errors = validatePillars({ ab: 3, ba: 3, ka: 2, ren: 1, sheut: 1 }, defining)
    expect(errors).toContain('Spend exactly 9 dot-points (10 spent).')
  })

  it('errors when a non-defining pillar exceeds the defining pillar', () => {
    // ab=2 (defining), ba=4 — ba > ab
    const errors = validatePillars({ ab: 2, ba: 4, ka: 1, ren: 1, sheut: 1 }, defining)
    expect(errors).toContain('No Pillar may exceed your defining Pillar.')
  })

  it('allows the defining pillar to equal non-defining pillars', () => {
    // ab=3 (defining), ba=3 — equal is fine
    expect(validatePillars({ ab: 3, ba: 3, ka: 2, ren: 1, sheut: 0 }, { definingPillarId: 'ab' })).toEqual([])
  })

  it('errors when two pillars are at zero', () => {
    const errors = validatePillars({ ab: 4, ba: 3, ka: 2, ren: 0, sheut: 0 }, defining)
    expect(errors).toContain('At most one Pillar may be left at 0.')
  })

  it('errors when a pillar is at 5 but another is at zero', () => {
    // ab=5 (6pts) + ba=1+ka=1+ren=1+sheut=0 = 9pts, but five-and-zero violates the rule
    const errors = validatePillars({ ab: 5, ba: 1, ka: 1, ren: 1, sheut: 0 }, defining)
    expect(errors).toContain('To take the 5th dot in a Pillar, all others must have at least 1.')
  })

  it('ignores underscore meta-keys', () => {
    const powers = { ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1, _soul_affinity: 'blessed_soul' }
    expect(validatePillars(powers, defining)).toEqual([])
  })
})

describe('utteranceQualifies', () => {
  const utterance = {
    id: 'awaken_the_dead',
    name: 'Awaken the Dead',
    tiers: [
      { tier: 1, pillar: 'ba',    level: 1, tags: [], description: '' },
      { tier: 2, pillar: 'sheut', level: 3, tags: [], description: '' },
      { tier: 3, pillar: 'ren',   level: 5, tags: [], description: '' },
    ]
  }

  it('returns true when the tier-1 Pillar minimum is met', () => {
    expect(utteranceQualifies(utterance, { ba: 1 })).toBe(true)
    expect(utteranceQualifies(utterance, { ba: 3 })).toBe(true)
  })

  it('returns false when the tier-1 Pillar minimum is not met', () => {
    expect(utteranceQualifies(utterance, { ba: 0 })).toBe(false)
    expect(utteranceQualifies(utterance, {})).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test -- --run src/utils/pillarValidation.test.js
```

Expected: all tests fail with "Cannot find module './pillarValidation'".

- [ ] **Step 3: Write pillarValidation.js**

Create `src/utils/pillarValidation.js`:

```js
export function pillarPointsSpent(powers) {
  return Object.entries(powers)
    .filter(([k]) => !k.startsWith('_'))
    .reduce((s, [, v]) => s + (v || 0) + ((v || 0) === 5 ? 1 : 0), 0)
}

export function validatePillars(powers, { definingPillarId }) {
  const entries = Object.entries(powers).filter(([k]) => !k.startsWith('_'))
  const spent = pillarPointsSpent(powers)
  const definingDots = powers[definingPillarId] || 0
  const zeros = entries.filter(([, v]) => (v || 0) === 0).length
  const hasFive = entries.some(([, v]) => (v || 0) === 5)
  const errors = []

  if (spent !== 9) errors.push(`Spend exactly 9 dot-points (${spent} spent).`)
  if (entries.some(([id, v]) => id !== definingPillarId && (v || 0) > definingDots)) {
    errors.push('No Pillar may exceed your defining Pillar.')
  }
  if (zeros > 1) errors.push('At most one Pillar may be left at 0.')
  if (hasFive && zeros > 0) errors.push('To take the 5th dot in a Pillar, all others must have at least 1.')

  return errors
}

export function utteranceQualifies(utterance, powers) {
  const tier1 = utterance.tiers.find(t => t.tier === 1)
  if (!tier1) return false
  return (powers[tier1.pillar] || 0) >= tier1.level
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- --run src/utils/pillarValidation.test.js
```

Expected: all 13 tests pass.

- [ ] **Step 5: Run the full suite to check for regressions**

```bash
npm run test -- --run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/utils/pillarValidation.js src/utils/pillarValidation.test.js
git commit -m "feat: add pillarValidation utility with 13 tests"
```

---

## Task 6: `PillarsPowers` component + StepPowers dispatch + tests

**Files:**
- Modify: `src/components/wizard/StepPowers.jsx`
- Modify: `src/components/wizard/StepPowers.test.jsx`

This task adds two new components (`PillarsPowers` and `UtteranceEntry`) to StepPowers.jsx, plus a `pillars` branch in the dispatch switch. Read `src/components/wizard/StepPowers.jsx` before starting — the existing pattern is: components are defined above the default export, and the type dispatch is a ternary chain at line ~541.

The `PillarsPowers` component receives `{ lineData, template, powers, onSetPowers }` and renders:
1. Pillar dot allocator (top) — with Defining badge and validation messages
2. Affinity section (middle) — active only when Pillars are valid
3. Utterance section (bottom) — active only when Pillars are valid

- [ ] **Step 1: Write the failing tests**

Add this describe block to `src/components/wizard/StepPowers.test.jsx`, after the existing imports and before the last `describe` block:

```jsx
import AFFINITIES from '../../data/affinities.json'
import UTTERANCES from '../../data/utterances.json'
import mummy from '../../data/lines/mummy.json'
```

Add these imports at the top of the file alongside the existing imports, then add the describe block:

```jsx
describe('StepPowers — pillars type (Mummy)', () => {
  // Use a valid Moros-equivalent build for testing: heart decree (defining=ab)
  const validBuild = { ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1 }
  const heartTemplate = { decree: 'heart', guild: 'maa_kep' }

  // Pull real data so tests don't depend on exact affinity names
  const soulAb = AFFINITIES.find(a => a.type === 'soul' && a.pillar === 'ab')
  const miscNoReq = AFFINITIES.find(a => a.type === 'misc' && !a.pillar)
  const utteranceWithBa1 = UTTERANCES.find(u => u.tiers.find(t => t.tier === 1 && t.pillar === 'ba' && t.level === 1))

  it('renders all 5 Pillar names', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('Ab')).toBeInTheDocument()
    expect(screen.getByText('Ba')).toBeInTheDocument()
    expect(screen.getByText('Sheut')).toBeInTheDocument()
  })

  it('shows Defining badge for the decree defining pillar', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('Defining')).toBeInTheDocument()
  })

  it('shows dot-point counter', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText(/0 of 9 dot-points spent/i)).toBeInTheDocument()
  })

  it('shows a validation error when points are not fully spent', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={{ ab: 2 }} onSetPowers={() => {}} />)
    expect(screen.getByText('Spend exactly 9 dot-points (2 spent).')).toBeInTheDocument()
  })

  it('shows no validation errors for a fully legal build', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.queryByText(/Spend exactly 9 dot-points/)).toBeNull()
    expect(screen.queryByText(/No Pillar may exceed/)).toBeNull()
    expect(screen.queryByText(/At most one Pillar/)).toBeNull()
  })

  it('shows Affinity section only after Pillars are valid', () => {
    const { rerender } = render(<StepPowers lineData={mummy} template={heartTemplate} powers={{ ab: 2 }} onSetPowers={() => {}} />)
    expect(screen.queryByText('Affinities')).toBeNull()

    rerender(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.getByText('Affinities')).toBeInTheDocument()
  })

  it('shows Soul Affinity dropdown with soul affinities for the decree pillar', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.getByText(/Soul Affinity/i)).toBeInTheDocument()
    expect(soulAb).toBeDefined()
    expect(screen.getAllByText(soulAb.name).length).toBeGreaterThan(0)
  })

  it('shows guild affinity name in the Guild Affinity slot', () => {
    const guildAffinityId = mummy.template.group2.options.find(o => o.id === 'maa_kep')?.guildAffinity
    const guildAffinity = AFFINITIES.find(a => a.id === guildAffinityId)
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(guildAffinity).toBeDefined()
    expect(screen.getByText(guildAffinity.name)).toBeInTheDocument()
  })

  it('calls onSetPowers with _free_affinity when a free affinity is picked', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={{ ...validBuild, ab: 3 }} onSetPowers={onSetPowers} />)
    // miscNoReq has no pillar prerequisite so is always shown in the free list
    expect(miscNoReq).toBeDefined()
    const el = screen.getByText(miscNoReq.name)
    fireEvent.click(el.closest('[class]') || el)
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ _free_affinity: miscNoReq.id }))
  })

  it('shows Utterance section only after Pillars are valid', () => {
    const { rerender } = render(<StepPowers lineData={mummy} template={heartTemplate} powers={{ ab: 2 }} onSetPowers={() => {}} />)
    expect(screen.queryByText('Utterances')).toBeNull()

    rerender(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.getByText('Utterances')).toBeInTheDocument()
  })

  it('shows an utterance that the character qualifies for', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(utteranceWithBa1).toBeDefined()
    expect(screen.getByText(utteranceWithBa1.name)).toBeInTheDocument()
  })

  it('unlocks a second utterance slot when all 5 pillars have at least 1 dot', () => {
    // validBuild has sheut:1 (all 5 ≥ 1) — should show "1 of 2"
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.getByText(/1 of 2|0 of 2/)).toBeInTheDocument()
  })

  it('keeps utterance slot at 1 when a pillar is at 0', () => {
    const buildWithZero = { ab: 3, ba: 2, ka: 2, ren: 2, sheut: 0 }
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={buildWithZero} onSetPowers={() => {}} />)
    expect(screen.getByText(/of 1/)).toBeInTheDocument()
  })

  it('calls onSetPowers with _utterances when an utterance is selected', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={onSetPowers} />)
    expect(utteranceWithBa1).toBeDefined()
    fireEvent.click(screen.getByText(utteranceWithBa1.name))
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ _utterances: [utteranceWithBa1.id] }))
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test -- --run src/components/wizard/StepPowers.test.jsx
```

Expected: the new `pillars` tests fail; existing tests still pass.

- [ ] **Step 3: Add imports to StepPowers.jsx**

At the top of `src/components/wizard/StepPowers.jsx`, after the existing imports, add:

```jsx
import AFFINITIES from '../../data/affinities.json'
import UTTERANCES from '../../data/utterances.json'
import { validatePillars, pillarPointsSpent, utteranceQualifies } from '../../utils/pillarValidation'
```

- [ ] **Step 4: Add UtteranceEntry component**

Add `UtteranceEntry` before the `PillarsPowers` component:

```jsx
function UtteranceEntry({ utterance, isSelected, isDisabled, definingPillarName, onToggle }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`p-2 rounded border transition-colors ${
      isSelected ? 'border-amber-400 bg-gray-800' : isDisabled ? 'border-gray-800 opacity-40' : 'border-gray-700 text-gray-400 hover:border-gray-500'
    }`}>
      <div
        className={`flex items-center justify-between gap-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={isDisabled ? undefined : onToggle}
      >
        <span className={`text-sm font-medium ${isSelected ? 'text-gray-100' : isDisabled ? 'text-gray-600' : 'text-gray-300'}`}>
          {utterance.name}
        </span>
        <div className="flex items-center gap-2">
          {isSelected && <span className="text-amber-400 text-xs">✓</span>}
          <button
            onClick={e => { e.stopPropagation(); setExpanded(x => !x) }}
            className="text-xs text-gray-600 select-none px-1"
          >
            {expanded ? '▾' : '▸'}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-1 ml-1 border-l-2 border-gray-700 pl-3 text-xs space-y-1">
          {utterance.tiers.map(tier => {
            const pillarLabel = tier.pillar === 'defining'
              ? `${definingPillarName ?? 'Defining'} [Defining]`
              : tier.pillar.charAt(0).toUpperCase() + tier.pillar.slice(1)
            return (
              <div key={tier.tier} className="text-gray-500">
                <span className="text-amber-600">Tier {tier.tier}:</span>{' '}
                {pillarLabel} {'●'.repeat(tier.level)}
                {tier.tags.length > 0 ? ` [${tier.tags.join(', ')}]` : ''} — {tier.description}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Add PillarsPowers component**

Add `PillarsPowers` after `UtteranceEntry`:

```jsx
function PillarsPowers({ lineData, template, powers, onSetPowers }) {
  const { items, totalDots, definingFrom, description } = lineData.powers
  const decreeGroup = definingFrom ? lineData.template[definingFrom] : null
  const decreeId = decreeGroup ? template[decreeGroup.field] : null
  const decreeOption = decreeId ? decreeGroup.options.find(o => o.id === decreeId) : null
  const definingPillarId = decreeOption?.definingPillar ?? null

  const guildGroup = lineData.template.group2
  const guildId = template[guildGroup.field]
  const guildOption = guildId ? guildGroup.options.find(o => o.id === guildId) : null
  const guildAffinityId = guildOption?.guildAffinity ?? null

  const spent = pillarPointsSpent(powers)
  const errors = definingPillarId ? validatePillars(powers, { definingPillarId }) : ['Choose a Decree first.']
  const isValid = errors.length === 0

  const soulAffinities = definingPillarId
    ? AFFINITIES.filter(a => a.type === 'soul' && a.pillar === definingPillarId)
    : []
  const guildAffinity = guildAffinityId ? AFFINITIES.find(a => a.id === guildAffinityId) : null

  const selectedSoul = powers._soul_affinity || soulAffinities[0]?.id || null
  const selectedFree = powers._free_affinity || null
  const selectedUtterances = powers._utterances || []

  const allFiveRated = items.every(i => (powers[i.id] || 0) >= 1)
  const utteranceSlots = allFiveRated ? 2 : 1
  const eligibleUtterances = isValid ? UTTERANCES.filter(u => utteranceQualifies(u, powers)) : []

  const excludeIds = new Set([selectedSoul, guildAffinityId].filter(Boolean))
  const freeAffinityList = isValid
    ? AFFINITIES.filter(a => {
        if (excludeIds.has(a.id)) return false
        if (a.pillar && a.prerequisite != null) return (powers[a.pillar] || 0) >= a.prerequisite
        return true
      })
    : []

  const handlePillarChange = (id, v) => {
    const next = { ...powers, [id]: v }
    if (pillarPointsSpent(next) <= totalDots || v < (powers[id] || 0)) onSetPowers(next)
  }

  const setSoulAffinity = id => onSetPowers({ ...powers, _soul_affinity: id })
  const toggleFreeAffinity = id =>
    onSetPowers({ ...powers, _free_affinity: selectedFree === id ? null : id })
  const toggleUtterance = id => {
    const next = selectedUtterances.includes(id)
      ? selectedUtterances.filter(u => u !== id)
      : selectedUtterances.length < utteranceSlots ? [...selectedUtterances, id] : selectedUtterances
    onSetPowers({ ...powers, _utterances: next })
  }

  const definingPillarName = items.find(i => i.id === definingPillarId)?.name ?? null

  return (
    <div>
      <p className="text-gray-400 mb-2">{description}</p>
      <p className={`text-sm mb-2 font-medium ${spent > totalDots ? 'text-red-400' : 'text-amber-400'}`}>
        {spent} of {totalDots} dot-points spent (5th dot costs 2)
      </p>
      {errors.length > 0 && (
        <ul className="text-xs text-red-400 mb-3 space-y-0.5">
          {errors.map(e => <li key={e}>{e}</li>)}
        </ul>
      )}
      <div className="space-y-1 max-w-sm mb-8">
        {items.map(item => {
          const isDefining = item.id === definingPillarId
          const maxDots = isDefining ? 5 : Math.min(5, powers[definingPillarId] || 0)
          return (
            <div key={item.id} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300 w-28">{item.name}</span>
                {isDefining && <span className="text-xs text-amber-500 bg-amber-900/30 px-1 rounded">Defining</span>}
              </div>
              <DotRating value={powers[item.id] || 0} max={maxDots} onChange={v => handlePillarChange(item.id, v)} />
            </div>
          )
        })}
      </div>

      {!isValid && (
        <p className="text-gray-600 text-sm">Complete your Pillar allocation above to unlock Affinities and Utterances.</p>
      )}

      {isValid && (
        <>
          <div className="mb-8">
            <h3 className="font-semibold text-gray-200 mb-4">Affinities</h3>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Soul Affinity (from Decree)</p>
              <select
                value={selectedSoul || ''}
                onChange={e => setSoulAffinity(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100 w-full max-w-sm"
              >
                {soulAffinities.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.pillar} {a.prerequisite})</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Guild Affinity (from Guild)</p>
              <p className="text-sm text-gray-300">{guildAffinity?.name ?? '—'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Free Affinity — pick one you qualify for</p>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {freeAffinityList.map(a => {
                  const isSelected = selectedFree === a.id
                  const prereqLabel = a.pillar && a.prerequisite != null
                    ? `${a.pillar} ${'●'.repeat(a.prerequisite)}`
                    : a.cultPrerequisite ? `Cult ${a.cultPrerequisite} (check)` : '—'
                  return (
                    <div
                      key={a.id}
                      onClick={() => toggleFreeAffinity(a.id)}
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        isSelected ? 'border-amber-400 bg-gray-800' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isSelected ? 'text-gray-100' : 'text-gray-300'}`}>{a.name}</span>
                        <span className="text-xs text-amber-500 shrink-0 ml-2">{prereqLabel}</span>
                      </div>
                      <p className={`text-xs mt-1 ${isSelected ? 'text-gray-400' : 'text-gray-600'}`}>{a.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-200 mb-1 flex items-center gap-2">
              Utterances
              <span className={`text-xs px-2 py-0.5 rounded ${
                selectedUtterances.length === utteranceSlots ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
              }`}>
                {selectedUtterances.length} of {utteranceSlots}
              </span>
            </h3>
            {allFiveRated && (
              <p className="text-xs text-amber-500 mb-2">All Pillars rated — bonus Utterance unlocked!</p>
            )}
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1 mt-3">
              {eligibleUtterances.map(u => {
                const isSelected = selectedUtterances.includes(u.id)
                const isMaxed = !isSelected && selectedUtterances.length >= utteranceSlots
                return (
                  <UtteranceEntry
                    key={u.id}
                    utterance={u}
                    isSelected={isSelected}
                    isDisabled={isMaxed}
                    definingPillarName={definingPillarName}
                    onToggle={() => toggleUtterance(u.id)}
                  />
                )
              })}
              {eligibleUtterances.length === 0 && (
                <p className="text-gray-600 text-sm">No Utterances available for your current Pillar allocation.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Add `pillars` branch to the dispatch in the default export**

In `src/components/wizard/StepPowers.jsx`, find the ternary chain in the default export that starts with `type === 'gifts'`. Add a `pillars` branch:

```jsx
// Change from:
type === 'gifts'
  ? <GiftsPowers ... />
  : type === 'arcana'
    ? <ArcanaPowers ... />
    : type === 'pool'
      ? <PoolPowers ... />
      : <PicksPowers ... />

// Change to:
type === 'gifts'
  ? <GiftsPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} renown={renown} />
  : type === 'arcana'
    ? <ArcanaPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} />
    : type === 'pillars'
      ? <PillarsPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} />
      : type === 'pool'
        ? <PoolPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} />
        : <PicksPowers lineData={lineData} powers={powers} onSetPowers={onSetPowers} />
```

- [ ] **Step 7: Run the tests to verify they pass**

```bash
npm run test -- --run src/components/wizard/StepPowers.test.jsx
```

Expected: all tests pass including the new `pillars` suite.

- [ ] **Step 8: Run the full suite**

```bash
npm run test -- --run
```

Expected: all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/wizard/StepPowers.jsx src/components/wizard/StepPowers.test.jsx
git commit -m "feat: add PillarsPowers component with Affinity/Utterance pickers for Mummy"
```

---

## Task 7: `App.jsx` step-5 `canAdvance` guard for Pillars

**Files:** Modify `src/App.jsx`

The existing step-5 guard (around line 77) handles `type === 'arcana'`. Add a parallel `pillars` branch.

- [ ] **Step 1: Read App.jsx lines 77–89 to see the existing guard pattern**

```
Read src/App.jsx lines 77-89
```

- [ ] **Step 2: Add import for pillarValidation**

At the top of `src/App.jsx`, add `validatePillars` and `utteranceQualifies` to the existing arcanaValidation import or add a new import:

```js
import { validatePillars } from './utils/pillarValidation'
```

- [ ] **Step 3: Add the pillars guard**

In `canAdvance`, after the existing `if (step === 5 && lineData?.powers?.type === 'arcana')` block, add:

```js
if (step === 5 && lineData?.powers?.type === 'pillars') {
  const decreeGroup = lineData.template[lineData.powers.definingFrom]
  const decreeId = character.template[decreeGroup.field]
  const decreeOption = decreeGroup.options.find(o => o.id === decreeId)
  const definingPillarId = decreeOption?.definingPillar ?? null
  if (!definingPillarId) return false
  return (
    validatePillars(character.powers, { definingPillarId }).length === 0 &&
    !!character.powers._free_affinity &&
    (character.powers._utterances || []).length >= 1
  )
}
```

- [ ] **Step 4: Run the full suite to verify no regressions**

```bash
npm run test -- --run
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add pillars canAdvance guard to App.jsx"
```

---

## Task 8: `StepReview` Affinities + Utterances display + tests

**Files:**
- Modify: `src/components/wizard/StepReview.jsx`
- Modify: `src/components/wizard/StepReview.test.jsx`

Read `src/components/wizard/StepReview.jsx` before starting. The powers display block (around line 44–64) already renders `powerEntries` (pillar dots) and shows rotes when present. Add Affinities and Utterances display after the rotes block using the same pattern.

- [ ] **Step 1: Write the failing tests**

Add to `src/components/wizard/StepReview.test.jsx`. First add imports at the top:

```js
import AFFINITIES from '../../data/affinities.json'
import UTTERANCES from '../../data/utterances.json'
import mummy from '../../data/lines/mummy.json'
```

Then add a `describe` block for the Mummy display:

```jsx
describe('StepReview — Mummy Affinities + Utterances display', () => {
  const guildAffinityId = mummy.template.group2.options.find(o => o.id === 'maa_kep')?.guildAffinity
  const guildAffinity = AFFINITIES.find(a => a.id === guildAffinityId)
  const utterance = UTTERANCES[0]

  const basePowers = {
    ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1,
    _soul_affinity: AFFINITIES.find(a => a.type === 'soul' && a.pillar === 'ab')?.id,
    _guild_affinity: guildAffinityId,
    _free_affinity: AFFINITIES.find(a => a.type === 'misc' && !a.pillar)?.id,
    _utterances: [utterance?.id],
  }

  const baseCharacter = {
    meta: { name: 'Test', concept: '', virtue: '', vice: '', player: '', chronicle: '', line: 'mummy' },
    template: { decree: 'heart', guild: 'maa_kep' },
    attributes: { mental: { intelligence:1,wits:1,resolve:1 }, physical: { strength:1,dexterity:1,stamina:1 }, social: { presence:1,manipulation:1,composure:1 } },
    skills: { mental: { academics:0,computer:0,crafts:0,investigation:0,medicine:0,occult:0,politics:0,science:0 }, physical: { athletics:0,brawl:0,drive:0,firearms:0,larceny:0,stealth:0,survival:0,weaponry:0 }, social: { animal_ken:0,empathy:0,expression:0,intimidation:0,persuasion:0,socialize:0,streetwise:0,subterfuge:0 } },
    specialties: [],
    powers: basePowers,
    merits: [],
    derived: { health:6,willpower:3,speed:5,defense:1,initiative:2, resource_pool:{name:'',max:0}, integrity:{name:'Memory',value:3}, supernatural_trait:{name:'',value:0} },
    notes: '',
  }

  it('does not render underscore meta-keys as raw data', () => {
    render(<StepReview character={baseCharacter} lineData={mummy} onUpdateNotes={() => {}} />)
    expect(screen.queryByText(/_soul_affinity/)).toBeNull()
    expect(screen.queryByText(/_utterances/)).toBeNull()
  })

  it('renders Affinity names and Utterance name', () => {
    render(<StepReview character={baseCharacter} lineData={mummy} onUpdateNotes={() => {}} />)
    expect(guildAffinity).toBeDefined()
    expect(utterance).toBeDefined()
    expect(screen.getByText(guildAffinity.name, { exact: false })).toBeInTheDocument()
    expect(screen.getByText(utterance.name, { exact: false })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

```bash
npm run test -- --run src/components/wizard/StepReview.test.jsx
```

Expected: the 2 new tests fail.

- [ ] **Step 3: Add imports to StepReview.jsx**

At the top of `src/components/wizard/StepReview.jsx`, add:

```js
import AFFINITIES from '../../data/affinities.json'
import UTTERANCES from '../../data/utterances.json'
```

- [ ] **Step 4: Add display blocks**

Inside the Powers section of `StepReview.jsx`, after the rotes block (after the `_rotes` check), add:

```jsx
{(powers._soul_affinity || powers._guild_affinity || powers._free_affinity) && (
  <div className="text-gray-500">
    Affinities: {[
      AFFINITIES.find(a => a.id === powers._soul_affinity)?.name,
      AFFINITIES.find(a => a.id === powers._guild_affinity)?.name,
      AFFINITIES.find(a => a.id === powers._free_affinity)?.name,
    ].filter(Boolean).join(', ')}
  </div>
)}
{(powers._utterances || []).length > 0 && (
  <div className="text-gray-500">
    Utterances: {(powers._utterances || []).map(id => UTTERANCES.find(u => u.id === id)?.name ?? id).join(', ')}
  </div>
)}
```

- [ ] **Step 5: Run tests**

```bash
npm run test -- --run src/components/wizard/StepReview.test.jsx
```

Expected: all tests pass.

- [ ] **Step 6: Run full suite**

```bash
npm run test -- --run
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/wizard/StepReview.jsx src/components/wizard/StepReview.test.jsx
git commit -m "feat: display Affinities and Utterances in StepReview for Mummy"
```

---

## Task 9: `CharacterSheet` Affinities + Utterances display + tests

**Files:**
- Modify: `src/components/sheet/CharacterSheet.jsx`
- Modify: `src/components/sheet/CharacterSheet.test.jsx`

Same pattern as Task 8. Read `src/components/sheet/CharacterSheet.jsx` first — the powers display section is around line 89–116. The `powerEntries` filter and rotes display already exist.

- [ ] **Step 1: Write the failing tests**

Add to `src/components/sheet/CharacterSheet.test.jsx`. Add the same imports as Task 8:

```js
import AFFINITIES from '../../data/affinities.json'
import UTTERANCES from '../../data/utterances.json'
import mummy from '../../data/lines/mummy.json'
```

Add a `describe` block for Mummy display (same character fixture as Task 8):

```jsx
describe('CharacterSheet — Mummy Affinities + Utterances display', () => {
  const guildAffinityId = mummy.template.group2.options.find(o => o.id === 'maa_kep')?.guildAffinity
  const guildAffinity = AFFINITIES.find(a => a.id === guildAffinityId)
  const utterance = UTTERANCES[0]

  const basePowers = {
    ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1,
    _soul_affinity: AFFINITIES.find(a => a.type === 'soul' && a.pillar === 'ab')?.id,
    _guild_affinity: guildAffinityId,
    _free_affinity: AFFINITIES.find(a => a.type === 'misc' && !a.pillar)?.id,
    _utterances: [utterance?.id],
  }

  const baseCharacter = {
    meta: { name: 'Test', concept: '', virtue: '', vice: '', player: '', chronicle: '', line: 'mummy' },
    template: { decree: 'heart', guild: 'maa_kep' },
    attributes: { mental: { intelligence:1,wits:1,resolve:1 }, physical: { strength:1,dexterity:1,stamina:1 }, social: { presence:1,manipulation:1,composure:1 } },
    skills: { mental: { academics:0,computer:0,crafts:0,investigation:0,medicine:0,occult:0,politics:0,science:0 }, physical: { athletics:0,brawl:0,drive:0,firearms:0,larceny:0,stealth:0,survival:0,weaponry:0 }, social: { animal_ken:0,empathy:0,expression:0,intimidation:0,persuasion:0,socialize:0,streetwise:0,subterfuge:0 } },
    specialties: [],
    powers: basePowers,
    merits: [],
    derived: { health:6,willpower:3,speed:5,defense:1,initiative:2, resource_pool:{name:'Sekhem',max:10}, integrity:{name:'Memory',value:3}, supernatural_trait:{name:'',value:0} },
    renown: {},
    notes: '',
  }

  it('does not render underscore meta-keys as raw data', () => {
    render(<CharacterSheet character={baseCharacter} lineData={mummy} />)
    expect(screen.queryByText(/_soul_affinity/)).toBeNull()
    expect(screen.queryByText(/_utterances/)).toBeNull()
  })

  it('renders Affinity and Utterance names', () => {
    render(<CharacterSheet character={baseCharacter} lineData={mummy} />)
    expect(guildAffinity).toBeDefined()
    expect(utterance).toBeDefined()
    expect(screen.getByText(guildAffinity.name, { exact: false })).toBeInTheDocument()
    expect(screen.getByText(utterance.name, { exact: false })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

```bash
npm run test -- --run src/components/sheet/CharacterSheet.test.jsx
```

- [ ] **Step 3: Add imports to CharacterSheet.jsx**

At the top of `src/components/sheet/CharacterSheet.jsx`, add:

```js
import AFFINITIES from '../../data/affinities.json'
import UTTERANCES from '../../data/utterances.json'
```

- [ ] **Step 4: Add display blocks**

In `CharacterSheet.jsx`, inside the powers display section, after the rotes block (after the `_rotes` check), add:

```jsx
{(powers._soul_affinity || powers._guild_affinity || powers._free_affinity) && (
  <div style={{ marginTop: '4px' }}>
    <strong>Affinities: </strong>{[
      AFFINITIES.find(a => a.id === powers._soul_affinity)?.name,
      AFFINITIES.find(a => a.id === powers._guild_affinity)?.name,
      AFFINITIES.find(a => a.id === powers._free_affinity)?.name,
    ].filter(Boolean).join(', ')}
  </div>
)}
{(powers._utterances || []).length > 0 && (
  <div style={{ marginTop: '4px' }}>
    <strong>Utterances: </strong>{(powers._utterances || []).map(id => UTTERANCES.find(u => u.id === id)?.name ?? id).join(', ')}
  </div>
)}
```

- [ ] **Step 5: Run tests**

```bash
npm run test -- --run src/components/sheet/CharacterSheet.test.jsx
```

Expected: all tests pass.

- [ ] **Step 6: Run full suite**

```bash
npm run test -- --run
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/sheet/CharacterSheet.jsx src/components/sheet/CharacterSheet.test.jsx
git commit -m "feat: display Affinities and Utterances in CharacterSheet for Mummy"
```

---

## Task 10: Wire Mummy merits into `StepMerits` + test

**Files:**
- Modify: `src/components/wizard/StepMerits.jsx`
- Modify: `src/components/wizard/StepMerits.test.jsx`

The `LINE_MERITS` map in `StepMerits.jsx` (line 10) currently has `vampire`, `werewolf`, and `mage`. Add `mummy`.

- [ ] **Step 1: Write the failing test**

Add to `src/components/wizard/StepMerits.test.jsx`:

```jsx
import mummy from '../../data/lines/mummy.json'

describe('StepMerits — Mummy tab', () => {
  it('shows Mummy-specific merits when mummy tab is active', () => {
    render(<StepMerits merits={[]} onAdd={() => {}} onRemove={() => {}} lineId="mummy" />)
    fireEvent.click(screen.getByRole('button', { name: /mummy/i }))
    expect(screen.getByText('Cult')).toBeInTheDocument()
    expect(screen.getByText('Enigma')).toBeInTheDocument()
  })
})
```

(Import `{ render, screen, fireEvent }` from `@testing-library/react` and `StepMerits` if not already imported in that file — check the existing imports first.)

- [ ] **Step 2: Run to verify the test fails**

```bash
npm run test -- --run src/components/wizard/StepMerits.test.jsx
```

Expected: new test fails; existing tests pass.

- [ ] **Step 3: Add the import and map entry to StepMerits.jsx**

In `src/components/wizard/StepMerits.jsx`, add the import after the existing merit imports:

```js
import MUMMY_MERITS from '../../data/mummy-merits.json'
```

Change the `LINE_MERITS` constant:

```js
const LINE_MERITS = { vampire: VAMPIRE_MERITS, werewolf: WEREWOLF_MERITS, mage: MAGE_MERITS, mummy: MUMMY_MERITS }
```

- [ ] **Step 4: Run tests**

```bash
npm run test -- --run src/components/wizard/StepMerits.test.jsx
```

Expected: all tests pass.

- [ ] **Step 5: Run full suite**

```bash
npm run test -- --run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/wizard/StepMerits.jsx src/components/wizard/StepMerits.test.jsx
git commit -m "feat: wire Mummy merits into StepMerits"
```

---

## Done

After Task 10 passes, run the full suite one final time:

```bash
npm run test -- --run
```

Then push:

```bash
git push
```
