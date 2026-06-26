# WoD Character Sheet — Skills Layout Fix

**Date:** 2026-06-26
**Scope:** `CharacterSheet.jsx`, `generateCharacterPDF.js`

## Problem

Skills are currently stacked vertically in the left half of a two-column split (Skills left, Powers+Merits right). The official nWoD sheet has Skills in three equal columns spanning the full page width, matching the Attributes layout.

## Design

### Layout Structure (both files)

```
[ Header ]
[ Attributes — 3 columns: Mental | Physical | Social ]
[ Skills     — 3 columns: Mental | Physical | Social ]
[ Powers (left half) | Merits (right half) ]
[ Renown (Werewolf only) ]
[ Derived Traits ]
[ Notes ]
```

### Skills Section

- Full-width, 3 equal columns: Mental (8 skills) | Physical (8 skills) | Social (8 skills)
- Same grid math as Attributes: `CW / 3` column width in PDF, `1fr 1fr 1fr` grid in JSX
- Each column: category label centered above, then skill rows with dot leaders and dot rating
- Specialties line below all three columns, full width

### Powers + Merits Section

- 2-column split below Skills: Powers on left (`LEFT` / `HALF`), Merits on right (`MID` / `HALF`)
- Same column widths and rendering logic as current — only the vertical position changes

## Files Changed

### `src/components/sheet/CharacterSheet.jsx`

- Remove the `1fr 1fr` wrapper grid that currently contains Skills + Powers/Merits
- Add Skills as a full-width `1fr 1fr 1fr` grid block (same JSX pattern as Attributes)
- Add a separate `1fr 1fr` grid below for Powers + Merits

### `src/utils/generateCharacterPDF.js`

- Rewrite `drawSkills` to render 3 columns horizontally across full `CW` (same loop structure as `drawAttributes`)
- `drawSkills` returns the bottom Y after all three columns are drawn
- `drawPowers` and `drawMerits` are called after `drawSkills` — no changes to their internals

## Out of Scope

- No changes to skill data, dot rating logic, or any other section
- No changes to the wizard steps or character state
