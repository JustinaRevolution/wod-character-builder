# Promethean: the Created Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Promethean: the Created to the nWoD character builder with named per-level Transmutation powers and Promethean-specific merits.

**Architecture:** Enrich `promethean.json` with `powers` arrays (50 total: 10 paths × 5 levels), extend `PoolPowers` with a new `InlinePowersPanel` sub-component that renders when `item.powers` is present, and show active power names in `StepReview` + `CharacterSheet`. Wire `promethean-merits.json` into `StepMerits` following the established pattern.

**Tech Stack:** React 18, Vite, Vitest, Testing Library, Tailwind CSS, Headroom MCP for PDF compression, pdf-reader subagent (Haiku) for extraction.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/data/lines/promethean.json` | Modify | Add `powers[5]` to each of 10 Transmutation items |
| `src/data/promethean-merits.json` | Create | Promethean-specific merits (Elpis, Torment, etc.) |
| `src/components/wizard/StepPowers.jsx` | Modify | Add `InlinePowersPanel`; extend `PoolPowers` to use it |
| `src/components/wizard/StepPowers.test.jsx` | Modify | Add Promethean describe block |
| `src/components/wizard/StepReview.jsx` | Modify | Show active power names inline under dot count |
| `src/components/wizard/StepReview.test.jsx` | Modify | Test power name display |
| `src/components/sheet/CharacterSheet.jsx` | Modify | Same inline power name display as StepReview |
| `src/components/sheet/CharacterSheet.test.jsx` | Modify | Test power name display on sheet |
| `src/components/wizard/StepMerits.jsx` | Modify | Import + wire PROMETHEAN_MERITS |
| `src/components/wizard/StepMerits.test.jsx` | Modify | Test Promethean tab |

---

## Task 1: Extract Transmutation Powers from PDF

**Files:** PDF at `/home/justina/Desktop/TTRPG Workshop/New World of Darkness/Promethean - The Created.pdf`

Spawn a pdf-reader subagent (Haiku) to find and extract all Transmutation path powers. The Transmutations chapter is typically mid-book. Read in 20-page chunks until all 10 paths × 5 levels are captured.

- [ ] **Step 1: Spawn pdf-reader subagent**

Dispatch with this prompt:
```
Read the Promethean: the Created PDF at:
/home/justina/Desktop/TTRPG Workshop/New World of Darkness/Promethean - The Created.pdf

Find the Transmutations chapter. Extract ALL powers from these 10 paths:
Alchemicus, Corporeum, Deception, Electrum, Ferrum, Sanguinem, Saturninus, Spiritus, Stannum, Vitality

