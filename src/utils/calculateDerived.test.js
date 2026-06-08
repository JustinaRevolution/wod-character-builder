import { describe, it, expect } from 'vitest'
import calculateDerived from './calculateDerived'
import vampire from '../data/lines/vampire.json'

const attrs = {
  mental:   { intelligence: 2, wits: 3, resolve: 2 },
  physical: { strength: 2, dexterity: 3, stamina: 2 },
  social:   { presence: 2, manipulation: 1, composure: 3 },
}

describe('calculateDerived', () => {
  it('calculates Health as Stamina + 5', () => {
    expect(calculateDerived(attrs, vampire).health).toBe(7)
  })

  it('calculates Willpower as Resolve + Composure', () => {
    expect(calculateDerived(attrs, vampire).willpower).toBe(5)
  })

  it('calculates Speed as Strength + Dexterity + 5', () => {
    expect(calculateDerived(attrs, vampire).speed).toBe(10)
  })

  it('calculates Defense as min(Wits, Dexterity)', () => {
    expect(calculateDerived(attrs, vampire).defense).toBe(3)
  })

  it('calculates Initiative as Dexterity + Composure', () => {
    expect(calculateDerived(attrs, vampire).initiative).toBe(6)
  })

  it('sets resource pool name and max from lineData', () => {
    const d = calculateDerived(attrs, vampire)
    expect(d.resource_pool.name).toBe('Vitae')
    expect(d.resource_pool.max).toBe(10)
  })

  it('sets integrity name and start value from lineData', () => {
    const d = calculateDerived(attrs, vampire)
    expect(d.integrity.name).toBe('Humanity')
    expect(d.integrity.value).toBe(7)
  })

  it('sets supernatural trait from lineData', () => {
    const d = calculateDerived(attrs, vampire)
    expect(d.supernatural_trait.name).toBe('Blood Potency')
    expect(d.supernatural_trait.value).toBe(1)
  })
})
