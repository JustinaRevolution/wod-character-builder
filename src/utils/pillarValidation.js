export function pillarPointsSpent(powers) {
  return Object.entries(powers)
    .filter(([k]) => !k.startsWith('_'))
    .reduce((s, [, v]) => s + (v || 0) + ((v || 0) === 5 ? 1 : 0), 0)
}

export function validatePillars(powers, { definingPillarId }) {
  const entries = Object.entries(powers).filter(([k]) => !k.startsWith('_'))
  const spent = pillarPointsSpent(powers)
  const definingDots = powers[definingPillarId] || 0
  const zeros = entries.filter(([, v]) => (v || 0) === 0).length
  const hasFive = entries.some(([, v]) => (v || 0) === 5)
  const errors = []

  if (entries.some(([, v]) => (v || 0) > 5)) errors.push('No Pillar may exceed 5 dots.')
  if (spent !== 9) errors.push(`Spend exactly 9 dot-points (${spent} spent).`)
  if (entries.some(([id, v]) => id !== definingPillarId && (v || 0) > definingDots)) {
    errors.push('No Pillar may exceed your defining Pillar.')
  }
  if (zeros > 1) errors.push('At most one Pillar may be left at 0.')
  if (hasFive && zeros > 0) errors.push('To take the 5th dot in a Pillar, all others must have at least 1.')

  return errors
}

export function utteranceQualifies(utterance, powers) {
  const tier1 = utterance.tiers.find(t => t.tier === 1)
  if (!tier1) return false
  return (powers[tier1.pillar] || 0) >= tier1.level
}
