# Werewolf Gifts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fully interactive, Renown-gated Gift selection UI to the Werewolf: the Forsaken character creator, backed by a complete `gifts.json` extracted from WtF 1e (pp. 104–~150).

**Architecture:** `gifts.json` holds 22 lists × 5 levels each. `werewolf.json` powers type changes to `"gifts"` and each auspice/tribe option gains `giftLists`. A new `GiftsPowers` component (inside `StepPowers.jsx`) renders two tabbed sections (Auspice / Tribe) with Renown-gated gift entries. Ghost Wolves see only the Auspice section.

**Tech Stack:** React 18, Vite, Tailwind CSS, Vitest + Testing Library

---

## File Map

| Action | Path |
|--------|------|
| Create | `src/data/gifts.json` |
| Modify | `src/data/lines/werewolf.json` |
| Modify | `src/components/wizard/StepPowers.jsx` |
| Modify | `src/components/wizard/StepPowers.test.jsx` |

---

## Task 1 — Create `gifts.json` with first 7 complete lists

Data extracted from WtF pp. 104–117 (Crescent Moon, Death, Dominance, Elemental, Evasion, Father Wolf's, Full Moon). Each gift has an explicit `id` field in `snake_case` — do **not** derive ids at runtime.

**Files:**
- Create: `src/data/gifts.json`

- [ ] **Step 1: Create the file**

```json
{
  "crescent_moon": {
    "id": "crescent_moon",
    "name": "Crescent Moon",
    "gifts": [
      {
        "id": "two_world_eyes",
        "level": 1,
        "name": "Two-World Eyes",
        "cost": "None",
        "dice": "Wits + Occult + Wisdom",
        "action": "Instant",
        "description": "The Ithaeur can peer across the Gauntlet without sacrificing her perception of either world, seeing both simultaneously for the duration of the scene."
      },
      {
        "id": "read_spirit",
        "level": 2,
        "name": "Read Spirit",
        "cost": "1 Essence",
        "dice": "Intelligence + Occult + Cunning",
        "action": "Instant",
        "description": "The werewolf hears an internal voice that reveals a spirit's name, type, Rank, and one pertinent fact per success rolled."
      },
      {
        "id": "gauntlet_cloak",
        "level": 3,
        "name": "Gauntlet Cloak",
        "cost": "1 Essence",
        "dice": "Dexterity + Occult + Purity",
        "action": "Instant",
        "description": "The Ithaeur wraps the Gauntlet around herself, gaining a –2 concealment modifier against ranged attacks and imposing penalties on attempts to spot or recognize her."
      },
      {
        "id": "between_the_weave",
        "level": 4,
        "name": "Between the Weave",
        "cost": "1 Essence",
        "dice": "No roll required",
        "action": "Reflexive",
        "description": "The Ithaeur can cross the Gauntlet as a reflexive action and still take a normal action in the same turn, leaping between worlds to attack or escape with ease."
      },
      {
        "id": "crash_the_gates",
        "level": 5,
        "name": "Crash the Gates",
        "cost": "1 Essence + 1 per packmate",
        "dice": "No roll required",
        "action": "Instant",
        "description": "The Ithaeur extends Between the Weave to her packmates, allowing the entire pack to cross the Gauntlet simultaneously in a single action."
      }
    ]
  },
  "death": {
    "id": "death",
    "name": "Death",
    "gifts": [
      {
        "id": "death_sight",
        "level": 1,
        "name": "Death Sight",
        "cost": "None",
        "dice": "No roll required",
        "action": "Instant",
        "description": "The werewolf's sight attunes to the dead: he perceives ghosts and phantom bloodstains marking where creatures died within the last lunar month."
      },
      {
        "id": "ghost_knife",
        "level": 2,
        "name": "Ghost Knife",
        "cost": "1 Essence",
        "dice": "No roll required",
        "action": "Instant",
        "description": "The werewolf imbues a weapon with Essence, making it capable of striking immaterial ghosts as readily as physical targets, and adding a bonus die to attack rolls against spirits."
      },
      {
        "id": "corpse_witness",
        "level": 3,
        "name": "Corpse Witness",
        "cost": "1 Essence",
        "dice": "Manipulation + Occult + Purity",
        "action": "Instant",
        "description": "The werewolf breathes into a corpse's mouth; the corpse reports everything it perceived since its death, useful for uncovering what transpired at a crime scene."
      },
      {
        "id": "word_of_quiet",
        "level": 4,
        "name": "Word of Quiet",
        "cost": "1 Willpower",
        "dice": "Presence + Occult + Honor – subject's Stamina",
        "action": "Instant",
        "description": "The werewolf speaks a word in the First Tongue that inflicts bashing damage on living creatures in range and lethal damage on undead within hearing."
      },
      {
        "id": "vengeance_of_the_slain",
        "level": 5,
        "name": "Vengeance of the Slain",
        "cost": "1 Essence",
        "dice": "Stamina + Occult + Wisdom",
        "action": "Instant",
        "description": "The werewolf briefly returns a recently deceased Uratha to a semblance of life for roughly one hour per success, allowing her to act and use her supernatural powers."
      }
    ]
  },
  "dominance": {
    "id": "dominance",
    "name": "Dominance",
    "gifts": [
      {
        "id": "warning_growl",
        "level": 1,
        "name": "Warning Growl",
        "cost": "1 Willpower",
        "dice": "Presence + Intimidation + Glory vs. Composure + Primal Urge",
        "action": "Contested; resistance is reflexive",
        "description": "The werewolf's supernatural growl strikes sudden doubt into a target, giving the Gift user a +2 Defense bonus against that target's close-combat attacks for the duration of the scene."
      },
      {
        "id": "lunas_dictum",
        "level": 2,
        "name": "Luna's Dictum",
        "cost": "1 Willpower",
        "dice": "Presence + Intimidation + Glory vs. Composure + Primal Urge",
        "action": "Contested; resistance is reflexive",
        "description": "The werewolf voices a brief command that compels a single target to obey for up to five minutes per success rolled."
      },
      {
        "id": "voice_of_command",
        "level": 3,
        "name": "Voice of Command",
        "cost": "1 Essence",
        "dice": "Manipulation + Intimidation + Honor vs. Resolve + Primal Urge",
        "action": "Contested; resistance is reflexive",
        "description": "The werewolf issues a decree affecting up to three targets, each of whom must obey a specific command given, suffering –1 to the roll per target after the first."
      },
      {
        "id": "break_the_defiant",
        "level": 4,
        "name": "Break the Defiant",
        "cost": "1 Essence",
        "dice": "Presence + Intimidation + Purity – subject's Resolve",
        "action": "Instant",
        "description": "The werewolf projects crushing authority, causing the target to immediately lose Willpower equal to the number of successes rolled."
      },
      {
        "id": "tug_the_souls_strings",
        "level": 5,
        "name": "Tug the Soul's Strings",
        "cost": "1 Essence",
        "dice": "Manipulation + Persuasion + Cunning vs. Resolve + Primal Urge",
        "action": "Contested; resistance is reflexive",
        "description": "The werewolf can force another person to perform deeds against her will, including deeds that defy her identity or cause harm to others."
      }
    ]
  },
  "elemental": {
    "id": "elemental",
    "name": "Elemental",
    "gifts": [
      {
        "id": "call_water",
        "level": 1,
        "name": "Call Water",
        "cost": "None",
        "dice": "Stamina + Survival + Purity",
        "action": "Instant",
        "description": "The werewolf summons water from thin air, creating one cup per success — enough to stave off death from dehydration. Cannot be invoked more than once an hour."
      },
      {
        "id": "manipulate_earth",
        "level": 2,
        "name": "Manipulate Earth",
        "cost": "1 Essence",
        "dice": "Dexterity + Crafts + Cunning",
        "action": "Instant",
        "description": "The werewolf shapes earth as if it were clay, sculpting a surface area of roughly 100 square feet or 40 cubic feet for cover or escape. Changes are permanent."
      },
      {
        "id": "command_fire",
        "level": 3,
        "name": "Command Fire",
        "cost": "1 Essence",
        "dice": "Strength + Survival + Glory",
        "action": "Instant",
        "description": "The werewolf commands existing flames within line of sight, directing them at a target within 20 yards for one die of fire damage per success."
      },
      {
        "id": "invoke_the_winds_wrath",
        "level": 4,
        "name": "Invoke the Wind's Wrath",
        "cost": "2 Essence",
        "dice": "Strength + Empathy + Honor",
        "action": "Instant",
        "description": "The werewolf calls a whirlwind of 10-foot radius that moves at his Speed, lifting those 150 lbs. or less and inflicting one die of lethal damage per success."
      },
      {
        "id": "lament_of_the_river",
        "level": 5,
        "name": "Lament of the River",
        "cost": "3 Essence",
        "dice": "Stamina + Intimidation + Wisdom",
        "action": "Extended (50 successes; each roll = one minute of concentration)",
        "description": "The werewolf calls rivers and streams to burst their banks, causing devastating floods across one square mile when 50 successes are accumulated."
      }
    ]
  },
  "evasion": {
    "id": "evasion",
    "name": "Evasion",
    "gifts": [
      {
        "id": "loose_tongue",
        "level": 1,
        "name": "Loose Tongue",
        "cost": "None",
        "dice": "Manipulation + Socialize + Wisdom vs. Composure + Primal Urge",
        "action": "Contested; resistance is reflexive",
        "description": "The werewolf's presence makes targets oddly chatty and susceptible to 'friendly conversation,' lowering their guard and making them less able to keep secrets."
      },
      {
        "id": "sand_in_the_eyes",
        "level": 2,
        "name": "Sand in the Eyes",
        "cost": "None",
        "dice": "Manipulation + Subterfuge + Honor vs. Composure + Primal Urge",
        "action": "Contested; resistance is reflexive",
        "description": "The werewolf becomes imminently forgettable; subjects suffer a –5 penalty to Intelligence + Composure rolls to remember details about her for the rest of the scene."
      },
      {
        "id": "playing_possum",
        "level": 3,
        "name": "Playing Possum",
        "cost": "1 Willpower",
        "dice": "Wits + Subterfuge + Cunning",
        "action": "Reflexive",
        "description": "The werewolf appears freshly dead — no pulse, breathing, or warmth — for up to one day, and can revive as an instant action at will."
      },
      {
        "id": "double_back",
        "level": 4,
        "name": "Double Back",
        "cost": "1 Willpower",
        "dice": "Intelligence + Investigation + Glory",
        "action": "Reflexive",
        "description": "The werewolf becomes immediately aware of all physical deception in her environment — hidden trails, disguises, concealed evidence — and cannot be fooled by such for the rest of the scene."
      },
      {
        "id": "fog_of_war",
        "level": 5,
        "name": "Fog of War",
        "cost": "1 Essence",
        "dice": "Manipulation + Expression + Honor vs. Resolve + Primal Urge",
        "action": "Contested; resistance is reflexive",
        "description": "The werewolf's howl sows confusion; all targets within extreme hearing range suffer a –3 penalty to all actions for as long as the werewolf concentrates."
      }
    ]
  },
  "father_wolf": {
    "id": "father_wolf",
    "name": "Father Wolf's",
    "gifts": [
      {
        "id": "wolf_bloods_lure",
        "level": 1,
        "name": "Wolf-Blood's Lure",
        "cost": "None",
        "dice": "No roll required",
        "action": "Reflexive",
        "description": "The werewolf projects his wolf soul more strongly, gaining a bonus die on all Social rolls involving wolves or canids and earning the trust of wolf packs with ease. Lasts from moonrise to moonrise."
      },
      {
        "id": "father_wolfs_speed",
        "level": 2,
        "name": "Father Wolf's Speed",
        "cost": "1 Essence",
        "dice": "No roll required",
        "action": "Reflexive",
        "description": "The werewolf's Speed is doubled (after modifiers) and opponents suffer –2 to Firearms dice pools against him; the effects last for a scene."
      },
      {
        "id": "primal_howl",
        "level": 3,
        "name": "Primal Howl",
        "cost": "1 Essence",
        "dice": "Presence + Expression + Purity vs. Composure",
        "action": "Contested; resistance is reflexive",
        "description": "The werewolf's howl overwhelms those who hear it with primal fear as if affected by Lunacy, affecting all targets within 10 yards per dot of Primal Urge."
      },
      {
        "id": "savage_rending",
        "level": 4,
        "name": "Savage Rending",
        "cost": "1 Essence",
        "dice": "No roll required",
        "action": "Reflexive",
        "description": "The werewolf's claw and bite attacks inflict aggravated damage for the duration of the scene. Using this Gift against other werewolves is considered a sin against Harmony."
      },
      {
        "id": "spirit_pack",
        "level": 5,
        "name": "Spirit Pack",
        "cost": "1 Essence",
        "dice": "Manipulation + Animal Ken + Glory",
        "action": "Instant",
        "description": "The werewolf howls a battle cry summoning one ghostly Wolf-Brother spirit per success to fight alongside him until there are no more enemies or the Gift user is slain."
      }
    ]
  },
  "full_moon": {
    "id": "full_moon",
    "name": "Full Moon",
    "gifts": [
      {
        "id": "clarity",
        "level": 1,
        "name": "Clarity",
        "cost": "1 Essence",
        "dice": "No roll required",
        "action": "Reflexive",
        "description": "The werewolf increases his Initiative modifier by five for the remainder of the fight, greatly improving his odds of striking first in battle."
      },
      {
        "id": "attunement",
        "level": 2,
        "name": "Attunement",
        "cost": "1 Willpower",
        "dice": "Wits + Brawl + Wisdom – opponent's Resolve",
        "action": "Reflexive",
        "description": "After one full turn observing a foe, the werewolf can ignore a portion of that opponent's Defense equal to half his Primal Urge (rounded up) for the rest of the scene."
      },
      {
        "id": "death_grip",
        "level": 3,
        "name": "Death Grip",
        "cost": "1 Essence per bite attack",
        "dice": "Strength + Brawl + Glory",
        "action": "Reflexive",
        "description": "The werewolf's jaws lock with supernatural force: bite damage is doubled and the victim suffers a penalty to breaking free or performing overpower maneuvers."
      },
      {
        "id": "rage_armor",
        "level": 4,
        "name": "Rage Armor",
        "cost": "1 Essence",
        "dice": "Stamina + Survival + Honor",
        "action": "Instant",
        "description": "The werewolf tempers his flesh with Rage, gaining one point of Armor per two successes rolled; the armor lasts for a number of turns equal to his Primal Urge dots."
      },
      {
        "id": "lunas_fury",
        "level": 5,
        "name": "Luna's Fury",
        "cost": "1 Essence per turn",
        "dice": "Dexterity + Empathy + Cunning",
        "action": "Instant",
        "description": "The werewolf becomes a vessel for Luna's wrath: his Defense doubles against incoming attacks, he gains two extra dice on close-combat attacks, and all attacks can be staged normally."
      }
    ]
  }
}
```

- [ ] **Step 2: Validate JSON**

```bash
node -e "const d = require('./src/data/gifts.json'); console.log('Lists:', Object.keys(d).join(', '))"
```
Expected output: `Lists: crescent_moon, death, dominance, elemental, evasion, father_wolf, full_moon`

- [ ] **Step 3: Commit**

```bash
git add src/data/gifts.json
git commit -m "feat: add gifts.json — first 7 lists (Crescent Moon through Full Moon)"
```

---

## Task 2 — Extract gifts.json — Gibbous Moon through Mother Luna (pp. 117–136)

**Files:**
- Modify: `src/data/gifts.json`

- [ ] **Step 1: Read PDF pages 117–136**

```
Read("/home/justina/Desktop/TTRPG Workshop/New World of Darkness/Werewolf - The Forsaken.pdf", pages: "117-136")
```

Extract these 6 lists in order as they appear: **Gibbous Moon**, **Half Moon**, **Insight**, **Inspiration**, **Knowledge**, **Mother Luna**. Use the same gift shape as Task 1:
```json
{ "id": "snake_case_gift_name", "level": 1–5, "name": "...", "cost": "...", "dice": "...", "action": "...", "description": "One or two sentences." }
```

- [ ] **Step 2: Add extracted lists to gifts.json**

Append each new list as a top-level key. List ids: `gibbous_moon`, `half_moon`, `insight`, `inspiration`, `knowledge`, `mother_luna`.

- [ ] **Step 3: Validate**

```bash
node -e "const d = require('./src/data/gifts.json'); console.log('Lists:', Object.keys(d).length, Object.keys(d).join(', '))"
```
Expected: 13 lists listed.

- [ ] **Step 4: Commit**

```bash
git add src/data/gifts.json
git commit -m "feat: add gifts.json — Gibbous Moon through Mother Luna"
```

---

## Task 3 — Extract gifts.json — Nature through Weather (pp. 136–155)

**Files:**
- Modify: `src/data/gifts.json`

- [ ] **Step 1: Read PDF pages 136–155**

```
Read("/home/justina/Desktop/TTRPG Workshop/New World of Darkness/Werewolf - The Forsaken.pdf", pages: "136-155")
```

Extract these 9 lists: **Nature**, **New Moon**, **Rage**, **Shaping**, **Stealth**, **Strength**, **Technology**, **Warding**, **Weather**. Use the same gift shape.

List ids: `nature`, `new_moon`, `rage`, `shaping`, `stealth`, `strength`, `technology`, `warding`, `weather`.

If any list is cut off at page 155, read pages 155–165 to complete it.

- [ ] **Step 2: Add extracted lists to gifts.json**

- [ ] **Step 3: Verify all 22 lists are present**

```bash
node -e "
const d = require('./src/data/gifts.json');
const expected = ['crescent_moon','death','dominance','elemental','evasion','father_wolf','full_moon','gibbous_moon','half_moon','insight','inspiration','knowledge','mother_luna','nature','new_moon','rage','shaping','stealth','strength','technology','warding','weather'];
const missing = expected.filter(k => !d[k]);
const wrong = Object.values(d).filter(list => list.gifts.length !== 5).map(l => l.id);
if (missing.length) console.error('MISSING:', missing);
else if (wrong.length) console.error('NOT 5 GIFTS:', wrong);
else console.log('OK — all 22 lists with 5 gifts each');
"
```
Expected: `OK — all 22 lists with 5 gifts each`

- [ ] **Step 4: Commit**

```bash
git add src/data/gifts.json
git commit -m "feat: add gifts.json — Nature through Weather, completing all 22 lists"
```

---

## Task 4 — Update `werewolf.json`

Add `giftLists` to every auspice and tribe option. Change `powers.type` to `"gifts"`. This will break the existing `picks type (Werewolf)` tests — expected.

**Files:**
- Modify: `src/data/lines/werewolf.json`

- [ ] **Step 1: Replace the file contents**

```json
{
  "id": "werewolf", "name": "Werewolf: the Forsaken", "shortName": "Werewolf", "color": "#70a070",
  "template": {
    "group1": {
      "label": "Tribe", "field": "tribe",
      "options": [
        { "id": "blood_talons", "name": "Blood Talons",        "description": "Warriors for whom battle is sacred.",          "hint": "Primary Renown: Glory",   "giftLists": ["inspiration", "rage", "strength"] },
        { "id": "bone_shadows", "name": "Bone Shadows",        "description": "Spirit-speakers who walk between worlds.",     "hint": "Primary Renown: Wisdom",  "giftLists": ["death", "insight", "warding"] },
        { "id": "hunters",      "name": "Hunters in Darkness", "description": "Guardians of the sacred hunt ground.",         "hint": "Primary Renown: Purity",  "giftLists": ["elemental", "nature", "stealth"] },
        { "id": "iron_masters", "name": "Iron Masters",        "description": "Adaptors who embrace the modern world.",       "hint": "Primary Renown: Cunning", "giftLists": ["knowledge", "shaping", "technology"] },
        { "id": "storm_lords",  "name": "Storm Lords",         "description": "Alphas born to lead packs ruthlessly.",        "hint": "Primary Renown: Honor",   "giftLists": ["dominance", "evasion", "weather"] },
        { "id": "ghost_wolves", "name": "Ghost Wolves",        "description": "Tribeless Uratha — free but without a totem.", "hint": "No primary Renown",       "giftLists": ["father_wolf", "mother_luna"] }
      ]
    },
    "group2": {
      "label": "Auspice", "field": "auspice",
      "options": [
        { "id": "cahalith", "name": "Cahalith", "description": "Gibbous Moon — visionaries and lorekeepers.", "hint": "Renown: Glory. Bonus Skills: Crafts, Expression, Persuasion",    "renownTrack": "Glory",   "giftLists": ["gibbous_moon", "inspiration", "knowledge"] },
        { "id": "elodoth",  "name": "Elodoth",  "description": "Half Moon — judges who walk between worlds.", "hint": "Renown: Honor. Bonus Skills: Empathy, Investigation, Politics",  "renownTrack": "Honor",   "giftLists": ["half_moon", "insight", "warding"] },
        { "id": "irraka",   "name": "Irraka",   "description": "New Moon — scouts and tricksters of shadow.", "hint": "Renown: Cunning. Bonus Skills: Larceny, Stealth, Subterfuge",   "renownTrack": "Cunning", "giftLists": ["evasion", "new_moon", "stealth"] },
        { "id": "ithaeur",  "name": "Ithaeur",  "description": "Crescent Moon — shamans who deal with spirits.", "hint": "Renown: Wisdom. Bonus Skills: Animal Ken, Occult, Survival", "renownTrack": "Wisdom",  "giftLists": ["crescent_moon", "elemental", "shaping"] },
        { "id": "rahu",     "name": "Rahu",     "description": "Full Moon — warriors born for battle.",        "hint": "Renown: Purity. Bonus Skills: Brawl, Intimidation, Weaponry",  "renownTrack": "Purity",  "giftLists": ["dominance", "full_moon", "strength"] }
      ]
    }
  },
  "powers": {
    "type": "gifts",
    "label": "Gifts",
    "auspicePicks": 3,
    "tribePicks": 3
  },
  "renown": { "tracks": ["Cunning","Glory","Honor","Purity","Wisdom"], "startingDots": 1, "fromAuspice": true },
  "resource": {
    "pool":  { "name": "Essence",    "startValue": 10 },
    "trait": { "name": "Primal Urge","startValue": 1  }
  },
  "integrity": { "name": "Harmony", "startValue": 7 }
}
```

- [ ] **Step 2: Run tests — expect `picks type (Werewolf)` tests to fail**

```bash
npm test -- --run 2>&1 | grep -E "PASS|FAIL|✓|✗|×"
```
Expected: some werewolf tests fail (that's correct — they'll be replaced in Task 5).

- [ ] **Step 3: Commit**

```bash
git add src/data/lines/werewolf.json
git commit -m "feat: update werewolf.json — gifts type, add giftLists to all auspice/tribe options"
```

---

## Task 5 — Write failing tests for GiftsPowers + replace old picks tests

**Files:**
- Modify: `src/components/wizard/StepPowers.test.jsx`

- [ ] **Step 1: Replace the `picks type (Werewolf)` describe block**

Find and replace the entire `describe('StepPowers — picks type (Werewolf)', ...)` block in `StepPowers.test.jsx` with the following:

```jsx
describe('StepPowers — gifts type (Werewolf)', () => {
  const baseRenown = { Cunning: 0, Glory: 0, Honor: 0, Purity: 1, Wisdom: 0 }

  it('renders Auspice Gifts section heading', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu', tribe: 'blood_talons' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.getByText('Auspice Gifts')).toBeInTheDocument()
  })

  it('renders Tribe Gifts section for non-Ghost-Wolves', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu', tribe: 'blood_talons' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.getByText('Tribe Gifts')).toBeInTheDocument()
  })

  it('hides Tribe Gifts section for Ghost Wolves', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu', tribe: 'ghost_wolves' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.queryByText('Tribe Gifts')).toBeNull()
  })

  it('shows gift list tabs for the selected auspice (Rahu = Dominance, Full Moon, Strength)', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu', tribe: 'blood_talons' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.getByRole('button', { name: 'Dominance' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Full Moon' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Strength' })).toBeInTheDocument()
  })

  it('shows "0 of 3" counter for each section initially', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu', tribe: 'blood_talons' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.getAllByText('0 of 3')).toHaveLength(2)
  })

  it('calls onSetPowers with auspice_gifts when a level-1 gift is clicked', () => {
    const onSetPowers = vi.fn()
    // Ithaeur: Crescent Moon is the first tab; first gift = Two-World Eyes (level 1)
    render(<StepPowers lineData={werewolf} template={{ auspice: 'ithaeur', tribe: 'bone_shadows' }} powers={{}} onSetPowers={onSetPowers} renown={{ Cunning: 0, Glory: 0, Honor: 0, Purity: 0, Wisdom: 1 }} onSetRenown={() => {}} />)
    fireEvent.click(screen.getByText('Two-World Eyes'))
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ auspice_gifts: ['two_world_eyes'] }))
  })

  it('deselects a gift when clicked again', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={werewolf} template={{ auspice: 'ithaeur', tribe: 'bone_shadows' }} powers={{ auspice_gifts: ['two_world_eyes'] }} onSetPowers={onSetPowers} renown={{ Cunning: 0, Glory: 0, Honor: 0, Purity: 0, Wisdom: 1 }} onSetRenown={() => {}} />)
    fireEvent.click(screen.getByText('Two-World Eyes'))
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ auspice_gifts: [] }))
  })

  it('does not add a 4th auspice gift when 3 are already selected', () => {
    const onSetPowers = vi.fn()
    // 3 already selected; Between the Weave is level 4 and unlocked (Wisdom 4); it should be disabled (maxed)
    const threeSelected = { auspice_gifts: ['two_world_eyes', 'read_spirit', 'gauntlet_cloak'] }
    render(<StepPowers lineData={werewolf} template={{ auspice: 'ithaeur', tribe: 'bone_shadows' }} powers={threeSelected} onSetPowers={onSetPowers} renown={{ Cunning: 0, Glory: 0, Honor: 0, Purity: 0, Wisdom: 4 }} onSetRenown={() => {}} />)
    fireEvent.click(screen.getByText('Between the Weave'))
    expect(onSetPowers).not.toHaveBeenCalled()
  })

  it('does not activate gifts above the Renown cap', () => {
    const onSetPowers = vi.fn()
    // Read Spirit is level 2; with Wisdom 1 (maxLevel=1), it is locked
    render(<StepPowers lineData={werewolf} template={{ auspice: 'ithaeur', tribe: 'bone_shadows' }} powers={{}} onSetPowers={onSetPowers} renown={{ Cunning: 0, Glory: 0, Honor: 0, Purity: 0, Wisdom: 1 }} onSetRenown={() => {}} />)
    fireEvent.click(screen.getByText('Read Spirit'))
    expect(onSetPowers).not.toHaveBeenCalled()
  })

  it('renders Renown section with all 5 tracks', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu', tribe: 'blood_talons' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.getByText('Renown')).toBeInTheDocument()
    expect(screen.getByText('Cunning')).toBeInTheDocument()
    expect(screen.getByText('Glory')).toBeInTheDocument()
    expect(screen.getByText('Purity')).toBeInTheDocument()
  })

  it('marks the Auspice renown track', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.getByText('Auspice')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — new tests should fail, all others pass**

```bash
npm test -- --run 2>&1 | tail -20
```
Expected: new `gifts type (Werewolf)` tests fail with "Unable to find an element with the text: Auspice Gifts" or similar. All other test suites pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/wizard/StepPowers.test.jsx
git commit -m "test: replace werewolf picks tests with gifts type tests"
```

---

## Task 6 — Implement GiftsPowers and wire into StepPowers

**Files:**
- Modify: `src/components/wizard/StepPowers.jsx`

- [ ] **Step 1: Add the GIFTS import at the top of StepPowers.jsx** (after the existing imports)

```jsx
import GIFTS from '../../data/gifts.json'
```

- [ ] **Step 2: Add GiftSection component** (after the existing `KeysPicker` function, before `RenownSection`)

```jsx
function GiftSection({ label, giftLists, maxPicks, maxLevel, selected, onToggle }) {
  const [activeList, setActiveList] = useState(giftLists[0] || null)
  const count = selected.length
  const listData = activeList ? GIFTS[activeList] : null

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
        {label}
        <span className={`text-xs px-2 py-0.5 rounded ${
          count === maxPicks ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
        }`}>
          {count} of {maxPicks}
        </span>
      </h3>

      <div className="flex gap-1 flex-wrap mb-3">
        {giftLists.map(listId => (
          <button
            key={listId}
            onClick={() => setActiveList(listId)}
            className={`px-3 py-1 text-xs rounded ${
              activeList === listId
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {GIFTS[listId]?.name ?? listId}
          </button>
        ))}
      </div>

      {listData && (
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {listData.gifts.map(gift => {
            const isSelected = selected.includes(gift.id)
            const isLocked = gift.level > maxLevel
            const isMaxed = !isSelected && count >= maxPicks
            const isDisabled = isLocked || isMaxed

            return (
              <div
                key={gift.id}
                onClick={() => !isDisabled && onToggle(gift.id)}
                className={`p-2 rounded border transition-colors ${
                  isSelected
                    ? 'border-amber-400 bg-gray-800 cursor-pointer'
                    : isDisabled
                    ? 'border-gray-800 opacity-40 cursor-not-allowed'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs shrink-0 tracking-widest ${isDisabled ? 'text-gray-700' : 'text-amber-500'}`}>
                      {'●'.repeat(gift.level)}
                    </span>
                    <span className={`text-sm font-medium ${isSelected ? 'text-gray-100' : isDisabled ? 'text-gray-600' : 'text-gray-300'}`}>
                      {gift.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && <span className="text-amber-400 text-xs">✓</span>}
                    {isLocked
                      ? <span className="text-xs text-gray-700">{'●'.repeat(gift.level)} req.</span>
                      : <span className="text-xs text-gray-600">{gift.cost} · {gift.action}</span>
                    }
                  </div>
                </div>
                {!isLocked && (
                  <p className={`text-xs mt-1 leading-snug ${isSelected ? 'text-gray-400' : 'text-gray-600'}`}>
                    {gift.description}
                  </p>
                )}
                {!isLocked && gift.dice !== 'No roll required' && gift.dice !== 'This power requires no roll.' && (
                  <p className={`text-xs mt-0.5 ${isSelected ? 'text-gray-500' : 'text-gray-700'}`}>
                    Roll: {gift.dice}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Add GiftsPowers component** (directly after GiftSection)

```jsx
function GiftsPowers({ lineData, template, powers, onSetPowers, renown }) {
  const { auspicePicks, tribePicks } = lineData.powers
  const auspiceId = template[lineData.template.group2.field]
  const tribeId = template[lineData.template.group1.field]

  const auspiceOption = lineData.template.group2.options.find(o => o.id === auspiceId)
  const tribeOption = lineData.template.group1.options.find(o => o.id === tribeId)

  const auspiceGiftLists = auspiceOption?.giftLists ?? []
  const tribeGiftLists = tribeOption?.giftLists ?? []
  const isGhostWolf = tribeId === 'ghost_wolves'

  const renownValues = Object.values(renown).filter(v => typeof v === 'number')
  const maxLevel = renownValues.length > 0 ? Math.max(...renownValues, 1) : 1

  const auspiceSelected = powers.auspice_gifts ?? []
  const tribeSelected = powers.tribe_gifts ?? []

  const toggleAuspice = giftId => {
    const next = auspiceSelected.includes(giftId)
      ? auspiceSelected.filter(id => id !== giftId)
      : auspiceSelected.length < auspicePicks
        ? [...auspiceSelected, giftId]
        : auspiceSelected
    onSetPowers({ ...powers, auspice_gifts: next })
  }

  const toggleTribe = giftId => {
    const next = tribeSelected.includes(giftId)
      ? tribeSelected.filter(id => id !== giftId)
      : tribeSelected.length < tribePicks
        ? [...tribeSelected, giftId]
        : tribeSelected
    onSetPowers({ ...powers, tribe_gifts: next })
  }

  return (
    <div>
      {auspiceGiftLists.length > 0 && (
        <GiftSection
          label="Auspice Gifts"
          giftLists={auspiceGiftLists}
          maxPicks={auspicePicks}
          maxLevel={maxLevel}
          selected={auspiceSelected}
          onToggle={toggleAuspice}
        />
      )}
      {!isGhostWolf && tribeGiftLists.length > 0 && (
        <GiftSection
          label="Tribe Gifts"
          giftLists={tribeGiftLists}
          maxPicks={tribePicks}
          maxLevel={maxLevel}
          selected={tribeSelected}
          onToggle={toggleTribe}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Add the `gifts` branch to the StepPowers render**

In the `StepPowers` export default function, replace:
```jsx
        : type === 'pool'
          ? <PoolPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} />
          : <PicksPowers lineData={lineData} powers={powers} onSetPowers={onSetPowers} />
```
with:
```jsx
        : type === 'gifts'
          ? <GiftsPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} renown={renown} />
          : type === 'pool'
            ? <PoolPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} />
            : <PicksPowers lineData={lineData} powers={powers} onSetPowers={onSetPowers} />
```

- [ ] **Step 5: Run all tests**

```bash
npm test -- --run 2>&1 | tail -10
```
Expected:
```
Test Files  12 passed (12)
     Tests  XX passed (XX)
```
All tests green.

- [ ] **Step 6: Commit**

```bash
git add src/components/wizard/StepPowers.jsx
git commit -m "feat: add GiftsPowers component with Renown-gated gift selection"
```

---

## Task 7 — Push to GitHub

- [ ] **Step 1: Push**

```bash
git push
```

- [ ] **Step 2: Verify**

```bash
git log --oneline -6
```
Expected: 6 new commits on master, all visible on remote.

---

## Self-Review Notes

- **Spec coverage:** All spec requirements covered — 22 lists, Renown gating, tab UI, Ghost Wolf special case, counter badges, selection/deselection, 3-pick limit.
- **Type consistency:** `gift.id` is used in state arrays and toggle functions throughout. `powers.auspice_gifts` / `powers.tribe_gifts` used consistently in component and tests.
- **Ghost Wolf:** Their `giftLists` in werewolf.json point to `["father_wolf", "mother_luna"]`. The Tribe Gifts section is hidden (`isGhostWolf` check). They get 3 Auspice picks from their auspice lists only — consistent with the approved design.
- **`maxLevel` formula:** `Math.max(...renownValues, 1)` ensures the cap is at least 1 even if all Renown is 0 (shouldn't happen in practice but guards against edge cases).
- **Dice string matching:** Two gift entries use `"No roll required"` and one uses `"This power requires no roll."` — the `!isLocked` dice display check handles both correctly.