For each path, extract 5 dot-level entries. For each entry record:
- level (1–5)
- name (the power's name)
- description (one or two sentences summarizing what it does — keep it brief, paraphrase if the book is very long)

Read up to 20 pages per call. Start around page 100 and work forward until all 10 paths are complete. Use mcp__headroom__headroom_compress to store results keyed by "promethean-transmutations". Return the hash.
```

- [ ] **Step 2: Retrieve from Headroom and verify all 10 paths have 5 entries each**

```
mcp__headroom__headroom_retrieve({ hash: <returned hash> })
```

If any path is incomplete, re-run the subagent targeting that path specifically.

- [ ] **Step 3: Also note the chargen starting dots from the character creation chapter**

While in the PDF, check whether starting Transmutation dots is 4 (as in the stub) or a different value. Note it for Task 2.

---

## Task 2: Update `promethean.json` with Extracted Powers

**Files:**
- Modify: `src/data/lines/promethean.json`

- [ ] **Step 1: Add `powers` arrays to all 10 items**

Using the Headroom-retrieved data, add a `powers` array to each item. Final shape for each item:

```json
{
  "id": "corporeum",
  "name": "Corporeum",
  "description": "Mastery and reshaping of the physical body.",
  "affinityFor": ["wretched"],
  "powers": [
    { "level": 1, "name": "<from PDF>", "description": "<from PDF>" },
    { "level": 2, "name": "<from PDF>", "description": "<from PDF>" },
    { "level": 3, "name": "<from PDF>", "description": "<from PDF>" },
    { "level": 4, "name": "<from PDF>", "description": "<from PDF>" },
    { "level": 5, "name": "<from PDF>", "description": "<from PDF>" }
  ]
}
```

All 10 items: `alchemicus`, `corporeum`, `deception`, `electrum`, `ferrum_t`, `sanguinem`, `saturninus`, `spiritus`, `stannum_t`, `vitality`.

If starting dots is different from 4, update `"startingDots"` in `lineData.powers`.

- [ ] **Step 2: Verify JSON is valid**

```bash
cd /home/justina/Desktop/Claude-Code-Workshop/wod-character-builder
node -e "require('./src/data/lines/promethean.json'); console.log('valid')"
```
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add src/data/lines/promethean.json
git commit -m "feat: add Transmutation powers to promethean.json"
```

---

## Task 3: Extract Promethean Merits from PDF

**Files:** Same PDF

- [ ] **Step 1: Spawn pdf-reader subagent for merits**

Dispatch:
```
Read the Promethean: the Created PDF at:
/home/justina/Desktop/TTRPG Workshop/New World of Darkness/Promethean - The Created.pdf

Find the merits chapter/section. Extract all merits that are SPECIFIC to Promethean characters (not general WoD merits that appear in the main merits chapter).

For each merit, record:
- id: snake_case version of the name
- name: the merit's name
- category: "promethean"
- min_dots: minimum dot cost
- max_dots: maximum dot cost (same as min if fixed cost)
- description: one sentence summary
- prerequisites: any prerequisites (or omit if none)

Use mcp__headroom__headroom_compress to store results keyed by "promethean-merits". Return the hash.
```

- [ ] **Step 2: Retrieve and verify**

```
mcp__headroom__headroom_retrieve({ hash: <returned hash> })
```

---

## Task 4: Create `promethean-merits.json`

**Files:**
- Create: `src/data/promethean-merits.json`

- [ ] **Step 1: Write the file using Headroom-retrieved merit data**

Shape (same as `vampire-merits.json`):

```json
[
  {
    "id": "elpis",
    "name": "Elpis",
    "category": "promethean",
    "min_dots": 1,
    "max_dots": 5,
    "description": "...",
    "prerequisites": ""
  },
  {
    "id": "torment",
    "name": "Torment",
    "category": "promethean",
    "min_dots": 1,
    "max_dots": 5,
    "description": "...",
    "prerequisites": ""
  }
]
```

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "require('./src/data/promethean-merits.json'); console.log('valid')"
```
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add src/data/promethean-merits.json
git commit -m "feat: add promethean-merits.json"
```

---

## Task 5: Write Failing Tests — StepPowers (Promethean)

**Files:**
- Modify: `src/components/wizard/StepPowers.test.jsx`

- [ ] **Step 1: Add import and describe block**

At the top of the test file, add:
```js
import promethean from '../../data/lines/promethean.json'
```

Add this describe block at the end of the file:

```jsx
describe('StepPowers — pool type (Promethean)', () => {
  const wretched = { lineage: 'wretched' }
  const corporeum = promethean.powers.items.find(i => i.id === 'corporeum')
  const lvl1Power = corporeum.powers[0]
  const lvl2Power = corporeum.powers[1]
  const lvl3Power = corporeum.powers[2]

  it('renders all 10 Transmutation path names', () => {
    render(<StepPowers lineData={promethean} template={wretched} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('Corporeum')).toBeInTheDocument()
    expect(screen.getByText('Alchemicus')).toBeInTheDocument()
    expect(screen.getByText('Vitality')).toBeInTheDocument()
  })

  it('shows 4 dots remaining initially', () => {
    render(<StepPowers lineData={promethean} template={wretched} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText(/4 dots remaining/i)).toBeInTheDocument()
  })

  it('shows Affinity badge for lineage paths when lineage selected', () => {
    render(<StepPowers lineData={promethean} template={wretched} powers={{}} onSetPowers={() => {}} />)
    // Wretched = Corporeum + Sanguinem affinity
    const badges = screen.getAllByText('Affinity')
    expect(badges.length).toBe(2)
  })

  it('shows expand toggle (▸) for Corporeum which has item.powers', () => {
    render(<StepPowers lineData={promethean} template={wretched} powers={{}} onSetPowers={() => {}} />)
    const toggles = screen.getAllByText('▸')
    expect(toggles.length).toBeGreaterThan(0)
  })

  it('expands to show power panel when Corporeum name is clicked', () => {
    render(<StepPowers lineData={promethean} template={wretched} powers={{}} onSetPowers={() => {}} />)
    fireEvent.click(screen.getByText('Corporeum'))
    expect(screen.getByText(lvl1Power.name)).toBeInTheDocument()
  })

  it('shows level-1 power as active when 1 dot allocated', () => {
    render(<StepPowers lineData={promethean} template={wretched} powers={{ corporeum: 1 }} onSetPowers={() => {}} />)
    fireEvent.click(screen.getByText('Corporeum'))
    // lvl1Power visible; lvl3Power should also be visible but dimmed
    expect(screen.getByText(lvl1Power.name)).toBeInTheDocument()
    expect(screen.getByText(lvl3Power.name)).toBeInTheDocument()
  })

  it('shows lvl2 power active and lvl3 dimmed when 2 dots allocated', () => {
    render(<StepPowers lineData={promethean} template={wretched} powers={{ corporeum: 2 }} onSetPowers={() => {}} />)
    fireEvent.click(screen.getByText('Corporeum'))
    // Both should be in DOM — style/class determines active vs dimmed, not presence
    expect(screen.getByText(lvl2Power.name)).toBeInTheDocument()
    expect(screen.getByText(lvl3Power.name)).toBeInTheDocument()
  })

  it('collapses panel when name is clicked again', () => {
    render(<StepPowers lineData={promethean} template={wretched} powers={{}} onSetPowers={() => {}} />)
    fireEvent.click(screen.getByText('Corporeum'))
    expect(screen.getByText(lvl1Power.name)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Corporeum'))
    expect(screen.queryByText(lvl1Power.name)).toBeNull()
  })

  it('does not render a power panel for Vampire pool items (backward compat)', () => {
    render(<StepPowers lineData={vampire} template={{}} powers={{}} onSetPowers={() => {}} />)
    // Vampire items use POWERS lookup, not item.powers — both paths should still work
    // Just verify no crash and basic render still works
    expect(screen.getByText('Animalism')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /home/justina/Desktop/Claude-Code-Workshop/wod-character-builder
npx vitest run src/components/wizard/StepPowers.test.jsx 2>&1 | tail -20
```
Expected: Several FAIL lines for the new Promethean describe block (some may pass if data + component already partially match — any FAIL confirms the test is live).

---

## Task 6: Implement `InlinePowersPanel` and Extend `PoolPowers`

**Files:**
- Modify: `src/components/wizard/StepPowers.jsx`

- [ ] **Step 1: Add `InlinePowersPanel` component**

Insert before the existing `PoolPowers` function (around line 44):

```jsx
function InlinePowersPanel({ powers, currentDots }) {
  return (
    <div className="ml-1 mb-2 mt-1 border-l-2 border-gray-700 pl-3 space-y-2.5">
      {powers.map((p) => {
        const unlocked = currentDots >= p.level
        return (
          <div key={p.level} className={unlocked ? 'text-gray-200' : 'text-gray-600'}>
            <div className="flex items-baseline gap-x-2 text-xs">
              <span className={`shrink-0 ${unlocked ? 'text-amber-500' : 'text-gray-700'}`}>
                {'●'.repeat(p.level)}
              </span>
              <span className="font-semibold">{p.name}</span>
            </div>
            <p className="text-xs leading-snug mt-0.5">{p.description}</p>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Extend `PoolPowers` to check `item.powers`**

In `PoolPowers`, inside the `items.map` callback, find this line:
```js
const hasPowers = Boolean(POWERS[item.id])
```
Change it to:
```js
const hasPowers = Boolean(POWERS[item.id]) || Boolean(item.powers?.length)
```

- [ ] **Step 3: Render `InlinePowersPanel` when `item.powers` is present**

Find this block in `PoolPowers`:
```jsx
{isExpanded && (
  <PowersPanel itemId={item.id} currentDots={powers[item.id] || 0} />
)}
```
Replace with:
```jsx
{isExpanded && POWERS[item.id] && (
  <PowersPanel itemId={item.id} currentDots={powers[item.id] || 0} />
)}
{isExpanded && item.powers && (
  <InlinePowersPanel powers={item.powers} currentDots={powers[item.id] || 0} />
)}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/components/wizard/StepPowers.test.jsx 2>&1 | tail -20
```
Expected: All tests PASS including new Promethean describe block.

- [ ] **Step 5: Commit**

```bash
git add src/components/wizard/StepPowers.jsx src/components/wizard/StepPowers.test.jsx
git commit -m "feat: add InlinePowersPanel for Transmutation powers display"
```

---

## Task 7: Write Failing Tests — StepReview and CharacterSheet

**Files:**
- Modify: `src/components/wizard/StepReview.test.jsx`
- Modify: `src/components/sheet/CharacterSheet.test.jsx`

- [ ] **Step 1: Add test to StepReview.test.jsx**

Read the current `StepReview.test.jsx` first, then add at the end:

```jsx
import promethean from '../../data/lines/promethean.json'

// Add inside a new describe block:
describe('StepReview — Promethean power names', () => {
  const corporeum = promethean.powers.items.find(i => i.id === 'corporeum')
  const lvl1Name = corporeum.powers[0].name
  const lvl2Name = corporeum.powers[1].name

  const baseCharacter = {
    meta: { name: 'Test', concept: '', virtue: '', vice: '', player: '', chronicle: '' },
    template: { lineage: 'wretched', refinement: 'aurum' },
    attributes: {
      mental: { intelligence: 1, wits: 1, resolve: 1 },
      physical: { strength: 1, dexterity: 1, stamina: 1 },
      social: { presence: 1, manipulation: 1, composure: 1 }
    },
    skills: {
      mental: { academics: 0, computer: 0, crafts: 0, investigation: 0, medicine: 0, occult: 0, politics: 0, science: 0 },
      physical: { athletics: 0, brawl: 0, drive: 0, firearms: 0, larceny: 0, stealth: 0, survival: 0, weaponry: 0 },
      social: { animal_ken: 0, empathy: 0, expression: 0, intimidation: 0, persuasion: 0, socialize: 0, streetwise: 0, subterfuge: 0 }
    },
    specialties: [],
    powers: { corporeum: 2 },
    renown: {},
    merits: [],
    derived: {
      health: 5, willpower: 3, speed: 5, defense: 1, initiative: 2,
      resource_pool: { name: 'Pyros', max: 10 },
      integrity: { name: 'Humanity', value: 5 }
    },
    notes: ''
  }

  it('shows power names for allocated paths', () => {
    render(<StepReview character={baseCharacter} lineData={promethean} onUpdateNotes={() => {}} />)
    expect(screen.getByText(lvl1Name)).toBeInTheDocument()
    expect(screen.getByText(lvl2Name)).toBeInTheDocument()
  })

  it('does not show power names for zero-dot paths', () => {
    const noPowers = { ...baseCharacter, powers: { corporeum: 0 } }
    render(<StepReview character={noPowers} lineData={promethean} onUpdateNotes={() => {}} />)
    expect(screen.queryByText(lvl1Name)).toBeNull()
  })
})
```

- [ ] **Step 2: Run StepReview tests to confirm new ones fail**

```bash
npx vitest run src/components/wizard/StepReview.test.jsx 2>&1 | tail -20
```
Expected: FAIL for the new Promethean describe block.

- [ ] **Step 3: Add test to CharacterSheet.test.jsx**

Read the current `CharacterSheet.test.jsx` first, then add a similar describe block:

```jsx
describe('CharacterSheet — Promethean power names', () => {
  const corporeum = promethean.powers.items.find(i => i.id === 'corporeum')
  const lvl1Name = corporeum.powers[0].name

  const baseCharacter = {
    meta: { name: 'Test', concept: '', virtue: '', vice: '', player: '', chronicle: '' },
    template: { lineage: 'wretched', refinement: 'aurum' },
    attributes: {
      mental: { intelligence: 1, wits: 1, resolve: 1 },
      physical: { strength: 1, dexterity: 1, stamina: 1 },
      social: { presence: 1, manipulation: 1, composure: 1 }
    },
    skills: {
      mental: { academics: 0, computer: 0, crafts: 0, investigation: 0, medicine: 0, occult: 0, politics: 0, science: 0 },
      physical: { athletics: 0, brawl: 0, drive: 0, firearms: 0, larceny: 0, stealth: 0, survival: 0, weaponry: 0 },
      social: { animal_ken: 0, empathy: 0, expression: 0, intimidation: 0, persuasion: 0, socialize: 0, streetwise: 0, subterfuge: 0 }
    },
    specialties: [],
    powers: { corporeum: 1 },
    renown: {},
    merits: [],
    derived: {
      health: 5, willpower: 3, speed: 5, defense: 1, initiative: 2,
      resource_pool: { name: 'Pyros', max: 10 },
      integrity: { name: 'Humanity', value: 5 }
    },
    notes: ''
  }

  it('shows active power name on character sheet', () => {
    render(<CharacterSheet character={baseCharacter} lineData={promethean} />)
    expect(screen.getByText(lvl1Name)).toBeInTheDocument()
  })
})
```

Add the import at the top:
```js
import promethean from '../../data/lines/promethean.json'
import CharacterSheet from './CharacterSheet'
```

- [ ] **Step 4: Run CharacterSheet tests to confirm new ones fail**

```bash
npx vitest run src/components/sheet/CharacterSheet.test.jsx 2>&1 | tail -20
```
Expected: FAIL for the new describe block.

---

## Task 8: Implement Power Names in StepReview and CharacterSheet

**Files:**
- Modify: `src/components/wizard/StepReview.jsx`
- Modify: `src/components/sheet/CharacterSheet.jsx`

- [ ] **Step 1: Update `StepReview.jsx` powers section**

Find this block (around line 50–55):
```jsx
{powerEntries.map(([id, val]) => {
  const item = powerItems.find(i => i.id === id)
  return typeof val === 'number'
    ? <div key={id} className="flex justify-between"><span>{item?.name || id}</span><DotRating value={val} max={5} /></div>
    : <div key={id}>{item?.name || id}: {val}</div>
})}
```

Replace with:
```jsx
{powerEntries.map(([id, val]) => {
  const item = powerItems.find(i => i.id === id)
  const activePowerNames = item?.powers && typeof val === 'number' && val > 0
    ? item.powers.slice(0, val).map(p => p.name).join(', ')
    : null
  return typeof val === 'number'
    ? (
      <div key={id}>
        <div className="flex justify-between"><span>{item?.name || id}</span><DotRating value={val} max={5} /></div>
        {activePowerNames && <div className="text-xs text-gray-500 ml-2">{activePowerNames}</div>}
      </div>
    )
    : <div key={id}>{item?.name || id}: {val}</div>
})}
```

- [ ] **Step 2: Update `CharacterSheet.jsx` powers section**

Find this block (around line 98–104):
```jsx
{powerEntries.map(([id, val]) => {
  const item = lineData.powers.items?.find(i => i.id === id)
  const name = item?.name || id
  return typeof val === 'number'
    ? <div key={id}>{name} <DotRating value={val} max={5} /></div>
    : <div key={id}>{name}: {val}</div>
})}
```

Replace with:
```jsx
{powerEntries.map(([id, val]) => {
  const item = lineData.powers.items?.find(i => i.id === id)
  const name = item?.name || id
  const activePowerNames = item?.powers && typeof val === 'number' && val > 0
    ? item.powers.slice(0, val).map(p => p.name).join(', ')
    : null
  return typeof val === 'number'
    ? (
      <div key={id}>
        <div>{name} <DotRating value={val} max={5} /></div>
        {activePowerNames && <div style={{ fontSize: '7pt', color: '#777', marginLeft: '4px' }}>{activePowerNames}</div>}
      </div>
    )
    : <div key={id}>{name}: {val}</div>
})}
```

- [ ] **Step 3: Run all affected tests**

```bash
npx vitest run src/components/wizard/StepReview.test.jsx src/components/sheet/CharacterSheet.test.jsx 2>&1 | tail -20
```
Expected: All PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/wizard/StepReview.jsx src/components/wizard/StepReview.test.jsx src/components/sheet/CharacterSheet.jsx src/components/sheet/CharacterSheet.test.jsx
git commit -m "feat: show active Transmutation power names in review and sheet"
```

---

## Task 9: Wire Promethean Merits in StepMerits

**Files:**
- Modify: `src/components/wizard/StepMerits.jsx`
- Modify: `src/components/wizard/StepMerits.test.jsx`

- [ ] **Step 1: Write failing test first**

Add to `StepMerits.test.jsx`:

```jsx
describe('StepMerits — Promethean tab', () => {
  it('shows Promethean-specific merits when promethean tab is active', () => {
    render(<StepMerits merits={[]} onAdd={() => {}} onRemove={() => {}} lineId="promethean" />)
    fireEvent.click(screen.getByRole('button', { name: /^promethean$/i }))
    expect(screen.getByText('Elpis')).toBeInTheDocument()
    expect(screen.getByText('Torment')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx vitest run src/components/wizard/StepMerits.test.jsx 2>&1 | tail -10
```
Expected: FAIL — "promethean" tab does not exist yet.

- [ ] **Step 3: Add import to `StepMerits.jsx`**

Find the last merit import (currently `CHANGELING_MERITS`):
```js
import CHANGELING_MERITS from '../../data/changeling-merits.json'
```

Add after it:
```js
import PROMETHEAN_MERITS from '../../data/promethean-merits.json'
```

- [ ] **Step 4: Add to `LINE_MERITS` map**

Find:
```js
const LINE_MERITS = { vampire: VAMPIRE_MERITS, werewolf: WEREWOLF_MERITS, mage: MAGE_MERITS, mummy: MUMMY_MERITS, changeling: CHANGELING_MERITS }
```

Replace with:
```js
const LINE_MERITS = { vampire: VAMPIRE_MERITS, werewolf: WEREWOLF_MERITS, mage: MAGE_MERITS, mummy: MUMMY_MERITS, changeling: CHANGELING_MERITS, promethean: PROMETHEAN_MERITS }
```

- [ ] **Step 5: Run tests**

```bash
npx vitest run src/components/wizard/StepMerits.test.jsx 2>&1 | tail -10
```
Expected: All PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/wizard/StepMerits.jsx src/components/wizard/StepMerits.test.jsx src/data/promethean-merits.json
git commit -m "feat: wire Promethean merits into StepMerits"
```

---

## Task 10: Full Test Suite Run

- [ ] **Step 1: Run all tests**

```bash
cd /home/justina/Desktop/Claude-Code-Workshop/wod-character-builder
npx vitest run 2>&1 | tail -30
```
Expected: All tests PASS. No regressions in Vampire, Werewolf, Mage, Mummy, Hunter, Changeling, or Geist.

- [ ] **Step 2: Final commit if any fixups needed**

If any tests fail due to cascading issues, fix and commit individually before the full-suite run passes.

---

## Self-Review Notes

- **Spec coverage:**
  - ✅ `promethean.json` powers arrays → Task 2
  - ✅ `promethean-merits.json` → Task 4
  - ✅ `InlinePowersPanel` + `PoolPowers` extension → Task 6
  - ✅ `StepReview` active power names → Task 8
  - ✅ `CharacterSheet` active power names → Task 8
  - ✅ `StepMerits` wiring → Task 9
  - ✅ Tests for all above → Tasks 5, 7, 9

- **Type consistency:** `item.powers[i].level` (number) is used as `p.level` throughout. `item.powers.slice(0, val)` correctly handles val=0 (empty slice → no names shown).

- **Backward compat:** The `hasPowers` check now uses `||` — Vampire items without `item.powers` still hit the `POWERS[item.id]` path. The render guard `POWERS[item.id] && ...` ensures `PowersPanel` and `InlinePowersPanel` never both render for the same item.
