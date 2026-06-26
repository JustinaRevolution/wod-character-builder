# WoD Skills Layout Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Skills from a stacked left-half layout to a full-width 3-column layout matching the official nWoD sheet, with Powers and Merits in a 2-column split below.

**Architecture:** Two independent file changes — CharacterSheet.jsx (HTML preview) and generateCharacterPDF.js (PDF output). Each is a structural refactor of the rendering code only; no data, logic, or field names change.

**Tech Stack:** React + Vite, pdf-lib, Vitest + @testing-library/react

## Global Constraints

- All existing tests must continue to pass
- Skill field names in PDF (`skill.mental.academics.N` etc.) must not change
- No changes to data files, hooks, wizard steps, or derived trait logic

---

### Task 1: Fix CharacterSheet.jsx (HTML preview)

**Files:**
- Modify: `src/components/sheet/CharacterSheet.jsx:78-174`
- Modify: `src/components/sheet/CharacterSheet.test.jsx`

**Interfaces:**
- Consumes: existing `character`, `lineData` props — no change
- Produces: same rendered output with skills in 3-column full-width grid, powers+merits in 2-column grid below

- [ ] **Step 1: Add regression tests**

Add these two tests to `src/components/sheet/CharacterSheet.test.jsx` inside the first `describe('CharacterSheet', ...)` block:

