# Promethean: the Created — Design Spec
**Date:** 2026-06-13
**Status:** Approved

---

## Overview

Complete Promethean: the Created support in the character creator, bringing it to the same standard as Vampire, Werewolf, Mage, Mummy, Hunter, and Changeling. Three parts:

1. Update `promethean.json` — add named powers to each Transmutation path
2. Extend `PoolPowers` component — conditional per-level power display when `item.powers` is present
3. Extract Promethean-specific merits into `promethean-merits.json`

The existing stub already has Lineage (5), Refinement (6), Transmutations as pool (10 paths), Pyros + Azoth resources, and Humanity integrity. No new component type is needed.

---

## Rules (to verify against Promethean: the Created 1e core during extraction)

**Transmutations:** Each Lineage has two affinity Transmutation paths. At chargen, distribute 4 dots among any Transmutation paths (affinity paths cost 1 dot per level as normal; non-affinity paths also cost 1 dot per level at chargen — verify against book). Each dot in a path grants the named power at that level; powers are cumulative and sequential.

**Azoth:** Starts at 1. Displayed as a trait (not a spendable pool).

**Pyros:** Starting value 10. The spendable resource pool.

**Humanity:** Starts at 5. Standard integrity track.

**Starting dots (4):** Verify against chargen chapter during extraction — adjust `startingDots` in JSON if different.

---

## Data

### `src/data/lines/promethean.json` — updated in place

Add a `powers` array to each Transmutation item. Names and descriptions filled in during PDF extraction.

```json
{
  "id": "promethean", "name": "Promethean: the Created", "shortName": "Promethean", "color": "#a0a0c8",
  "template": {
    "group1": {
      "label": "Lineage", "field": "lineage",
      "options": [
        { "id": "wretched",    "name": "Wretched (Choleric)",  "description": "Made from brutal flesh — aggressive, rageful, given to violence.",       "hint": "Transmutations: Corporeum, Sanguinem" },
        { "id": "osiran",      "name": "Osiran (Melancholic)", "description": "Made from preserved death — contemplative, patient, scholarly.",           "hint": "Transmutations: Deception, Vitality" },
        { "id": "ulgan",       "name": "Ulgan (Phlegmatic)",   "description": "Made from spirit-touched flesh — shamanic, liminal, between worlds.",     "hint": "Transmutations: Saturninus, Spiritus" },
        { "id": "galatea",     "name": "Galatea (Sanguine)",   "description": "Made from beauty — graceful, charming, tragically human.",                "hint": "Transmutations: Alchemicus, Electrum" },
        { "id": "tammuz",      "name": "Tammuz (Supernal)",    "description": "Made from clay and divine breath — solid, enduring, purposeful.",         "hint": "Transmutations: Ferrum, Stannum" }
      ]
    },
    "group2": {
      "label": "Refinement", "field": "refinement",
      "options": [
        { "id": "aurum",       "name": "Aurum",       "description": "Gold — pursuing humanity through social connection." },
        { "id": "cuprum",      "name": "Cuprum",      "description": "Copper — pursuing humanity through emotional experience." },
        { "id": "ferrum",      "name": "Ferrum",      "description": "Iron — discipline, endurance, and physical mastery." },
        { "id": "plumbum",     "name": "Plumbum",     "description": "Lead — studying Promethean nature and the Azothic memory." },
        { "id": "quicksilver", "name": "Quicksilver", "description": "Mercury — constant movement and adaptability." },
        { "id": "stannum",     "name": "Stannum",     "description": "Tin — accepting pain and imperfection as teachers." }
      ]
    }
  },
  "powers": {
    "type": "pool",
    "label": "Transmutations",
    "description": "Distribute 4 dots among Transmutations. Your Lineage Transmutations are your affinity paths.",
    "startingDots": 4,
    "affinityFrom": "group1",
    "items": [
      {
        "id": "alchemicus", "name": "Alchemicus",
        "description": "Manipulation of base elements and chemical processes.",
        "affinityFor": ["galatea"],
        "powers": [
          { "level": 1, "name": "<extracted>", "description": "<extracted>" },
          { "level": 2, "name": "<extracted>", "description": "<extracted>" },
          { "level": 3, "name": "<extracted>", "description": "<extracted>" },
          { "level": 4, "name": "<extracted>", "description": "<extracted>" },
          { "level": 5, "name": "<extracted>", "description": "<extracted>" }
        ]
      },
      {
        "id": "corporeum", "name": "Corporeum",
        "description": "Mastery and reshaping of the physical body.",
        "affinityFor": ["wretched"],
        "powers": [
          { "level": 1, "name": "<extracted>", "description": "<extracted>" },
          { "level": 2, "name": "<extracted>", "description": "<extracted>" },
          { "level": 3, "name": "<extracted>", "description": "<extracted>" },
          { "level": 4, "name": "<extracted>", "description": "<extracted>" },
          { "level": 5, "name": "<extracted>", "description": "<extracted>" }
        ]
      }
    ]
  },
  "resource": {
    "pool":  { "name": "Pyros",  "startValue": 10 },
    "trait": { "name": "Azoth", "startValue": 1  }
  },
  "integrity": { "name": "Humanity", "startValue": 5 }
}
```

