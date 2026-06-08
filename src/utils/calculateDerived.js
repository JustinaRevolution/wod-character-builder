export default function calculateDerived(attributes, lineData) {
  const m = attributes.mental
  const p = attributes.physical
  const s = attributes.social

  return {
    health:     p.stamina + 5,
    willpower:  m.resolve + s.composure,
    speed:      p.strength + p.dexterity + 5,
    defense:    Math.min(m.wits, p.dexterity),
    initiative: p.dexterity + s.composure,
    resource_pool: lineData.resource.pool
      ? { name: lineData.resource.pool.name, max: lineData.resource.pool.startValue }
      : { name: '', max: 0 },
    integrity: {
      name:  lineData.integrity.name,
      value: lineData.integrity.startValue,
    },
    supernatural_trait: lineData.resource.trait
      ? { name: lineData.resource.trait.name, value: lineData.resource.trait.startValue }
      : { name: '', value: 0 },
  }
}
