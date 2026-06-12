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