```jsx
it('renders a skill from each category', () => {
  render(<CharacterSheet character={character} lineData={vampire} />)
  expect(screen.getByText('Academics')).toBeInTheDocument()
  expect(screen.getByText('Athletics')).toBeInTheDocument()
  expect(screen.getByText('Animal Ken')).toBeInTheDocument()
})

it('renders MERITS section header', () => {
  render(<CharacterSheet character={character} lineData={vampire} />)
  expect(screen.getByText('MERITS')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to confirm they pass**

```bash
cd wod-character-builder && npx vitest run src/components/sheet/CharacterSheet.test.jsx
```

Expected: all pass (these are regression guards — they confirm behavior before the layout change).

- [ ] **Step 3: Replace the Skills + Powers/Merits section in CharacterSheet.jsx**

Replace lines 78–174 (the `{/* Skills (left) | Powers + Merits (right) */}` block and everything inside it) with:

```jsx
      {/* Skills — full width, 3 columns */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '8pt', letterSpacing: '1px', borderBottom: '1px solid #000', marginBottom: '5px' }}>SKILLS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '8pt' }}>
          {SKILL_CATS.map(({ key, skills: sk }) => (
            <div key={key}>
              <div style={{ textAlign: 'center', color: '#555', fontSize: '7pt', marginBottom: '4px' }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </div>
              {sk.map(s => (
                <div key={s} style={traitRow}>
                  <span>{label(s)}</span>
                  <span style={dotLeader} />
                  <DotRating value={skills[key][s]} max={5} />
                </div>
              ))}
            </div>
          ))}
        </div>
        {specialties.length > 0 && (
          <div style={{ marginTop: '5px', fontSize: '7.5pt' }}>
            <strong>Specialties: </strong>{specialties.map(s => `${s.skill} (${s.name})`).join(', ')}
          </div>
        )}
      </div>

      {/* Powers + Merits — 2-column split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '10px' }}>

        {/* Left: Powers */}
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '8pt', letterSpacing: '1px', borderBottom: '1px solid #000', marginBottom: '5px' }}>
            {lineData.powers.label.toUpperCase()}
          </div>
          <div style={{ fontSize: '8pt', lineHeight: '1.6' }}>
            {powerEntries.map(([id, val]) => {
              const item = lineData.powers.items?.find(i => i.id === id)
              const name = item?.name || id
              const activePowerNames = item?.powers && typeof val === 'number' && val > 0
                ? item.powers.slice(0, val).map(p => p.name).join(', ')
                : null
              return typeof val === 'number'
                ? (
                  <div key={id}>
                    <div style={traitRow}>
                      <span>{name}</span>
                      <span style={dotLeader} />
                      <DotRating value={val} max={5} />
                    </div>
                    {activePowerNames && <div style={{ fontSize: '7pt', color: '#777', marginLeft: '6px', marginBottom: '1px' }}>{activePowerNames}</div>}
                  </div>
                )
                : <div key={id} style={{ marginBottom: '2px' }}>{name}: {val}</div>
            })}
            {selectedKeys.length > 0 && (
              <div style={{ marginTop: '3px' }}><strong>Keys: </strong>{selectedKeys.join(', ')}</div>
            )}
            {(powers._rotes || []).length > 0 && (
              <div style={{ marginTop: '3px' }}>
                <strong>Rotes: </strong>{(powers._rotes || []).map(id => {
                  const s = SPELL_INDEX[id]
                  return s ? `${s.name} (${s.arcanumName} ${'●'.repeat(s.level)})` : id
                }).join(', ')}
              </div>
            )}
            {(powers._soul_affinity || powers._guild_affinity || powers._free_affinity) && (
              <div style={{ marginTop: '3px' }}>
                <strong>Affinities: </strong>{[
                  AFFINITIES.find(a => a.id === powers._soul_affinity)?.name,
                  AFFINITIES.find(a => a.id === powers._guild_affinity)?.name,
                  AFFINITIES.find(a => a.id === powers._free_affinity)?.name,
                ].filter(Boolean).join(', ')}
              </div>
            )}
            {(powers._utterances || []).length > 0 && (
              <div style={{ marginTop: '3px' }}>
                <strong>Utterances: </strong>{(powers._utterances || []).map(id => UTTERANCES.find(u => u.id === id)?.name ?? id).join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Right: Merits */}
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '8pt', letterSpacing: '1px', borderBottom: '1px solid #000', marginBottom: '5px' }}>MERITS</div>
          <div style={{ fontSize: '8pt', lineHeight: '1.6' }}>
            {merits.map((m, i) => (
              <div key={i} style={traitRow}>
                <span>{m.name}</span>
                <span style={dotLeader} />
                <DotRating value={m.dots} max={5} />
              </div>
            ))}
          </div>
        </div>
      </div>
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run src/components/sheet/CharacterSheet.test.jsx
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/sheet/CharacterSheet.jsx src/components/sheet/CharacterSheet.test.jsx
git commit -m "feat: move skills to full-width 3-column layout in HTML preview"
```

---

### Task 2: Fix generateCharacterPDF.js (PDF output)

**Files:**
- Modify: `src/utils/generateCharacterPDF.js:178-202` (drawSkills function)
- Modify: `src/utils/generateCharacterPDF.js:386-403` (main function — skills/powers/merits sequencing)
- Modify: `src/utils/generateCharacterPDF.test.js`

**Interfaces:**
- `drawSkills` signature unchanged: `(page, form, boldFont, font, skills, specialties, startY) => endY`
- `drawPowers` and `drawMerits` signatures unchanged — only their call site moves

- [ ] **Step 1: Add a regression test for skill checkboxes**

Add this test to `src/utils/generateCharacterPDF.test.js` inside the existing `describe('generateCharacterPDF', ...)` block:

```js
it('skill checkboxes are pre-checked to correct values', async () => {
  const bytes = await generateCharacterPDF(baseCharacter, vampire)
  const doc = await PDFDocument.load(bytes)
  const form = doc.getForm()
  // academics = 2 → boxes 1 and 2 checked, 3 not
  expect(form.getCheckBox('skill.mental.academics.1').isChecked()).toBe(true)
  expect(form.getCheckBox('skill.mental.academics.2').isChecked()).toBe(true)
  expect(form.getCheckBox('skill.mental.academics.3').isChecked()).toBe(false)
  // stealth = 3 → box 3 checked
  expect(form.getCheckBox('skill.physical.stealth.3').isChecked()).toBe(true)
  expect(form.getCheckBox('skill.physical.stealth.4').isChecked()).toBe(false)
})
```

- [ ] **Step 2: Run test to confirm it passes**

```bash
npx vitest run src/utils/generateCharacterPDF.test.js
```

Expected: all pass (regression guard before the layout change).

- [ ] **Step 3: Rewrite drawSkills to use 3-column layout**

Replace the entire `drawSkills` function (lines 178–202) with:

```js
function drawSkills(page, form, boldFont, font, skills, specialties, startY) {
  let y = drawSectionHeader(page, boldFont, 'SKILLS', LEFT, startY, CW)

  const SKILL_COL_W = CW / 3  // 180 — matches ATTR_COL_W

  SKILL_CATS.forEach(({ label }, i) => {
    const colX = LEFT + i * SKILL_COL_W
    const tw   = font.widthOfTextAtSize(label, 6.5)
    page.drawText(label, { x: colX + (SKILL_COL_W - tw) / 2, y, font, size: 6.5, color: GRAY })
  })
  y -= SUBCAT_H

  for (let row = 0; row < 8; row++) {
    SKILL_CATS.forEach(({ key, skills: sk }, col) => {
      const skill = sk[row]
      const colX  = LEFT + col * SKILL_COL_W
      drawTraitRow(form, page, font, `skill.${key}.${skill}`, toLabel(skill), skills[key][skill], 5, colX, y, SKILL_COL_W - 4)
    })
    y -= ROW_H
  }

  if (specialties.length > 0) {
    y -= 2
    const specText = 'Specialties: ' + specialties.map(s => `${toLabel(s.skill)} (${s.name})`).join(', ')
    page.drawText(specText, { x: LEFT, y, font, size: 6.5, color: GRAY })
    y -= ROW_H
  }

  return y - 4
}
```

- [ ] **Step 4: Update the main generateCharacterPDF function call site**

In the `generateCharacterPDF` function, replace the block that currently reads (approximately lines 386–403):

```js
  // Skills (left) and Powers+Merits (right) in parallel
  const colTop    = y
  const skillBot  = drawSkills(page, form, boldFont, font, character.skills, character.specialties, colTop)
  let   rightY    = colTop
  rightY = drawPowers(page, form, boldFont, font, character.powers, lineData, rightY)
  rightY = drawMerits(page, form, boldFont, font, character.merits, rightY)

  // Vertical divider between skills and powers/merits
  const divBot = Math.min(skillBot, rightY)
  page.drawLine({
    start: { x: MID - 6, y: colTop },
    end:   { x: MID - 6, y: divBot },
    thickness: 0.4,
    color: LGRAY,
  })

  y = divBot - 4
  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 0.5, color: LGRAY })
  y -= 8
```

With:

```js
  // Skills — full width
  y = drawSkills(page, form, boldFont, font, character.skills, character.specialties, y)

  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 0.5, color: LGRAY })
  y -= 8

  // Powers (left) and Merits (right) in parallel
  const colTop = y
  const powBot = drawPowers(page, form, boldFont, font, character.powers, lineData, colTop)
  const merBot = drawMerits(page, form, boldFont, font, character.merits, colTop)

  const divBot = Math.min(powBot, merBot)
  page.drawLine({
    start: { x: MID - 6, y: colTop },
    end:   { x: MID - 6, y: divBot },
    thickness: 0.4,
    color: LGRAY,
  })

  y = divBot - 4
  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 0.5, color: LGRAY })
  y -= 8
```

- [ ] **Step 5: Run all tests**

```bash
npx vitest run src/utils/generateCharacterPDF.test.js
```

Expected: all pass including the new skill checkbox test.

- [ ] **Step 6: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 7: Commit and push**

```bash
git add src/utils/generateCharacterPDF.js src/utils/generateCharacterPDF.test.js
git commit -m "feat: move skills to full-width 3-column layout in PDF output"
git push
```
