# Mage: the Awakening — Design Spec
**Date:** 2026-06-11
**Status:** Approved

---

## Overview

Complete Mage: the Awakening support in the character creator, bringing it to the same standard as Vampire and Werewolf. Four parts:

1. Fix rules errors in the existing `mage.json` (wrong dot total, wrong caps, wrong starting Mana)
2. Extract all spells from the Mage core book's ten Arcana chapters into `spells.json`
3. New `arcana` powers type: a rules-enforcing Arcana dot allocator plus a budget-based rote picker
4. Extract Mage-specific merits into `mage-merits.json` and wire into StepMerits

Paths, Orders, Gnosis, and Wisdom already exist in `mage.json` and render through the generic wizard — they stay as-is.

---

## Rules (verified against Mage: the Awakening 1e core, chargen chapter)

**Arcana allocation:** 2 dots in one Arcanum, 2 in a second, 1 in a third — two of those three must be the Path's Ruling Arcana — plus 1 floating dot anywhere. 6 dots total. At Gnosis 1 the Arcana Mastery chart caps any Arcanum at 3 dots.

**Rotes:** 6 dots' worth. A rote's cost in dots equals its spell's Arcanum level. Rotes may come from any Arcanum the character has dots in, but no rote may be rated higher than the character's dots in that Arcanum.

**Mana:** starting Mana equals Wisdom (7).

---

## Data

### `src/data/spells.json` (new)

Keyed by Arcanum id. 10 entries: `death`, `fate`, `forces`, `life`, `matter`, `mind`, `prime`, `space`, `spirit`, `time`. Same shape as `gifts.json`, with two extra fields (`practice`, `aspect`):

```json
{
  "spirit": {
    "id": "spirit",
    "name": "Spirit",
    "spells": [
      {
        "id": "second_sight",
        "level": 1,
        "name": "Second Sight",
        "practice": "Unveiling",
        "cost": "None",
        "aspect": "Covert",
        "action": "Instant",
        "dice": "Wits + Occult + Spirit",
        "description": "One or two sentences from the book."
      }
    ]
  }
}
```

- `dice` holds the spell's suggested rote pool as printed in the book.
- Spells listed in the book with conjunctional/optional secondary Arcana are filed under their primary Arcanum at their primary level.
- Extraction follows the `wod-pdf-extract` workflow, batched one Arcanum per pass with a commit per batch (same rhythm as the 22 gift lists).

### `src/data/mage-merits.json` (new)

Same shape as `vampire-merits.json` / `werewolf-merits.json`. Contents taken from the Mage core book's merits section (Sanctum, Hallow, High Speech, Occultation, Status, Artifact, Enhanced Item, Imbued Item, Library, etc. — exact list determined during extraction). Wired into `StepMerits` by line id, exactly like the existing two files.

### `src/data/lines/mage.json` changes

**Powers section** — replace `type: "pool"` with:

```json
{
  "type": "arcana",
  "label": "Arcana",
  "description": "Distribute 6 dots: 2/2/1 across three Arcana (two of them your Path's Ruling Arcana) plus 1 dot anywhere. Max 3 dots per Arcanum.",
  "totalDots": 6,
  "maxPerArcanum": 3,
  "rulingFrom": "group1",
  "items": [ /* unchanged 10 Arcana with affinityFor */ ]
}
```

`affinityFor` on items is kept and reinterpreted as the Ruling-Arcana mapping (it already encodes exactly that).

**New `rotes` section:**

```json
{ "budget": 6 }
```

**Path options** in `template.group1` each gain `"inferiorArcanum"` (`acanthus: "forces"`, `mastigos: "matter"`, `moros: "spirit"`, `obrimos: "death"`, `thyrsus: "mind"`), used to enforce the Inferior Arcanum cap.

**Resource fix** — `resource.pool.startValue` for Mana changes from 10 to 7 (= starting Wisdom).

---

## Arcana Validation Rule

