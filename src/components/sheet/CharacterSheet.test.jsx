import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CharacterSheet from './CharacterSheet'
import vampire from '../../data/lines/vampire.json'
import SPELLS from '../../data/spells.json'
import mage from '../../data/lines/mage.json'
import AFFINITIES from '../../data/affinities.json'
import UTTERANCES from '../../data/utterances.json'
import mummy from '../../data/lines/mummy.json'
import promethean from '../../data/lines/promethean.json'
import mortal from '../../data/lines/mortal.json'
import werewolf from '../../data/lines/werewolf.json'

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

const mortalCharacter = {
  meta: { line: 'mortal', name: 'Jo', concept: 'Drifter', virtue: 'Hope', vice: 'Sloth', chronicle: 'City Streets', player: 'Justina' },
  template: {},
  attributes: {
    mental:   { intelligence: 2, wits: 2, resolve: 2 },
    physical: { strength: 2, dexterity: 2, stamina: 2 },
    social:   { presence: 2, manipulation: 2, composure: 2 },
  },
  skills: {
    mental:   { academics:0, computer:0, crafts:0, investigation:0, medicine:0, occult:0, politics:0, science:0 },
    physical: { athletics:0, brawl:0, drive:0, firearms:0, larceny:0, stealth:0, survival:0, weaponry:0 },
    social:   { animal_ken:0, empathy:0, expression:0, intimidation:0, persuasion:0, socialize:0, streetwise:0, subterfuge:0 },
  },
  specialties: [],
  powers: {},
  merits: [],
  derived: { health: 7, willpower: 4, speed: 9, defense: 2, initiative: 4, resource_pool: { name: '', max: 0 }, integrity: { name: 'Morality', value: 7 }, supernatural_trait: { name: '', value: 0 } },
  notes: '',
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
    expect(screen.getByText('HEALTH')).toBeInTheDocument()
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

  it('renders a skill from each category', () => {
    render(<CharacterSheet character={character} lineData={vampire} />)
    expect(screen.getByText('Academics')).toBeInTheDocument()
    expect(screen.getByText('Athletics')).toBeInTheDocument()
    expect(screen.getByText('Animal Ken')).toBeInTheDocument()
  })

  it('renders MERITS section header', () => {
    render(<CharacterSheet character={character} lineData={vampire} />)
    expect(screen.getByText('MERITS')).toBeInTheDocument()
  })
})

describe('CharacterSheet — Mummy Affinities + Utterances display', () => {
  const guildAffinityId = mummy.template.group2.options.find(o => o.id === 'maa_kep')?.guildAffinity
  const guildAffinity = AFFINITIES.find(a => a.id === guildAffinityId)
  const utterance = UTTERANCES[0]
  const soulAffinityEntry = AFFINITIES.find(a => a.type === 'soul' && a.pillar === 'ab')
  const miscAffinityEntry = AFFINITIES.find(a => a.type === 'misc' && !a.pillar)

  const mummyCharacter = {
    meta: { name: 'Test', concept: '', virtue: '', vice: '', player: '', chronicle: '', line: 'mummy' },
    template: { decree: 'heart', guild: 'maa_kep' },
    attributes: {
      mental: { intelligence:1,wits:1,resolve:1 },
      physical: { strength:1,dexterity:1,stamina:1 },
      social: { presence:1,manipulation:1,composure:1 }
    },
    skills: {
      mental: { academics:0,computer:0,crafts:0,investigation:0,medicine:0,occult:0,politics:0,science:0 },
      physical: { athletics:0,brawl:0,drive:0,firearms:0,larceny:0,stealth:0,survival:0,weaponry:0 },
      social: { animal_ken:0,empathy:0,expression:0,intimidation:0,persuasion:0,socialize:0,streetwise:0,subterfuge:0 }
    },
    specialties: [],
    powers: {
      ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1,
      _soul_affinity: soulAffinityEntry?.id,
      _guild_affinity: guildAffinityId,
      _free_affinity: miscAffinityEntry?.id,
      _utterances: [utterance?.id],
    },
    merits: [],
    derived: {
      health: 6, willpower: 3, speed: 5, defense: 1, initiative: 2,
      resource_pool: { name: 'Sekhem', max: 10 },
      integrity: { name: 'Memory', value: 3 },
      supernatural_trait: { name: '', value: 0 }
    },
    renown: {},
    notes: '',
  }

  it('does not render underscore meta-keys as raw data', () => {
    render(<CharacterSheet character={mummyCharacter} lineData={mummy} />)
    expect(screen.queryByText(/_soul_affinity/)).toBeNull()
    expect(screen.queryByText(/_utterances/)).toBeNull()
    expect(screen.queryByText(/_guild_affinity/)).toBeNull()
    expect(screen.queryByText(/_free_affinity/)).toBeNull()
  })

  it('renders Affinity and Utterance names', () => {
    render(<CharacterSheet character={mummyCharacter} lineData={mummy} />)
    expect(guildAffinity).toBeDefined()
    expect(utterance).toBeDefined()
    expect(screen.getByText(guildAffinity.name, { exact: false })).toBeInTheDocument()
    expect(screen.getByText(utterance.name, { exact: false })).toBeInTheDocument()
  })
})

