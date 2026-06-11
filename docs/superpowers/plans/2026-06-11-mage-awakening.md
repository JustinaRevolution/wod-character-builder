# Mage: the Awakening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Mage: the Awakening support — a rules-enforcing Arcana allocator, a budget-based rote picker backed by a full `spells.json` extracted from the Mage 1e core book, and Mage-specific merits.

**Architecture:** `spells.json` holds all spells keyed by Arcanum (10 entries, PDF pages ~130–281). `mage.json` powers type changes to `"arcana"` with the real chargen rules (6 dots, 2/2/1+1 structure enforced via an equivalent rule set in `src/utils/arcanaValidation.js`, shared by the component and `App.jsx` step gating). A new `ArcanaPowers` component (inside `StepPowers.jsx`) renders the dot allocator plus a `GiftsPowers`-style rote picker. Arcana state is stored flat in `powers` (like pool lines) with rotes under the `_rotes` meta-key. `mage-merits.json` wires into `StepMerits` like the vampire/werewolf merit files.

**Tech Stack:** React 18, Vite, Tailwind CSS, Vitest + Testing Library

**Source PDF:** `/home/justina/Desktop/TTRPG Workshop/New World of Darkness/Mage - The Awakening.pdf` (402 PDF pages; page numbers below are PDF pages, not book pages)

---

## File Map

| Action | Path |
|--------|------|
| Create | `src/data/spells.json` |
| Create | `src/data/mage-merits.json` |
| Create | `src/utils/arcanaValidation.js` |
| Create | `src/utils/arcanaValidation.test.js` |
| Modify | `src/data/lines/mage.json` |
| Modify | `src/components/wizard/StepPowers.jsx` |
| Modify | `src/components/wizard/StepPowers.test.jsx` |
| Modify | `src/components/wizard/StepMerits.jsx` |
| Modify | `src/components/wizard/StepMerits.test.jsx` |
| Modify | `src/components/wizard/StepReview.jsx` |
| Modify | `src/components/wizard/StepReview.test.jsx` |
| Modify | `src/components/sheet/CharacterSheet.jsx` |
| Modify | `src/components/sheet/CharacterSheet.test.jsx` |
| Modify | `src/App.jsx` |

---

## Spell Extraction — shared instructions for Tasks 1–10

Every extraction task uses the same spell shape. Spells appear in the PDF grouped under dot-level headings within each Arcanum chapter (e.g. "Death •", then "Death ••", …). Each spell entry has a stat block (`Practice:`, `Action:`, `Duration:`, `Aspect:`, `Cost:`) followed by rules text, usually ending in a sample order rote with a dice pool.

```json
{
  "id": "forensic_gaze",
  "level": 1,
  "name": "Forensic Gaze",
  "practice": "Knowing",
  "cost": "None",
  "aspect": "Covert",
  "action": "Instant",
  "dice": "Intelligence + Medicine + Death",
  "description": "The mage stares at a corpse to learn what killed it and how long ago it died, no autopsy required."
}
```

Extraction rules (apply to every task):
- `id` is `snake_case` of the spell name. If an id would collide with one already in `spells.json`, prefix it with the arcanum id (e.g. `death_clairvoyance`).
- `level` comes from the dot-level heading the spell sits under.
- `dice` is the dice pool of the spell's sample rote (the "Rote:" sub-block at the end of the entry). If the spell has no sample rote or no roll, use `"—"`.
- `description` is one or two original sentences summarizing the effect — do not copy long passages.
- Conjunctional spells (requiring a second Arcanum, e.g. "Death •• + Matter •") are filed under the chapter's Arcanum at the chapter's level; note the extra requirement at the end of the description (e.g. "Requires Matter •.").
- Skip sidebar variants and optional-Arcanum add-ons as separate entries.
- If the last spell in the page range is cut off, read the next 3–4 pages to finish it.

Validation command (run after every extraction task — checks the new arcanum, required fields, and global id uniqueness):

```bash
node -e "
const d = require('./src/data/spells.json');
const a = d.ARCANUM_ID;
if (!a) { console.error('MISSING ARCANUM'); process.exit(1) }
const bad = a.spells.filter(s => !s.id || !s.name || !s.level || !s.practice || !s.cost || !s.aspect || !s.action || !s.dice || !s.description);
if (bad.length) { console.error('INCOMPLETE:', bad.map(s => s.name)); process.exit(1) }
const wrongLevel = a.spells.filter(s => s.level < 1 || s.level > 5);
if (wrongLevel.length) { console.error('BAD LEVEL:', wrongLevel.map(s => s.name)); process.exit(1) }
const ids = Object.values(d).flatMap(x => x.spells.map(s => s.id));
const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
if (dup.length) { console.error('DUPLICATE IDS:', dup); process.exit(1) }
console.log('OK —', a.spells.length, 'spells in', a.name, '· total', ids.length);
"
```