The book's structural rule ("2/2/1, two of the three Ruling, +1 floating") is enforced via this equivalent rule set:

- exactly 6 dots spent
- max 3 dots in any Arcanum
- the Path's Inferior Arcanum capped at 2 dots (self-taught limit, "The Laws of Higher Realities")
- at least 3 distinct Arcana rated
- both of the Path's Ruling Arcana have ≥ 1 dot
- at least one Ruling Arcanum has ≥ 2 dots

Equivalence verified both directions during design: every distribution buildable under the book's procedure passes these checks, and every distribution passing these checks decomposes into a legal 2/2/1+1 build.

Violations show inline messages naming the broken rule (same style as Werewolf's Renown cap messaging). The wizard step is incomplete until the allocation is valid.

---

## State

The `powers` state object stores arcana dots flat (like pool lines) with rotes under an underscore meta-key, following the existing `_keys` convention:

```js
{
  spirit: 2, life: 2, space: 2,               // arcanum id → dots
  _rotes: ["second_sight", "spirit_tongue"]   // spell ids, snake_case
}
```

This keeps the generic powers rendering in `StepReview` and `CharacterSheet` working for arcana dots; both components change their meta-key filter from `k !== '_keys'` to `!k.startsWith('_')` and add a rotes display line. The existing `onSetPowers` callback is unchanged — no parent wizard changes needed.

---

## Components

### `ArcanaPowers` (new, inside `StepPowers.jsx`)

Rendered when `lineData.powers.type === "arcana"`. Two stacked sections:

**Arcana allocator (top):**
- Dot rows for all 10 Arcana, Ruling Arcana badged (from the selected Path via `rulingFrom`)
- Live counter "N of 6 dots spent"
- Inline validation messages per the rule set above

**Rote picker (bottom), mirroring `GiftsPowers`:**
- Tab strip showing only Arcana with at least 1 dot
- Spells grouped by level (●, ●●, ●●●…) with expandable detail panels (practice, cost, aspect, action, dice, description)
- A spell is selectable only if its level ≤ the character's dots in that Arcanum; higher spells greyed and unclickable
- Budget tracker "N of 6 rote dots spent"; a rote costs its level in dots; selection that would exceed the budget does nothing
- Lowering an Arcanum below a chosen rote's level flags that rote invalid for removal (same behaviour as gifts when Renown changed)

**Props from StepPowers:** `lineData`, `template` (selected path + order ids), `powers`, `onSetPowers`.

### `StepPowers.jsx` changes

Add an `arcana` branch to the existing type dispatch:

```jsx
type === 'gifts'  ? <GiftsPowers ... />
: type === 'arcana' ? <ArcanaPowers ... />
: type === 'pool'   ? <PoolPowers ... />
: <PicksPowers ... />
```

### `CharacterSheet` / `StepReview` changes

Show Arcana dots and chosen rotes (with level + Arcanum), following the gifts display pattern.

---

## Testing

Same pattern as existing steps:

- Unit tests for the Arcana validation rule, including equivalence edge cases: `{3,2,1}` legal, `{2,2,2}` legal, `{2,2,1,1}` legal, `{3,3}` illegal (only 2 Arcana), both-Ruling-at-1 illegal (no Ruling ≥ 2), missing-Ruling illegal, 7 dots illegal, 4-in-one illegal
- Component tests for `ArcanaPowers`: rote gating by Arcanum dots, budget enforcement, tab strip showing only rated Arcana, the lower-an-Arcanum invalid-rote flow
- Updated `StepPowers`, `StepReview`, and `CharacterSheet` tests for the new type

---

## Out of Scope

- Legacies (Gnosis 3+ requirement; not a chargen concern)
- Improvised casting rules / spell factors (play aid, not chargen)
- Spells from supplement books
- Buying Gnosis up with merit dots affecting Arcana caps (cap stays 3; the Gnosis 2 chart row only loosens caps, never tightens, so no legal build is blocked)
