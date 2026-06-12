import SPELLS from '../data/spells.json'

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