(Replace `ARCANUM_ID` with the task's arcanum id.)

---

## Task 1 — Create `spells.json` with the Death Arcanum

**Files:**
- Create: `src/data/spells.json`

- [ ] **Step 1: Read PDF pages 130–146**

```
Read("/home/justina/Desktop/TTRPG Workshop/New World of Darkness/Mage - The Awakening.pdf", pages: "130-146")
```

The Death chapter starts around page 134 (pages 130–133 are the Arcana intro — skip it). Extract every Death spell per the shared instructions above.

- [ ] **Step 2: Create the file**

```json
{
  "death": {
    "id": "death",
    "name": "Death",
    "spells": [ /* extracted spells, in book order */ ]
  }
}
```

- [ ] **Step 3: Validate** — run the shared validation command with `ARCANUM_ID` = `death`. Expected: `OK — <n> spells in Death …`

- [ ] **Step 4: Commit**

```bash
git add src/data/spells.json
git commit -m "feat: add spells.json — Death Arcanum"
```

---

## Task 2 — Extract Fate spells (pages 146–162)

**Files:** Modify: `src/data/spells.json`

- [ ] **Step 1: Read PDF pages 146–162** with the Read tool (same path as Task 1). Extract all Fate spells per the shared instructions.
- [ ] **Step 2: Add a top-level `"fate"` key** (`"id": "fate"`, `"name": "Fate"`) with the spells array.
- [ ] **Step 3: Validate** — shared command, `ARCANUM_ID` = `fate`.
- [ ] **Step 4: Commit** — `git commit -m "feat: add spells.json — Fate Arcanum"` (after `git add src/data/spells.json`).

---

## Task 3 — Extract Forces spells (pages 162–182)

**Files:** Modify: `src/data/spells.json`

- [ ] **Step 1: Read PDF pages 162–181, then 178–182** (the chapter is longer than one 20-page read; the overlap stitches the two reads together). Extract all Forces spells.
- [ ] **Step 2: Add a top-level `"forces"` key** (`"name": "Forces"`).
- [ ] **Step 3: Validate** — shared command, `ARCANUM_ID` = `forces`.
- [ ] **Step 4: Commit** — `git commit -m "feat: add spells.json — Forces Arcanum"`.

---

## Task 4 — Extract Life spells (pages 182–194)

**Files:** Modify: `src/data/spells.json`

- [ ] **Step 1: Read PDF pages 182–194.** Extract all Life spells.
- [ ] **Step 2: Add a top-level `"life"` key** (`"name": "Life"`).
- [ ] **Step 3: Validate** — shared command, `ARCANUM_ID` = `life`.
- [ ] **Step 4: Commit** — `git commit -m "feat: add spells.json — Life Arcanum"`.

---

## Task 5 — Extract Matter spells (pages 194–210)

**Files:** Modify: `src/data/spells.json`

- [ ] **Step 1: Read PDF pages 194–210.** Extract all Matter spells.
- [ ] **Step 2: Add a top-level `"matter"` key** (`"name": "Matter"`).
- [ ] **Step 3: Validate** — shared command, `ARCANUM_ID` = `matter`.
- [ ] **Step 4: Commit** — `git commit -m "feat: add spells.json — Matter Arcanum"`.

---

## Task 6 — Extract Mind spells (pages 210–222)

**Files:** Modify: `src/data/spells.json`

- [ ] **Step 1: Read PDF pages 210–222.** Extract all Mind spells.
- [ ] **Step 2: Add a top-level `"mind"` key** (`"name": "Mind"`).
- [ ] **Step 3: Validate** — shared command, `ARCANUM_ID` = `mind`.
- [ ] **Step 4: Commit** — `git commit -m "feat: add spells.json — Mind Arcanum"`.

---

## Task 7 — Extract Prime spells (pages 222–234)

**Files:** Modify: `src/data/spells.json`

- [ ] **Step 1: Read PDF pages 222–234.** Extract all Prime spells.
- [ ] **Step 2: Add a top-level `"prime"` key** (`"name": "Prime"`).
- [ ] **Step 3: Validate** — shared command, `ARCANUM_ID` = `prime`.
- [ ] **Step 4: Commit** — `git commit -m "feat: add spells.json — Prime Arcanum"`.

---

## Task 8 — Extract Space spells (pages 234–246)

**Files:** Modify: `src/data/spells.json`

- [ ] **Step 1: Read PDF pages 234–246.** Extract all Space spells.
- [ ] **Step 2: Add a top-level `"space"` key** (`"name": "Space"`).
- [ ] **Step 3: Validate** — shared command, `ARCANUM_ID` = `space`.
- [ ] **Step 4: Commit** — `git commit -m "feat: add spells.json — Space Arcanum"`.

---

## Task 9 — Extract Spirit spells (pages 246–262)

**Files:** Modify: `src/data/spells.json`

- [ ] **Step 1: Read PDF pages 246–262.** Extract all Spirit spells.
- [ ] **Step 2: Add a top-level `"spirit"` key** (`"name": "Spirit"`).
- [ ] **Step 3: Validate** — shared command, `ARCANUM_ID` = `spirit`.
- [ ] **Step 4: Commit** — `git commit -m "feat: add spells.json — Spirit Arcanum"`.

---

## Task 10 — Extract Time spells (pages 262–281), final completeness check

**Files:** Modify: `src/data/spells.json`

- [ ] **Step 1: Read PDF pages 262–281.** Extract all Time spells.
- [ ] **Step 2: Add a top-level `"time"` key** (`"name": "Time"`).
- [ ] **Step 3: Verify all 10 Arcana are present**

```bash
node -e "
const d = require('./src/data/spells.json');
const expected = ['death','fate','forces','life','matter','mind','prime','space','spirit','time'];
const missing = expected.filter(k => !d[k]);
if (missing.length) { console.error('MISSING:', missing); process.exit(1) }
const counts = expected.map(k => k + ':' + d[k].spells.length).join(' ');
console.log('OK — all 10 Arcana ·', counts);
"
```

Expected: `OK — all 10 Arcana · death:<n> fate:<n> …` with every count > 0. Also run the shared per-arcanum validation with `ARCANUM_ID` = `time`.

- [ ] **Step 4: Commit** — `git commit -m "feat: add spells.json — Time Arcanum, completing all 10 Arcana"`.

---

## Task 11 — Arcana validation util (TDD)

Pure functions enforcing the chargen Arcana rules from Mage 1e p. 73 ("2 dots in one Arcanum, 2 in a second, 1 in a third — two of the three must be Ruling — plus 1 floating dot") via the equivalent rule set from the spec, plus the Inferior-Arcanum cap and rote legality checks.

**Files:**
- Create: `src/utils/arcanaValidation.test.js`
- Create: `src/utils/arcanaValidation.js`

- [ ] **Step 1: Write the failing tests**

```js
import { describe, it, expect } from 'vitest'
import { validateArcana, buildSpellIndex, findInvalidRotes } from './arcanaValidation'

// Acanthus: ruling Fate + Time, inferior Forces
const acanthus = { rulingIds: ['fate', 'time'], inferiorId: 'forces' }

describe('validateArcana', () => {
  it('accepts a legal {3,2,1} build', () => {
    expect(validateArcana({ fate: 3, time: 2, death: 1 }, acanthus)).toEqual([])
  })

  it('accepts a legal {2,2,2} build', () => {
    expect(validateArcana({ fate: 2, time: 2, life: 2 }, acanthus)).toEqual([])
  })

  it('accepts a legal {2,2,1,1} build', () => {
    expect(validateArcana({ fate: 2, time: 2, death: 1, mind: 1 }, acanthus)).toEqual([])
  })

  it('accepts one Ruling at 1 dot when the other carries 2+', () => {
    expect(validateArcana({ fate: 3, time: 1, death: 2 }, acanthus)).toEqual([])
  })

  it('rejects fewer than 6 dots', () => {
    expect(validateArcana({ fate: 2, time: 2, death: 1 }, acanthus)).toContain('Spend exactly 6 dots (5 spent).')
  })

  it('rejects more than 6 dots', () => {
    expect(validateArcana({ fate: 3, time: 3, death: 1 }, acanthus)).toContain('Spend exactly 6 dots (7 spent).')
  })

  it('rejects 4 dots in one Arcanum', () => {
    expect(validateArcana({ fate: 4, time: 1, death: 1 }, acanthus)).toContain('No Arcanum may exceed 3 dots.')
  })

  it('rejects a {3,3} build — fewer than 3 Arcana rated', () => {
    expect(validateArcana({ fate: 3, time: 3 }, acanthus)).toContain('Rate at least 3 different Arcana.')
  })

  it('rejects a missing Ruling Arcanum', () => {
    expect(validateArcana({ fate: 3, death: 2, mind: 1 }, acanthus)).toContain('Both Ruling Arcana need at least 1 dot.')
  })

  it('rejects both Ruling Arcana at only 1 dot', () => {
    expect(validateArcana({ fate: 1, time: 1, death: 2, mind: 2 }, acanthus)).toContain('At least one Ruling Arcanum needs 2 or more dots.')
  })

  it('rejects 3 dots in the Inferior Arcanum', () => {
    expect(validateArcana({ fate: 2, time: 1, forces: 3 }, acanthus)).toContain('Your Inferior Arcanum is capped at 2 dots.')
  })

  it('ignores underscore meta-keys when summing', () => {
    expect(validateArcana({ fate: 3, time: 2, death: 1, _rotes: ['x'] }, acanthus)).toEqual([])
  })

  it('skips Ruling/Inferior checks when no path is chosen', () => {
    expect(validateArcana({ fate: 3, time: 2, death: 1 }, {})).toEqual([])
  })
})

const fakeSpells = {
  death: { id: 'death', name: 'Death', spells: [
    { id: 'spell_a', level: 1, name: 'Spell A' },
    { id: 'spell_b', level: 3, name: 'Spell B' },
  ]},
}

describe('buildSpellIndex / findInvalidRotes', () => {
  it('indexes spells by id with arcanum, level, and name', () => {
    const idx = buildSpellIndex(fakeSpells)
    expect(idx.spell_b).toEqual({ arcanum: 'death', arcanumName: 'Death', level: 3, name: 'Spell B' })
  })

  it('flags rotes whose level exceeds the arcanum dots', () => {
    const idx = buildSpellIndex(fakeSpells)
    expect(findInvalidRotes({ death: 2, _rotes: ['spell_a', 'spell_b'] }, idx)).toEqual(['spell_b'])
  })

  it('returns empty when all rotes are legal', () => {
    const idx = buildSpellIndex(fakeSpells)
    expect(findInvalidRotes({ death: 3, _rotes: ['spell_a', 'spell_b'] }, idx)).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --run src/utils/arcanaValidation.test.js 2>&1 | tail -5
```
Expected: FAIL — `Failed to resolve import "./arcanaValidation"`.

- [ ] **Step 3: Write the implementation**

```js
import SPELLS from '../data/spells.json'

// Equivalent to the book's "2/2/1 (two of three Ruling) + 1 floating dot" procedure;
// the decomposition proof is in the design spec.
export function validateArcana(powers, { rulingIds = [], inferiorId = null } = {}) {
  const entries = Object.entries(powers).filter(([k]) => !k.startsWith('_'))
  const spent = entries.reduce((s, [, v]) => s + (v || 0), 0)
  const rated = entries.filter(([, v]) => v > 0)
  const errors = []
  if (spent !== 6) errors.push(`Spend exactly 6 dots (${spent} spent).`)
  if (entries.some(([, v]) => v > 3)) errors.push('No Arcanum may exceed 3 dots.')
  if (inferiorId && (powers[inferiorId] || 0) > 2) errors.push('Your Inferior Arcanum is capped at 2 dots.')
  if (rated.length < 3) errors.push('Rate at least 3 different Arcana.')
  if (rulingIds.length > 0) {
    const rulingDots = rulingIds.map(id => powers[id] || 0)
    if (rulingDots.some(v => v < 1)) errors.push('Both Ruling Arcana need at least 1 dot.')
    if (!rulingDots.some(v => v >= 2)) errors.push('At least one Ruling Arcanum needs 2 or more dots.')
  }
  return errors
}

export function buildSpellIndex(spellsData) {
  const index = {}
  for (const arcanum of Object.values(spellsData)) {
    for (const spell of arcanum.spells) {
      index[spell.id] = { arcanum: arcanum.id, arcanumName: arcanum.name, level: spell.level, name: spell.name }
    }
  }
  return index
}

export const SPELL_INDEX = buildSpellIndex(SPELLS)

export function findInvalidRotes(powers, spellIndex = SPELL_INDEX) {
  return (powers._rotes || []).filter(id => {
    const spell = spellIndex[id]
    return !spell || spell.level > (powers[spell.arcanum] || 0)
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --run src/utils/arcanaValidation.test.js 2>&1 | tail -5
```
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/arcanaValidation.js src/utils/arcanaValidation.test.js
git commit -m "feat: add arcanaValidation util enforcing Mage chargen Arcana rules"
```

---

## Task 12 — Update `mage.json`

Powers type becomes `arcana` with the real rules; path options gain `inferiorArcanum`; the `rotes` budget is added; starting Mana is corrected to 7 (= starting Wisdom, per the book's Mage Template Quick Reference). This will break the existing `pool type with caps (Mage)` tests — expected; they're replaced in Task 13.

**Files:**
- Modify: `src/data/lines/mage.json`

- [ ] **Step 1: Replace the file contents**

```json
{
  "id": "mage", "name": "Mage: the Awakening", "shortName": "Mage", "color": "#7070c8",
  "template": {
    "group1": {
      "label": "Path", "field": "path",
      "options": [
        { "id": "acanthus", "name": "Acanthus", "description": "Enchanters of the Lunargent Thorn.",    "hint": "Ruling Arcana: Fate, Time. Inferior: Forces", "inferiorArcanum": "forces" },
        { "id": "mastigos", "name": "Mastigos", "description": "Warlocks of the Iron Gauntlet.",        "hint": "Ruling Arcana: Mind, Space. Inferior: Matter", "inferiorArcanum": "matter" },
        { "id": "moros",    "name": "Moros",    "description": "Necromancers of the Lead Coin.",        "hint": "Ruling Arcana: Death, Matter. Inferior: Spirit", "inferiorArcanum": "spirit" },
        { "id": "obrimos",  "name": "Obrimos",  "description": "Theurgists of the Golden Key.",         "hint": "Ruling Arcana: Forces, Prime. Inferior: Death", "inferiorArcanum": "death" },
        { "id": "thyrsus",  "name": "Thyrsus",  "description": "Shamans of the Stone Book.",            "hint": "Ruling Arcana: Life, Spirit. Inferior: Mind", "inferiorArcanum": "mind" }
      ]
    },
    "group2": {
      "label": "Order", "field": "order",
      "options": [
        { "id": "arrow",     "name": "Adamantine Arrow",      "description": "Warrior-mages who defend the Awakened." },
        { "id": "free",      "name": "Free Council",          "description": "Democrats who embrace mortal innovation." },
        { "id": "guardians", "name": "Guardians of the Veil", "description": "Secretive keepers who protect the Mysteries." },
        { "id": "mysterium", "name": "Mysterium",             "description": "Scholars who seek to recover lost occult knowledge." },
        { "id": "silver",    "name": "Silver Ladder",         "description": "The hierarchy — born to rule the Awakened." },
        { "id": "seers",     "name": "Seers of the Throne",   "description": "Servants of the Exarchs who maintain the Lie." },
        { "id": "apostate",  "name": "Apostate",              "description": "Unaffiliated — no Order, no resources, no obligations." }
      ]
    }
  },
  "powers": {
    "type": "arcana",
    "label": "Arcana",
    "description": "Distribute 6 dots: 2/2/1 across three Arcana — two of them your Path's Ruling Arcana — plus 1 dot anywhere. Max 3 dots per Arcanum; your Inferior Arcanum caps at 2.",
    "totalDots": 6,
    "maxPerArcanum": 3,
    "rulingFrom": "group1",
    "items": [
      { "id": "death",  "name": "Death",  "description": "Endings, ghosts, and entropy.",           "affinityFor": ["moros"] },
      { "id": "fate",   "name": "Fate",   "description": "Destiny, luck, and oaths.",               "affinityFor": ["acanthus"] },
      { "id": "forces", "name": "Forces", "description": "Fire, electricity, and physical force.",  "affinityFor": ["obrimos"] },
      { "id": "life",   "name": "Life",   "description": "Living things — healing and transformation.", "affinityFor": ["thyrsus"] },
      { "id": "matter", "name": "Matter", "description": "Physical objects and substances.",         "affinityFor": ["mastigos", "moros"] },
      { "id": "mind",   "name": "Mind",   "description": "Thoughts, emotions, and consciousness.",  "affinityFor": ["mastigos"] },
      { "id": "prime",  "name": "Prime",  "description": "Raw magical power and Mana.",             "affinityFor": ["obrimos"] },
      { "id": "space",  "name": "Space",  "description": "Connections, wards, and sympathy.",       "affinityFor": ["mastigos"] },
      { "id": "spirit", "name": "Spirit", "description": "The spirit world and ephemeral beings.",  "affinityFor": ["thyrsus"] },
      { "id": "time",   "name": "Time",   "description": "Past, present, and future.",              "affinityFor": ["acanthus"] }
    ]
  },
  "rotes": { "budget": 6 },
  "resource": {
    "pool":  { "name": "Mana",  "startValue": 7 },
    "trait": { "name": "Gnosis","startValue": 1  }
  },
  "integrity": { "name": "Wisdom", "startValue": 7 }
}
```

- [ ] **Step 2: Run tests — expect the Mage pool tests to fail**

```bash
npm test -- --run 2>&1 | tail -10
```
Expected: the two tests in `pool type with caps (Mage)` fail (StepPowers has no `arcana` branch yet). Everything else passes.

- [ ] **Step 3: Commit**

```bash
git add src/data/lines/mage.json
git commit -m "feat: update mage.json — arcana type, real chargen rules, Mana 7"
```

---

## Task 13 — Replace Mage StepPowers tests with arcana-type tests (failing)

**Files:**
- Modify: `src/components/wizard/StepPowers.test.jsx`

- [ ] **Step 1: Add the SPELLS import** below the existing line imports at the top of the file:

```jsx
import SPELLS from '../../data/spells.json'
```

- [ ] **Step 2: Replace the entire `describe('StepPowers — pool type with caps (Mage)', ...)` block** with:

```jsx
describe('StepPowers — arcana type (Mage)', () => {
  // Pull real spells from the data so tests don't depend on extraction wording
  const death1 = SPELLS.death.spells.find(s => s.level === 1)
  const death3 = SPELLS.death.spells.find(s => s.level === 3)
  const death2s = SPELLS.death.spells.filter(s => s.level === 2).slice(0, 3)
  const validBuild = { death: 3, matter: 2, fate: 1 } // Moros: ruling Death + Matter

  it('renders all arcana names', () => {
    render(<StepPowers lineData={mage} template={{}} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('Death')).toBeInTheDocument()
    expect(screen.getByText('Forces')).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
  })

  it('shows Ruling badge for path arcana', () => {
    render(<StepPowers lineData={mage} template={{ path: 'acanthus' }} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getAllByText('Ruling').length).toBe(2)
  })

  it('shows 6 dots remaining initially', () => {
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('6 dots remaining')).toBeInTheDocument()
  })

  it('shows a validation error while the allocation is incomplete', () => {
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={{ death: 2 }} onSetPowers={() => {}} />)
    expect(screen.getByText('Spend exactly 6 dots (2 spent).')).toBeInTheDocument()
  })

  it('shows no validation errors for a legal build', () => {
    // match exact error strings — looser regexes would hit the rules description text
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.queryByText(/Spend exactly 6 dots/)).toBeNull()
    expect(screen.queryByText('Both Ruling Arcana need at least 1 dot.')).toBeNull()
    expect(screen.queryByText('Rate at least 3 different Arcana.')).toBeNull()
    expect(screen.queryByText('Your Inferior Arcanum is capped at 2 dots.')).toBeNull()
  })

  it('shows rote tabs only for rated arcana', () => {
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.getByRole('button', { name: 'Matter' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Time' })).toBeNull()
  })

  it('selects a legal rote on click', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={validBuild} onSetPowers={onSetPowers} />)
    fireEvent.click(screen.getByText(death1.name))
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ _rotes: [death1.id] }))
  })

  it('deselects a selected rote on click', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={{ ...validBuild, _rotes: [death1.id] }} onSetPowers={onSetPowers} />)
    fireEvent.click(screen.getByText(death1.name))
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ _rotes: [] }))
  })

  it('does not select a rote above the arcanum rating', () => {
    const onSetPowers = vi.fn()
    // death is 2 here, death3 requires 3
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={{ death: 2, matter: 2, fate: 2 }} onSetPowers={onSetPowers} />)
    fireEvent.click(screen.getByText(death3.name))
    expect(onSetPowers).not.toHaveBeenCalled()
  })

  it('does not select a rote that would exceed the 6-dot budget', () => {
    const onSetPowers = vi.fn()
    // three level-2 death rotes = 6 dots spent
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={{ ...validBuild, _rotes: death2s.map(s => s.id) }} onSetPowers={onSetPowers} />)
    fireEvent.click(screen.getByText(death1.name))
    expect(onSetPowers).not.toHaveBeenCalled()
  })

  it('flags rotes that exceed lowered arcana for removal', () => {
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={{ death: 1, matter: 2, fate: 3, _rotes: [death3.id] }} onSetPowers={() => {}} />)
    expect(screen.getByText(/exceed your current Arcana/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tests — new tests fail, others pass**

```bash
npm test -- --run 2>&1 | tail -10
```
Expected: `arcana type (Mage)` tests fail (no arcana branch yet). All other suites pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/wizard/StepPowers.test.jsx
git commit -m "test: replace mage pool tests with arcana type tests"
```

---

## Task 14 — Implement `ArcanaPowers` and wire StepPowers + App gating

**Files:**
- Modify: `src/components/wizard/StepPowers.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Add imports at the top of StepPowers.jsx** (after the `GIFTS` import):

```jsx
import SPELLS from '../../data/spells.json'
import { validateArcana, findInvalidRotes, SPELL_INDEX } from '../../utils/arcanaValidation'
```

- [ ] **Step 2: Add the RoteSection and ArcanaPowers components** (after `GiftsPowers`, before `RenownSection`):

```jsx
function RoteSection({ arcanaDots, budget, selected, invalid, onToggle }) {
  const ratedArcana = Object.keys(arcanaDots).filter(id => arcanaDots[id] > 0 && SPELLS[id])
  const [activeTab, setActiveTab] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const active = ratedArcana.includes(activeTab) ? activeTab : ratedArcana[0] ?? null
  const listData = active ? SPELLS[active] : null
  const spent = selected.reduce((s, id) => s + (SPELL_INDEX[id]?.level || 0), 0)

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
        Rotes
        <span className={`text-xs px-2 py-0.5 rounded ${
          spent === budget ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
        }`}>
          {spent} of {budget} dots
        </span>
      </h3>
      <p className="text-gray-400 text-sm mb-3">
        Spend {budget} dots on rotes. A rote costs its spell's level and needs that many dots in its Arcanum.
      </p>

      {invalid.length > 0 && (
        <div className="mb-3 p-2 rounded border border-red-700 bg-red-950/40">
          <p className="text-xs text-red-300 mb-1">These rotes exceed your current Arcana — click to remove:</p>
          <div className="flex gap-1 flex-wrap">
            {invalid.map(id => (
              <button key={id} onClick={() => onToggle(id)} className="px-2 py-0.5 text-xs rounded bg-red-900 text-red-200 hover:bg-red-800">
                {SPELL_INDEX[id]?.name ?? id} ✕
              </button>
            ))}
          </div>
        </div>
      )}

      {ratedArcana.length === 0 && (
        <p className="text-gray-600 text-sm">Allocate Arcana dots above to unlock rote choices.</p>
      )}

      <div className="flex gap-1 flex-wrap mb-3">
        {ratedArcana.map(id => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-3 py-1 text-xs rounded ${
              active === id ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {SPELLS[id].name}
          </button>
        ))}
      </div>

      {listData && (
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {[...listData.spells].sort((a, b) => a.level - b.level).map(spell => {
            const isSelected = selected.includes(spell.id)
            const isLocked = spell.level > arcanaDots[active]
            const overBudget = !isSelected && spent + spell.level > budget
            const isDisabled = isLocked || overBudget
            const isExpanded = expanded === spell.id

            return (
              <div
                key={spell.id}
                className={`p-2 rounded border transition-colors ${
                  isSelected
                    ? 'border-amber-400 bg-gray-800'
                    : isDisabled
                    ? 'border-gray-800 opacity-40'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div
                  className={`flex items-center justify-between gap-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => !isDisabled && onToggle(spell.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs shrink-0 tracking-widest ${isDisabled ? 'text-gray-700' : 'text-amber-500'}`}>
                      {'●'.repeat(spell.level)}
                    </span>
                    <span className={`text-sm font-medium ${isSelected ? 'text-gray-100' : isDisabled ? 'text-gray-600' : 'text-gray-300'}`}>
                      {spell.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && <span className="text-amber-400 text-xs">✓</span>}
                    {isLocked
                      ? <span className="text-xs text-gray-700">{'●'.repeat(spell.level)} req.</span>
                      : <span className="text-xs text-gray-600">{spell.aspect} · {spell.cost}</span>
                    }
                    <button
                      onClick={e => { e.stopPropagation(); setExpanded(isExpanded ? null : spell.id) }}
                      className="text-xs text-gray-600 select-none px-1"
                    >
                      {isExpanded ? '▾' : '▸'}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-1 ml-1 border-l-2 border-gray-700 pl-3 text-xs space-y-0.5">
                    <p className={isSelected ? 'text-gray-400' : 'text-gray-500'}>{spell.description}</p>
                    <p className="text-gray-600">{spell.practice} · {spell.action} · {spell.aspect} · Cost: {spell.cost}</p>
                    {spell.dice !== '—' && <p className="text-gray-600">Rote pool: {spell.dice}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ArcanaPowers({ lineData, template, powers, onSetPowers }) {
  const { items, totalDots, maxPerArcanum, rulingFrom, description } = lineData.powers
  const pathGroup = rulingFrom ? lineData.template[rulingFrom] : null
  const pathId = pathGroup ? template[pathGroup.field] : null
  const pathOption = pathId ? pathGroup.options.find(o => o.id === pathId) : null
  const rulingIds = pathId ? items.filter(i => i.affinityFor?.includes(pathId)).map(i => i.id) : []
  const inferiorId = pathOption?.inferiorArcanum ?? null

  const arcanaDots = Object.fromEntries(items.map(i => [i.id, powers[i.id] || 0]))
  const spent = Object.values(arcanaDots).reduce((s, v) => s + v, 0)
  const remaining = totalDots - spent
  const errors = validateArcana(powers, { rulingIds, inferiorId })
  const selectedRotes = powers._rotes || []
  const invalidRotes = findInvalidRotes(powers)

  const handleChange = (id, v) => onSetPowers({ ...powers, [id]: v })

  const toggleRote = spellId => {
    const next = selectedRotes.includes(spellId)
      ? selectedRotes.filter(id => id !== spellId)
      : [...selectedRotes, spellId]
    onSetPowers({ ...powers, _rotes: next })
  }

  return (
    <div>
      <p className="text-gray-400 mb-2">{description}</p>
      <p className={`text-sm mb-2 font-medium ${remaining < 0 ? 'text-red-400' : 'text-amber-400'}`}>
        {remaining} dots remaining
      </p>
      {errors.length > 0 && (
        <ul className="text-xs text-red-400 mb-3 space-y-0.5">
          {errors.map(e => <li key={e}>{e}</li>)}
        </ul>
      )}
      <div className="space-y-1 max-w-sm">
        {items.map(item => {
          const isRuling = rulingIds.includes(item.id)
          const isInferior = item.id === inferiorId
          const itemMax = isInferior ? 2 : maxPerArcanum
          return (
            <div key={item.id} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300 w-28">{item.name}</span>
                {isRuling && <span className="text-xs text-amber-500 bg-amber-900/30 px-1 rounded">Ruling</span>}
                {isInferior && <span className="text-xs text-gray-500 bg-gray-800 px-1 rounded">Inferior</span>}
              </div>
              <DotRating value={arcanaDots[item.id]} max={itemMax} onChange={v => handleChange(item.id, v)} />
            </div>
          )
        })}
      </div>
      <RoteSection
        arcanaDots={arcanaDots}
        budget={lineData.rotes?.budget ?? 6}
        selected={selectedRotes}
        invalid={invalidRotes}
        onToggle={toggleRote}
      />
    </div>
  )
}
```

- [ ] **Step 3: Add the `arcana` branch to the StepPowers render.** Replace:

```jsx
        : type === 'gifts'
          ? <GiftsPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} renown={renown} />
          : type === 'pool'
```
with:
```jsx
        : type === 'gifts'
          ? <GiftsPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} renown={renown} />
          : type === 'arcana'
            ? <ArcanaPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} />
            : type === 'pool'
```
(keep the existing `pool` and final `picks` lines, indenting them one level deeper to match.)

- [ ] **Step 4: Gate the Powers step in App.jsx.** Add the import after the existing imports:

```jsx
import { validateArcana, findInvalidRotes } from './utils/arcanaValidation'
```

Inside `canAdvance`, before `return true`, add:

```jsx
    if (step === 5 && lineData?.powers?.type === 'arcana') {
      const pathGroup = lineData.template[lineData.powers.rulingFrom]
      const pathId = character.template[pathGroup.field]
      const pathOption = pathGroup.options.find(o => o.id === pathId)
      const rulingIds = lineData.powers.items
        .filter(i => i.affinityFor?.includes(pathId))
        .map(i => i.id)
      return validateArcana(character.powers, {
        rulingIds,
        inferiorId: pathOption?.inferiorArcanum ?? null,
      }).length === 0 && findInvalidRotes(character.powers).length === 0
    }
```

- [ ] **Step 5: Run all tests**

```bash
npm test -- --run 2>&1 | tail -10
```
Expected: all test files pass, including the new `arcana type (Mage)` suite.

- [ ] **Step 6: Commit**

```bash
git add src/components/wizard/StepPowers.jsx src/App.jsx
git commit -m "feat: add ArcanaPowers with rote picker and Powers step gating for Mage"
```

---

## Task 15 — Rotes on StepReview and CharacterSheet (TDD)

Both components currently filter only `_keys` from the powers entries; `_rotes` would render as a raw entry. Switch to filtering all underscore keys and add a rotes display line.

**Files:**
- Modify: `src/components/wizard/StepReview.test.jsx`
- Modify: `src/components/wizard/StepReview.jsx`
- Modify: `src/components/sheet/CharacterSheet.test.jsx`
- Modify: `src/components/sheet/CharacterSheet.jsx`

- [ ] **Step 1: Add failing tests.** In `StepReview.test.jsx`, add these imports at the top of the file (alongside the existing ones):

```jsx
import SPELLS from '../../data/spells.json'
import mage from '../../data/lines/mage.json'
```

Then add inside the existing `describe('StepReview', ...)` block (reuse the file's existing `character` fixture via spread):

```jsx
  it('lists chosen rotes by name instead of raw state', () => {
    const death1 = SPELLS.death.spells.find(s => s.level === 1)
    const mageCharacter = {
      ...character,
      powers: { death: 3, matter: 2, fate: 1, _rotes: [death1.id] },
    }
    render(<StepReview character={mageCharacter} lineData={mage} onUpdateNotes={() => {}} />)
    expect(screen.getByText(new RegExp(death1.name))).toBeInTheDocument()
    expect(screen.queryByText(/_rotes/)).toBeNull()
  })
```

In `CharacterSheet.test.jsx`, add the same two imports at the top, then add inside the existing describe block:

```jsx
  it('lists chosen rotes by name instead of raw state', () => {
    const death1 = SPELLS.death.spells.find(s => s.level === 1)
    const mageCharacter = {
      ...character,
      powers: { death: 3, matter: 2, fate: 1, _rotes: [death1.id] },
    }
    render(<CharacterSheet character={mageCharacter} lineData={mage} />)
    expect(screen.getByText(new RegExp(death1.name))).toBeInTheDocument()
    expect(screen.queryByText(/_rotes/)).toBeNull()
  })
```

- [ ] **Step 2: Run tests to verify the two new tests fail**

```bash
npm test -- --run src/components/wizard/StepReview.test.jsx src/components/sheet/CharacterSheet.test.jsx 2>&1 | tail -8
```
Expected: the two new rote tests fail (raw `_rotes` entry rendered, named spell not found).

- [ ] **Step 3: Update StepReview.jsx.** Add the import:

```jsx
import { SPELL_INDEX } from '../../utils/arcanaValidation'
```

Change the entries filter:
```jsx
  const powerEntries = Object.entries(powers).filter(([k]) => !k.startsWith('_'))
```

After the `{selectedKeys.length > 0 && ...}` line in the Powers card, add:
```jsx
            {(powers._rotes || []).length > 0 && (
              <div className="text-gray-500">
                Rotes: {powers._rotes.map(id => {
                  const s = SPELL_INDEX[id]
                  return s ? `${s.name} (${s.arcanumName} ${'●'.repeat(s.level)})` : id
                }).join(', ')}
              </div>
            )}
```

- [ ] **Step 4: Update CharacterSheet.jsx.** Add the same `SPELL_INDEX` import (path `../../utils/arcanaValidation`), change its `powerEntries` filter to `!k.startsWith('_')`, and after the `{selectedKeys.length > 0 && ...}` block add:

```jsx
            {(powers._rotes || []).length > 0 && (
              <div style={{ marginTop: '4px' }}>
                <strong>Rotes: </strong>{powers._rotes.map(id => {
                  const s = SPELL_INDEX[id]
                  return s ? `${s.name} (${s.arcanumName} ${'●'.repeat(s.level)})` : id
                }).join(', ')}
              </div>
            )}
```

- [ ] **Step 5: Run all tests**

```bash
npm test -- --run 2>&1 | tail -10
```
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/wizard/StepReview.jsx src/components/wizard/StepReview.test.jsx src/components/sheet/CharacterSheet.jsx src/components/sheet/CharacterSheet.test.jsx
git commit -m "feat: display mage rotes on review and character sheet"
```

---

## Task 16 — Mage merits (extraction + wiring, TDD)

**Files:**
- Create: `src/data/mage-merits.json`
- Modify: `src/components/wizard/StepMerits.jsx`
- Modify: `src/components/wizard/StepMerits.test.jsx`

- [ ] **Step 1: Read PDF pages 80–91**

```
Read("/home/justina/Desktop/TTRPG Workshop/New World of Darkness/Mage - The Awakening.pdf", pages: "80-91")
```

Extract these 13 merits (headings confirmed in the PDF): Artifact, Destiny, Dream, Enhanced Item, Familiar, Hallow, High Speech, Imbued Item, Library, Occultation, Sanctum, Status, Thrall.

- [ ] **Step 2: Create `src/data/mage-merits.json`** — same shape as `vampire-merits.json`, one entry per merit:

```json
[
  {
    "id": "high_speech",
    "name": "High Speech",
    "category": "mage",
    "line": "mage",
    "min_dots": 1,
    "max_dots": 1,
    "prerequisites": null,
    "chargen_only": false,
    "description": "One or two sentences from the book."
  }
]
```

Use the dot ranges from the headings (e.g. Artifact `min_dots: 3, max_dots: 5`; Thrall `min_dots: 3, max_dots: 3`; Familiar `min_dots: 3, max_dots: 4`). Record prerequisites as a string when the book lists them (e.g. Familiar requires Gnosis), else `null`.

- [ ] **Step 3: Add a failing test.** In `StepMerits.test.jsx`, add inside the existing describe block (follow the existing category-tab test pattern):

```jsx
  it('shows mage merits in the catalog when lineId is mage', () => {
    render(<StepMerits merits={[]} onAdd={() => {}} onRemove={() => {}} lineId="mage" />)
    fireEvent.click(screen.getByRole('button', { name: /^mage$/i }))
    expect(screen.getByText('Hallow')).toBeInTheDocument()
    expect(screen.getByText('High Speech')).toBeInTheDocument()
  })
```

- [ ] **Step 4: Run the test to verify it fails**

```bash
npm test -- --run src/components/wizard/StepMerits.test.jsx 2>&1 | tail -5
```
Expected: the new test fails (no mage entry in `LINE_MERITS`).

- [ ] **Step 5: Wire into StepMerits.jsx.** Add the import after the werewolf merits import:

```jsx
import MAGE_MERITS from '../../data/mage-merits.json'
```

Change the `LINE_MERITS` constant to:

```jsx
const LINE_MERITS = { vampire: VAMPIRE_MERITS, werewolf: WEREWOLF_MERITS, mage: MAGE_MERITS }
```

- [ ] **Step 6: Run all tests**

```bash
npm test -- --run 2>&1 | tail -10
```
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/data/mage-merits.json src/components/wizard/StepMerits.jsx src/components/wizard/StepMerits.test.jsx
git commit -m "feat: add mage merits and wire into StepMerits"
```

---

## Task 17 — Push to GitHub

- [ ] **Step 1: Run the full suite one final time**

```bash
npm test -- --run 2>&1 | tail -5
```
Expected: all pass.

- [ ] **Step 2: Push**

```bash
git push
```

- [ ] **Step 3: Verify**

```bash
git log --oneline -18
```
Expected: all Mage commits present and pushed.

---

## Self-Review Notes

- **Spec coverage:** spells.json (Tasks 1–10), mage.json rules fixes incl. Mana 7 and inferiorArcanum (Task 12), validation rule set incl. Inferior cap (Task 11), ArcanaPowers allocator + rote picker + invalid-rote removal + step gating (Tasks 13–14), review/sheet display (Task 15), mage merits (Task 16). All spec sections have tasks.
- **Type consistency:** `validateArcana(powers, { rulingIds, inferiorId })`, `buildSpellIndex(spellsData)`, `findInvalidRotes(powers, spellIndex?)`, and `SPELL_INDEX` are defined in Task 11 and used with those exact signatures in Tasks 13–15. State keys: flat arcanum ids + `_rotes` throughout.
- **Test data coupling:** component tests pull spells dynamically from `spells.json` (`find(s => s.level === 1)` etc.) so they don't depend on extraction wording. The budget test needs ≥3 level-2 Death spells — the Mage core has well over that; if extraction somehow yields fewer, substitute another arcanum in the test.
- **Order dependency:** Task 11 imports `spells.json`, so extraction Task 1 (which creates the file) must run first; Tasks 2–10 only add keys and can technically interleave, but run them in order to keep the file stable.
- **Rote budget is not gated:** advancing requires a valid Arcana allocation and no invalid rotes; spending fewer than 6 rote dots is allowed (mirrors gifts, where picking fewer than 3 doesn't block).
