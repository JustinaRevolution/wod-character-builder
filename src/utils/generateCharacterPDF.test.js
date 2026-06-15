import { describe, it, expect } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { generateCharacterPDF } from './generateCharacterPDF'
import vampire from '../data/lines/vampire.json'
import werewolf from '../data/lines/werewolf.json'

const baseCharacter = {
  meta: { line: 'vampire', name: 'Selene', concept: 'Spy', virtue: 'Prudence', vice: 'Envy', chronicle: 'Blood City', player: 'Justina' },
  template: { clan: 'mekhet', covenant: 'invictus' },
  attributes: {
    mental:   { intelligence: 3, wits: 3, resolve: 2 },
    physical: { strength: 2, dexterity: 3, stamina: 2 },
    social:   { presence: 2, manipulation: 3, composure: 2 },
  },
  skills: {
    mental:   { academics:2, computer:0, crafts:0, investigation:3, medicine:0, occult:2, politics:1, science:0 },
    physical: { athletics:1, brawl:0, drive:1, firearms:0, larceny:2, stealth:3, survival:0, weaponry:1 },
    social:   { animal_ken:0, empathy:2, expression:0, intimidation:0, persuasion:2, socialize:1, streetwise:1, subterfuge:3 },
  },
  specialties: [{ skill: 'Occult', name: 'Kindred' }],
  powers: { auspex: 2, celerity: 1 },
  merits: [{ name: 'Status (Invictus)', dots: 2 }],
  derived: {
    health: 7, willpower: 4, speed: 10, defense: 3, initiative: 5,
    resource_pool: { name: 'Vitae', max: 10 },
    integrity: { name: 'Humanity', value: 7 },
    supernatural_trait: { name: 'Blood Potency', value: 1 },
  },
  notes: 'An ancient spy.',
}

describe('generateCharacterPDF', () => {
  it('returns a Uint8Array starting with %PDF', async () => {
    const bytes = await generateCharacterPDF(baseCharacter, vampire)
    expect(bytes).toBeInstanceOf(Uint8Array)
    const header = String.fromCharCode(...bytes.slice(0, 4))
    expect(header).toBe('%PDF')
  })

  it('generated PDF has a form with text fields', async () => {
    const bytes = await generateCharacterPDF(baseCharacter, vampire)
    const doc = await PDFDocument.load(bytes)
    const form = doc.getForm()
    const fields = form.getFields()
    expect(fields.length).toBeGreaterThan(10)
  })

  it('name field is pre-filled with character name', async () => {
    const bytes = await generateCharacterPDF(baseCharacter, vampire)
    const doc = await PDFDocument.load(bytes)
    const form = doc.getForm()
    const nameField = form.getTextField('meta.name')
    expect(nameField.getText()).toBe('Selene')
  })

  it('intelligence checkboxes are pre-checked to value 3', async () => {
    const bytes = await generateCharacterPDF(baseCharacter, vampire)
    const doc = await PDFDocument.load(bytes)
    const form = doc.getForm()
    expect(form.getCheckBox('attr.mental.intelligence.1').isChecked()).toBe(true)
    expect(form.getCheckBox('attr.mental.intelligence.3').isChecked()).toBe(true)
    expect(form.getCheckBox('attr.mental.intelligence.4').isChecked()).toBe(false)
  })

  it('werewolf character includes renown checkboxes', async () => {
    const wolfChar = {
      ...baseCharacter,
      meta: { ...baseCharacter.meta, line: 'werewolf' },
      template: { tribe: 'blood_talons', auspice: 'rahu' },
      powers: { purity: 2, glory: 1, honor: 0, wisdom: 0, cunning: 0 },
      renown: { purity: 2, glory: 1, honor: 0, wisdom: 0, cunning: 0 },
      derived: {
        ...baseCharacter.derived,
        resource_pool: { name: 'Essence', max: 10 },
        integrity: { name: 'Harmony', value: 7 },
        supernatural_trait: { name: 'Primal Urge', value: 1 },
      },
    }
    const bytes = await generateCharacterPDF(wolfChar, werewolf)
    const doc = await PDFDocument.load(bytes)
    const form = doc.getForm()
    expect(form.getCheckBox('renown.purity.1')).toBeTruthy()
  })
})