describe('CharacterSheet — Promethean power names', () => {
  const corporeum = promethean.powers.items.find(i => i.id === 'corporeum')
  const lvl1Name = corporeum.powers[0].name

  const baseCharacter = {
    meta: { name: 'Test', concept: '', virtue: '', vice: '', player: '', chronicle: '' },
    template: { lineage: 'wretched', refinement: 'aurum' },
    attributes: {
      mental: { intelligence:1,wits:1,resolve:1 },
      physical: { strength:1,dexterity:1,stamina:1 },
      social: { presence:1,manipulation:1,composure:1 }
    },
    skills: {
      mental: { academics:0,computer:0,crafts:0,investigation:0,medicine:0,occult:0,politics:0,science:0 },
      physical: { athletics:0,brawl:0,drive:0,firearms:0,larceny:0,stealth:0,survival:0,weaponry:0 },
      social: { animal_ken:0,empathy:0,expression:0,intimidation:0,persuasion:0,socialize:0,streetwise:0,subterfuge:0 }
    },
    specialties: [],
    powers: { corporeum: 1 },
    renown: {},
    merits: [],
    derived: {
      health: 5, willpower: 3, speed: 5, defense: 1, initiative: 2,
      resource_pool: { name: 'Pyros', max: 10 },
      integrity: { name: 'Humanity', value: 5 },
      supernatural_trait: { name: '', value: 0 }
    },
    notes: ''
  }

  it('shows active power name on character sheet', () => {
    render(<CharacterSheet character={baseCharacter} lineData={promethean} />)
    expect(screen.getByText(lvl1Name)).toBeInTheDocument()
  })
})

describe('CharacterSheet — redesigned layout', () => {
  it('renders unskilled penalty note for mental skills', () => {
    render(<CharacterSheet character={character} lineData={vampire} />)
    expect(screen.getByText('-3 unskilled')).toBeInTheDocument()
  })

  it('renders unskilled penalty notes for physical and social skills', () => {
    render(<CharacterSheet character={character} lineData={vampire} />)
    const penaltyNodes = screen.getAllByText('-1 unskilled')
    expect(penaltyNodes).toHaveLength(2)
  })

  it('renders health as filled circles matching derived.health', () => {
    render(<CharacterSheet character={character} lineData={vampire} />)
    // character has health: 7
    expect(screen.getByText('●●●●●●●')).toBeInTheDocument()
  })

  it('renders integrity track label using line-specific name', () => {
    render(<CharacterSheet character={character} lineData={vampire} />)
    expect(screen.getByText('HUMANITY')).toBeInTheDocument()
  })

  it('does not render a powers block for a mortal character', () => {
    render(<CharacterSheet character={mortalCharacter} lineData={mortal} />)
    expect(screen.queryByText('SUPERNATURAL POWERS')).toBeNull()
  })

  it('renders powers block for a vampire character', () => {
    render(<CharacterSheet character={character} lineData={vampire} />)
    expect(screen.getByText('DISCIPLINES')).toBeInTheDocument()
  })

  it('renders resource pool as circles track for supernatural characters', () => {
    render(<CharacterSheet character={character} lineData={vampire} />)
    // vampire has resource_pool: { name: 'Vitae', max: 10 }
    expect(screen.getByText('VITAE')).toBeInTheDocument()
  })

  it('renders renown tracks for a werewolf character', () => {
    const werewolfCharacter = {
      meta: { line: 'werewolf', name: 'Kira', concept: 'Hunter', virtue: 'Justice', vice: 'Wrath', chronicle: 'City', player: 'Justina' },
      template: { tribe: 'blood_talons', auspice: 'rahu' },
      attributes: {
        mental:   { intelligence: 2, wits: 2, resolve: 2 },
        physical: { strength: 3, dexterity: 2, stamina: 3 },
        social:   { presence: 2, manipulation: 1, composure: 2 },
      },
      skills: {
        mental:   { academics:0, computer:0, crafts:0, investigation:1, medicine:0, occult:1, politics:0, science:0 },
        physical: { athletics:2, brawl:3, drive:0, firearms:1, larceny:0, stealth:1, survival:2, weaponry:2 },
        social:   { animal_ken:1, empathy:0, expression:0, intimidation:2, persuasion:0, socialize:0, streetwise:1, subterfuge:0 },
      },
      specialties: [],
      powers: { crescent_moon: 2, full_moon: 1 },
      renown: { Cunning: 0, Glory: 1, Honor: 0, Purity: 1, Wisdom: 0 },
      merits: [],
      derived: { health: 8, willpower: 4, speed: 10, defense: 2, initiative: 4, resource_pool: { name: 'Essence', max: 10 }, integrity: { name: 'Harmony', value: 7 }, supernatural_trait: { name: 'Primal Urge', value: 1 } },
      notes: '',
    }
    render(<CharacterSheet character={werewolfCharacter} lineData={werewolf} />)
    expect(screen.getByText('RENOWN')).toBeInTheDocument()
  })
})
