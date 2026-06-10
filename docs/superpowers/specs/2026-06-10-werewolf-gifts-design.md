# Werewolf Gifts — Design Spec
**Date:** 2026-06-10
**Status:** Approved

---

## Overview

Add a fully interactive Gift selection step to the Werewolf: the Forsaken character creator. Gifts replace the current free-text pick fields with a browsable, Renown-gated catalog drawn from all 22 gift lists in the WtF 1st edition core book.

---

## Data

### `src/data/gifts.json`

Keyed by list id. 22 entries covering all Auspice, Tribe, and universal lists.

```json
{
  "dominance": {
    "id": "dominance",
    "name": "Dominance",
    "gifts": [
      {
        "level": 1,
        "name": "Loose Tongue",
        "cost": "1 Essence",
        "dice": "Manipulation + Subterfuge + Cunning",
        "action": "Instant",
        "description": "One or two sentences from the book."
      }
    ]
  }
}
```

**All 22 lists to extract from WtF (pages to be confirmed during extraction):**

Crescent Moon, Death, Dominance, Elemental, Evasion, Father Wolf, Full Moon, Gibbous Moon, Half Moon, Insight, Inspiration, Knowledge, Mother Luna, Nature, New Moon, Rage, Shaping, Stealth, Strength, Technology, Warding, Weather

Many lists are shared across Auspice and Tribe (e.g., Dominance is both Rahu and Storm Lords). The JSON contains one entry per list regardless of how many groups reference it.

### `src/data/lines/werewolf.json` changes

**Powers section** — replace `type: "picks"` with:
```json
{
  "type": "gifts",
  "label": "Gifts",
  "auspicePicks": 3,
  "tribePicks": 3
}
```

**Auspice options** — add `giftLists` to each:
| Auspice | Gift Lists |
|---------|-----------|
| Rahu | `["dominance", "full_moon", "strength"]` |
| Cahalith | `["gibbous_moon", "inspiration", "knowledge"]` |
| Elodoth | `["half_moon", "insight", "warding"]` |
| Ithaeur | `["crescent_moon", "elemental", "shaping"]` |
| Irraka | `["evasion", "new_moon", "stealth"]` |

**Tribe options** — add `giftLists` to each:
| Tribe | Gift Lists |
|-------|-----------|
| Blood Talons | `["inspiration", "rage", "strength"]` |
| Bone Shadows | `["death", "insight", "warding"]` |
| Hunters in Darkness | `["elemental", "nature", "stealth"]` |
| Iron Masters | `["knowledge", "shaping", "technology"]` |
| Storm Lords | `["dominance", "evasion", "weather"]` |
| Ghost Wolves | `["father_wolf", "mother_luna"]` (universal only; see Ghost Wolf note) |

---

## State

The `powers` state object stores selected gift ids as two arrays:

```js
{
  auspice_gifts: ["loose_tongue", "eyes_of_the_wolf"],  // up to 3 ids
  tribe_gifts:   ["pack_hunter"],                        // up to 3 ids
}
```

Gift ids are `snake_case` derived from gift names. Deselecting removes the id. The existing `onSetPowers` callback is unchanged — no parent wizard changes needed.

---

## Component

### `GiftsPowers` (new, inside `StepPowers.jsx`)

Rendered when `lineData.powers.type === "gifts"`.

**Props received from StepPowers:**
- `lineData` — werewolf line definition
- `template` — selected auspice + tribe ids
- `powers` — current powers state `{ auspice_gifts, tribe_gifts }`
- `onSetPowers` — setter
- `renown` — current renown state (used for Renown cap enforcement)

**Layout:**

```
┌─ Auspice Gifts (2 of 3 selected) ──────────────────────┐
│  [ Dominance ]  [ Full Moon ]  [ Strength ]             │
│                                                         │
│  ● Loose Tongue          ✓ selected                    │
│  ● Eyes of the Wolf      tap to select                 │
│  ●● (greyed — Renown ●● required)                     │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
┌─ Tribe Gifts (0 of 3 selected) ────────────────────────┐
│  [ Inspiration ]  [ Rage ]  [ Strength ]                │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

**Behaviour:**
- Two sections: Auspice Gifts and Tribe Gifts, each with a tab strip for its gift lists
- Gifts grouped by level within each list (●, ●●, ●●●, etc.)
- A gift is selectable only if its level ≤ the character's highest current Renown dot; gifts above this cap are greyed and unclickable
- Selecting a 4th gift when 3 are already chosen does nothing
- Counter badge on each section header shows "N of 3 selected"

**Ghost Wolf special case:**
- Ghost Wolves have no tribe, so the Tribe Gifts section is hidden
- The Auspice Gifts section remains (3 picks from auspice lists)
- Verify exact chargen rules during PDF extraction

### `StepPowers.jsx` changes

Add a branch in the render:
```jsx
type === 'gifts'
  ? <GiftsPowers ... />
  : type === 'pool'
    ? <PoolPowers ... />
    : <PicksPowers ... />
```

Pass `renown` prop into `GiftsPowers` (already available in `StepPowers`).

---

## Renown Cap

`maxLevel = Math.max(...Object.values(renown))` — the highest single Renown dot value. A gift at level N is locked if `N > maxLevel`. If no Renown dots are set (unlikely but possible mid-wizard), default cap is 1.

---

## Ghost Wolf Note

Ghost Wolves are tribeless and receive no tribal gift lists. They may access Father Wolf and Mother Luna (universal lists) as their auspice-equivalent lists — verify exact rule during PDF extraction. For now: Ghost Wolves see only the Auspice section (3 picks), with their `giftLists` pointing to the universal lists.

---

## Out of Scope

- Rites (separate power system, not Gifts)
- Gifts from supplement books
- Ghost Wolf tribal gift equivalents beyond Father Wolf / Mother Luna (verify during extraction)
