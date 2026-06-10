import { useState } from 'react'

const STORAGE_KEY = 'wod-draft'

const DEFAULT = {
  meta: { line: '', name: '', concept: '', virtue: '', vice: '', chronicle: '', player: '' },
  template: {},
  attributes: {
    mental:   { intelligence: 1, wits: 1, resolve: 1 },
    physical: { strength: 1, dexterity: 1, stamina: 1 },
    social:   { presence: 1, manipulation: 1, composure: 1 },
  },
  attributePriority: { mental: 'primary', physical: 'secondary', social: 'tertiary' },
  skills: {
    mental:   { academics: 0, computer: 0, crafts: 0, investigation: 0, medicine: 0, occult: 0, politics: 0, science: 0 },
    physical: { athletics: 0, brawl: 0, drive: 0, firearms: 0, larceny: 0, stealth: 0, survival: 0, weaponry: 0 },
    social:   { animal_ken: 0, empathy: 0, expression: 0, intimidation: 0, persuasion: 0, socialize: 0, streetwise: 0, subterfuge: 0 },
  },
  skillPriority: { mental: 'primary', physical: 'secondary', social: 'tertiary' },
  specialties: [],
  powers: {},
  renown: {},
  merits: [],
  derived: {
    health: 0, willpower: 0, speed: 0, defense: 0, initiative: 0,
    resource_pool: { name: '', max: 0 },
    integrity: { name: '', value: 7 },
    supernatural_trait: { name: '', value: 1 },
  },
  notes: '',
}

const save = (next) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export default function useCharacter() {
  const [character, setCharacter] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return structuredClone(DEFAULT)
      return { ...structuredClone(DEFAULT), ...JSON.parse(saved) }
    } catch { return structuredClone(DEFAULT) }
  })

  const updateMeta = (field, value) =>
    setCharacter(c => save({ ...c, meta: { ...c.meta, [field]: value } }))

  const updateAttribute = (cat, attr, value) =>
    setCharacter(c => save({ ...c, attributes: { ...c.attributes, [cat]: { ...c.attributes[cat], [attr]: value } } }))

  const updateSkill = (cat, skill, value) =>
    setCharacter(c => save({ ...c, skills: { ...c.skills, [cat]: { ...c.skills[cat], [skill]: value } } }))

  const addSpecialty = (spec) =>
    setCharacter(c => save({ ...c, specialties: [...c.specialties, spec] }))

  const removeSpecialty = (i) =>
    setCharacter(c => save({ ...c, specialties: c.specialties.filter((_, idx) => idx !== i) }))

  const updateTemplate = (field, value) =>
    setCharacter(c => save({ ...c, template: { ...c.template, [field]: value } }))

  const setPowers = (powers) =>
    setCharacter(c => save({ ...c, powers }))

  const setRenown = (renown) =>
    setCharacter(c => save({ ...c, renown }))

  const importCharacter = (data) => {
    const merged = { ...structuredClone(DEFAULT), ...data }
    setCharacter(save(merged))
  }

  const addMerit = (merit) =>
    setCharacter(c => save({ ...c, merits: [...c.merits, merit] }))

  const removeMerit = (i) =>
    setCharacter(c => save({ ...c, merits: c.merits.filter((_, idx) => idx !== i) }))

  const setAttributePriority = (priority) =>
    setCharacter(c => save({ ...c, attributePriority: priority }))

  const setSkillPriority = (priority) =>
    setCharacter(c => save({ ...c, skillPriority: priority }))

  const setDerived = (derived) =>
    setCharacter(c => save({ ...c, derived }))

  const updateNotes = (notes) =>
    setCharacter(c => save({ ...c, notes }))

  const resetCharacter = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCharacter(structuredClone(DEFAULT))
  }

  return {
    character,
    updateMeta, updateAttribute, updateSkill,
    setAttributePriority, setSkillPriority,
    addSpecialty, removeSpecialty,
    updateTemplate, setPowers, setRenown,
    addMerit, removeMerit,
    setDerived, updateNotes, resetCharacter, importCharacter,
  }
}
