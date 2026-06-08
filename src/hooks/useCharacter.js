import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'wod-draft'

const DEFAULT = {
  meta: { line: '', name: '', concept: '', virtue: '', vice: '', chronicle: '', player: '' },
  template: {},
  attributes: {
    mental:   { intelligence: 1, wits: 1, resolve: 1 },
    physical: { strength: 1, dexterity: 1, stamina: 1 },
    social:   { presence: 1, manipulation: 1, composure: 1 },
  },
  skills: {
    mental:   { academics: 0, computer: 0, crafts: 0, investigation: 0, medicine: 0, occult: 0, politics: 0, science: 0 },
    physical: { athletics: 0, brawl: 0, drive: 0, firearms: 0, larceny: 0, stealth: 0, survival: 0, weaponry: 0 },
    social:   { animal_ken: 0, empathy: 0, expression: 0, intimidation: 0, persuasion: 0, socialize: 0, streetwise: 0, subterfuge: 0 },
  },
  specialties: [],
  powers: {},
  merits: [],
  derived: {
    health: 0, willpower: 0, speed: 0, defense: 0, initiative: 0,
    resource_pool: { name: '', max: 0 },
    integrity: { name: '', value: 7 },
    supernatural_trait: { name: '', value: 1 },
  },
  notes: '',
}

export default function useCharacter() {
  const skipSave = useRef(false)

  const [character, setCharacter] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : structuredClone(DEFAULT)
    } catch { return structuredClone(DEFAULT) }
  })

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character))
  }, [character])

  const updateMeta = (field, value) =>
    setCharacter(c => ({ ...c, meta: { ...c.meta, [field]: value } }))

  const updateAttribute = (cat, attr, value) =>
    setCharacter(c => ({ ...c, attributes: { ...c.attributes, [cat]: { ...c.attributes[cat], [attr]: value } } }))

  const updateSkill = (cat, skill, value) =>
    setCharacter(c => ({ ...c, skills: { ...c.skills, [cat]: { ...c.skills[cat], [skill]: value } } }))

  const addSpecialty = (spec) =>
    setCharacter(c => ({ ...c, specialties: [...c.specialties, spec] }))

  const removeSpecialty = (i) =>
    setCharacter(c => ({ ...c, specialties: c.specialties.filter((_, idx) => idx !== i) }))

  const updateTemplate = (field, value) =>
    setCharacter(c => ({ ...c, template: { ...c.template, [field]: value } }))

  const setPowers = (powers) =>
    setCharacter(c => ({ ...c, powers }))

  const addMerit = (merit) =>
    setCharacter(c => ({ ...c, merits: [...c.merits, merit] }))

  const removeMerit = (i) =>
    setCharacter(c => ({ ...c, merits: c.merits.filter((_, idx) => idx !== i) }))

  const setDerived = (derived) =>
    setCharacter(c => ({ ...c, derived }))

  const updateNotes = (notes) =>
    setCharacter(c => ({ ...c, notes }))

  const resetCharacter = () => {
    skipSave.current = true
    localStorage.removeItem(STORAGE_KEY)
    setCharacter(structuredClone(DEFAULT))
  }

  return {
    character,
    updateMeta, updateAttribute, updateSkill,
    addSpecialty, removeSpecialty,
    updateTemplate, setPowers,
    addMerit, removeMerit,
    setDerived, updateNotes, resetCharacter,
  }
}