*(All 10 paths follow the same shape. Shown truncated — extraction fills all 50 powers.)*

### `src/data/promethean-merits.json` (new)

Same shape as `vampire-merits.json`. Promethean-specific merits extracted from the merits chapter. Expected entries: Elpis, Torment, Azothic Resonance, and any others listed as Promethean merits in the book. Descriptions kept brief (1–2 sentences per dot level).

---

## Component: `PoolPowers` extension (inside `StepPowers.jsx`)

`PoolPowers` is the existing component rendered when `lineData.powers.type === "pool"`. No new component type is needed.

**Change:** When an item has a `powers` array, render a collapsible panel below the dot row. Default state: collapsed when dots are 0, expanded when dots > 0.

Panel contents — one row per level:
- Levels ≤ allocated dots: styled active (full opacity, bullet filled)
- Levels > allocated dots: dimmed (reduced opacity)

```
Corporeum  ● ● ○ ○ ○        [Wretched affinity]
  ▼
  ●  Unlabored Fleetness — brief description
  ●  Chameleon Skin — brief description
  ○  Plasticity — (dimmed)
  ○  Disarticulation — (dimmed)
  ○  Sublimation — (dimmed)
```

**Backward compatibility:** Vampire/Werewolf pool items have no `powers` array. The panel renders only when `item.powers` is present. Zero regression risk.

---

## State

No change to state shape. Transmutation allocations remain:

```js
{ alchemicus: 0, corporeum: 2, deception: 0, electrum: 0,
  ferrum_t: 1, sanguinem: 0, saturninus: 0, spiritus: 1,
  stannum_t: 0, vitality: 0 }
```

The `powers` array in the JSON is display-only. No underscore-prefixed keys needed (unlike Mummy) because powers are not separately selected.

---

## Review and Sheet Display

`StepReview.jsx` and `CharacterSheet.jsx`: for each allocated pool item that has a `powers` array, show active power names inline after the dot count. Only when dots > 0.

```jsx
{item.powers && dots > 0 && (
  <span className="text-sm text-gray-500 ml-2">
    — {item.powers.slice(0, dots).map(p => p.name).join(', ')}
  </span>
)}
```

---

## Merits Wiring

`StepMerits.jsx`: import `PROMETHEAN_MERITS` from `../data/promethean-merits.json`; add `promethean: PROMETHEAN_MERITS` to the `LINE_MERITS` map. Identical pattern to all prior lines.

---

## Testing

- **`StepPowers.test.jsx`**: pool item with `powers` array — active powers styled at allocated dot count, powers above dimmed, collapse/expand behavior, Vampire items unaffected (no panel rendered).
- **`StepReview.test.jsx` / `CharacterSheet.test.jsx`**: active power names appear inline; zero-dot paths show nothing.
- **`StepMerits.test.jsx`**: Promethean tab shows Elpis and Torment.

---

## Extraction Workflow

Two PDF passes, one commit per data file:

1. **`promethean.json` powers** — Transmutations chapter; all 10 paths × 5 levels. Verify `startingDots` against chargen chapter.
2. **`promethean-merits.json`** — Merits chapter; all Promethean-specific merits.

Use subagent pattern: spawn pdf-reader agents (Haiku), compress with Headroom, pass compressed output to implementer agent. Never read PDFs in the main session.

---

## Out of Scope

- Bestowments (innate Lineage powers — not purchased, not displayed)
- Refinement mechanical effects (in-play concern)
- Disquiet and Wasteland rules (entirely in-play)
- Pandoran mechanics (in-play)
- Azoth as an interactive trait beyond its starting value display
- Torment track mechanics (in-play degeneration)
