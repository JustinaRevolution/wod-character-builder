import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CharacterSheet from './CharacterSheet'
import vampire from '../../data/lines/vampire.json'
import SPELLS from '../../data/spells.json'
import mage from '../../data/lines/mage.json'

const character = {
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
  derived: { health: 7, willpower: 4, speed: 10, defense: 3, initiative: 5, resource_pool: { name: 'Vitae', max: 10 }, integrity: { name: 'Humanity', value: 7 }, supernatural_trait: { name: 'Blood Potency', value: 1 } },
  notes: 'An ancient spy.',
}

describe('CharacterSheet', () => {
  it('renders character name', () => {
    render(<CharacterSheet character={character} lineData={vampire} />)
    expect(screen.getByText('Selene')).toBeInTheDocument()
  })

  it('renders game line title', () => {
    render(<CharacterSheet character={character} lineData={vampire} />)
    expect(screen.getByText('VAMPIRE: THE REQUIEM')).toBeInTheDocument()
  })

  it('renders a derived stat', () => {
    render(<CharacterSheet character={character} lineData={vampire} />)
    expect(screen.getByText('Health')).toBeInTheDocument()
  })

  it('does not render _rotes as a raw powers entry', () => {
    const death1 = SPELLS.death.spells.find(s => s.level === 1)
    const mageChar = { ...character, powers: { death: 3, matter: 2, fate: 1, _rotes: [death1.id] } }
    render(<CharacterSheet character={mageChar} lineData={mage} />)
    expect(screen.queryByText('_rotes')).toBeNull()
  })

  it('lists chosen rotes by name on the sheet', () => {
    const death1 = SPELLS.death.spells.find(s => s.level === 1)
    const mageChar = { ...character, powers: { death: 3, matter: 2, fate: 1, _rotes: [death1.id] } }
    render(<CharacterSheet character={mageChar} lineData={mage} />)
    expect(screen.getByText(new RegExp(death1.name))).toBeInTheDocument()
  })
})
