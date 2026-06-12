import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepReview from './StepReview'
import vampire from '../../data/lines/vampire.json'
import SPELLS from '../../data/spells.json'
import mage from '../../data/lines/mage.json'
import AFFINITIES from '../../data/affinities.json'
import UTTERANCES from '../../data/utterances.json'
import mummy from '../../data/lines/mummy.json'

const character = {
  meta: { line: 'vampire', name: 'Selene', concept: 'Spy', virtue: 'Prudence', vice: 'Envy', chronicle: 'Blood City', player: 'J' },
  template: { clan: 'mekhet', covenant: 'invictus' },
  attributes: { mental: { intelligence:3,wits:3,resolve:2 }, physical: { strength:2,dexterity:3,stamina:2 }, social: { presence:2,manipulation:3,composure:2 } },
  skills: { mental:{academics:2,computer:0,crafts:0,investigation:3,medicine:0,occult:2,politics:1,science:0}, physical:{athletics:1,brawl:0,drive:0,firearms:0,larceny:2,stealth:3,survival:0,weaponry:0}, social:{animal_ken:0,empathy:2,expression:0,intimidation:0,persuasion:2,socialize:0,streetwise:0,subterfuge:3} },
  specialties: [],
  powers: { auspex: 2 },
  merits: [{ name: 'Resources', dots: 2 }],
  derived: { health:7,willpower:4,speed:10,defense:3,initiative:5, resource_pool:{name:'Vitae',max:10}, integrity:{name:'Humanity',value:7}, supernatural_trait:{name:'Blood Potency',value:1} },
  notes: '',
}

describe('StepReview', () => {
  it('renders character name in the summary', () => {
    render(<StepReview character={character} lineData={vampire} onUpdateNotes={() => {}} />)
    expect(screen.getByText('Selene')).toBeInTheDocument()
  })

  it('renders a Print Character Sheet button', () => {
    render(<StepReview character={character} lineData={vampire} onUpdateNotes={() => {}} />)
    expect(screen.getByText('Print Character Sheet')).toBeInTheDocument()
  })

  it('calls window.print when Print button clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<StepReview character={character} lineData={vampire} onUpdateNotes={() => {}} />)
    fireEvent.click(screen.getByText('Print Character Sheet'))
    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })

  it('calls onUpdateNotes when notes textarea changes', () => {
    const onUpdateNotes = vi.fn()
    render(<StepReview character={character} lineData={vampire} onUpdateNotes={onUpdateNotes} />)
    fireEvent.change(screen.getByPlaceholderText(/background/i), { target: { value: 'A spy.' } })
    expect(onUpdateNotes).toHaveBeenCalledWith('A spy.')
  })

  it('does not render _rotes as a raw powers entry', () => {
    const death1 = SPELLS.death.spells.find(s => s.level === 1)
    const mageChar = { ...character, powers: { death: 3, matter: 2, fate: 1, _rotes: [death1.id] } }
    render(<StepReview character={mageChar} lineData={mage} onUpdateNotes={() => {}} />)
    expect(screen.queryByText('_rotes')).toBeNull()
  })

  it('lists chosen rotes by name in the review', () => {
    const death1 = SPELLS.death.spells.find(s => s.level === 1)
    const mageChar = { ...character, powers: { death: 3, matter: 2, fate: 1, _rotes: [death1.id] } }
    render(<StepReview character={mageChar} lineData={mage} onUpdateNotes={() => {}} />)
    expect(screen.getByText(new RegExp(death1.name))).toBeInTheDocument()
  })
})

describe('StepReview — Mummy Affinities + Utterances display', () => {
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
    notes: '',
  }

  it('does not render underscore meta-keys as raw data', () => {
    render(<StepReview character={mummyCharacter} lineData={mummy} onUpdateNotes={() => {}} />)
    expect(screen.queryByText(/_soul_affinity/)).toBeNull()
    expect(screen.queryByText(/_utterances/)).toBeNull()
    expect(screen.queryByText(/_guild_affinity/)).toBeNull()
    expect(screen.queryByText(/_free_affinity/)).toBeNull()
  })

  it('renders Affinity names and Utterance name', () => {
    render(<StepReview character={mummyCharacter} lineData={mummy} onUpdateNotes={() => {}} />)
    expect(guildAffinity).toBeDefined()
    expect(utterance).toBeDefined()
    expect(screen.getByText(guildAffinity.name, { exact: false })).toBeInTheDocument()
    expect(screen.getByText(utterance.name, { exact: false })).toBeInTheDocument()
  })
})
