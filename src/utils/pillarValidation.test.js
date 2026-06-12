import { describe, it, expect } from 'vitest'
import { validatePillars, pillarPointsSpent, utteranceQualifies } from './pillarValidation'

describe('pillarPointsSpent', () => {
  it('counts normally when no pillar is at 5', () => {
    expect(pillarPointsSpent({ ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1 })).toBe(9)
  })

  it('adds 1 extra point for the pillar at 5', () => {
    // ab=5 costs 6 points; ba=1,ka=1,ren=1,sheut=0 → 3 points; total=9
    expect(pillarPointsSpent({ ab: 5, ba: 1, ka: 1, ren: 1, sheut: 0 })).toBe(9)
  })

  it('ignores underscore meta-keys', () => {
    expect(pillarPointsSpent({ ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1, _soul_affinity: 'x' })).toBe(9)
  })
})

describe('validatePillars', () => {
  const defining = { definingPillarId: 'ab' }

  it('returns no errors for a legal 9-point build', () => {
    expect(validatePillars({ ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1 }, defining)).toEqual([])
  })

  it('returns no errors when one pillar is at 0', () => {
    expect(validatePillars({ ab: 3, ba: 2, ka: 2, ren: 2, sheut: 0 }, defining)).toEqual([])
  })

  it('errors when point total is under 9', () => {
    const errors = validatePillars({ ab: 2, ba: 2, ka: 2, ren: 1, sheut: 1 }, defining)
    expect(errors).toContain('Spend exactly 9 dot-points (8 spent).')
  })

  it('errors when point total is over 9', () => {
    const errors = validatePillars({ ab: 3, ba: 3, ka: 2, ren: 1, sheut: 1 }, defining)
    expect(errors).toContain('Spend exactly 9 dot-points (10 spent).')
  })

  it('errors when a non-defining pillar exceeds the defining pillar', () => {
    // ab=2 (defining), ba=4 — ba > ab
    const errors = validatePillars({ ab: 2, ba: 4, ka: 1, ren: 1, sheut: 1 }, defining)
    expect(errors).toContain('No Pillar may exceed your defining Pillar.')
  })

  it('allows the defining pillar to equal non-defining pillars', () => {
    // ab=3 (defining), ba=3 — equal is fine
    expect(validatePillars({ ab: 3, ba: 3, ka: 2, ren: 1, sheut: 0 }, { definingPillarId: 'ab' })).toEqual([])
  })

  it('errors when two pillars are at zero', () => {
    const errors = validatePillars({ ab: 4, ba: 3, ka: 2, ren: 0, sheut: 0 }, defining)
    expect(errors).toContain('At most one Pillar may be left at 0.')
  })

  it('errors when a pillar is at 5 but another is at zero', () => {
    // ab=5 (6pts) + ba=1+ka=1+ren=1+sheut=0 = 9pts, but five-and-zero violates the rule
    const errors = validatePillars({ ab: 5, ba: 1, ka: 1, ren: 1, sheut: 0 }, defining)
    expect(errors).toContain('To take the 5th dot in a Pillar, all others must have at least 1.')
  })

  it('ignores underscore meta-keys', () => {
    const powers = { ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1, _soul_affinity: 'blessed_soul' }
    expect(validatePillars(powers, defining)).toEqual([])
  })
})

describe('utteranceQualifies', () => {
  const utterance = {
    id: 'awaken_the_dead',
    name: 'Awaken the Dead',
    tiers: [
      { tier: 1, pillar: 'ba',    level: 1, tags: [], description: '' },
      { tier: 2, pillar: 'sheut', level: 3, tags: [], description: '' },
      { tier: 3, pillar: 'ren',   level: 5, tags: [], description: '' },
    ]
  }

  it('returns true when the tier-1 Pillar minimum is met', () => {
    expect(utteranceQualifies(utterance, { ba: 1 })).toBe(true)
    expect(utteranceQualifies(utterance, { ba: 3 })).toBe(true)
  })

  it('returns false when the tier-1 Pillar minimum is not met', () => {
    expect(utteranceQualifies(utterance, { ba: 0 })).toBe(false)
    expect(utteranceQualifies(utterance, {})).toBe(false)
  })

  it('returns false when the utterance has no tier-1 entry', () => {
    expect(utteranceQualifies({ tiers: [] }, { ba: 5 })).toBe(false)
  })
})
