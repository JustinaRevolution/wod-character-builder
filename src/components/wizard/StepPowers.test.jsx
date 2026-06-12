import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepPowers from './StepPowers'
import vampire  from '../../data/lines/vampire.json'
import werewolf from '../../data/lines/werewolf.json'
import geist    from '../../data/lines/geist.json'
import mage     from '../../data/lines/mage.json'
import hunter   from '../../data/lines/hunter.json'
import SPELLS from '../../data/spells.json'
import AFFINITIES from '../../data/affinities.json'
import UTTERANCES from '../../data/utterances.json'
import mummy from '../../data/lines/mummy.json'

describe('StepPowers — pool type (Vampire)', () => {
  it('renders all discipline names', () => {
    render(<StepPowers lineData={vampire} template={{}} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('Animalism')).toBeInTheDocument()
    expect(screen.getByText('Dominate')).toBeInTheDocument()
    expect(screen.getByText('Vigor')).toBeInTheDocument()
  })

  it('shows dots remaining counter', () => {
    render(<StepPowers lineData={vampire} template={{}} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText(/3 dots remaining/i)).toBeInTheDocument()
  })

  it('calls onSetPowers with updated powers when a dot is changed', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={vampire} template={{}} powers={{animalism: 1}} onSetPowers={onSetPowers} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1]) // second dot of first item (animalism) → sets to 2
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ animalism: 2 }))
  })

  it('does not call onSetPowers when budget is exhausted', () => {
    const onSetPowers = vi.fn()
    // All 3 starting dots already spent
    render(<StepPowers lineData={vampire} template={{}} powers={{animalism: 3}} onSetPowers={onSetPowers} />)
    // Find the 4th dot button of animalism (index 3 = 4th button overall)
    // animalism has 5 dots: indices 0-4; dot 4 would be index 3 (0-based, adding 1 more = 4th dot)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[3]) // clicking 4th dot when 3 already spent and budget=3
    expect(onSetPowers).not.toHaveBeenCalled()
  })

  it('shows Clan badge for affinity disciplines when clan is selected', () => {
    render(<StepPowers lineData={vampire} template={{ clan: 'gangrel' }} powers={{}} onSetPowers={() => {}} />)
    // Gangrel has Animalism, Protean, Resilience as clan disciplines
    const badges = screen.getAllByText('Clan')
    expect(badges.length).toBeGreaterThan(0)
  })
})

describe('StepPowers — gifts type (Werewolf)', () => {
  const baseRenown = { Cunning: 0, Glory: 0, Honor: 0, Purity: 1, Wisdom: 0 }

  it('renders Auspice Gifts section heading', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu', tribe: 'blood_talons' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.getByText('Auspice Gifts')).toBeInTheDocument()
  })

  it('renders Tribe Gifts section for non-Ghost-Wolves', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu', tribe: 'blood_talons' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.getByText('Tribe Gifts')).toBeInTheDocument()
  })

  it('hides Tribe Gifts section for Ghost Wolves', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu', tribe: 'ghost_wolves' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.queryByText('Tribe Gifts')).toBeNull()
  })

  it('shows gift list tabs for the selected auspice (Rahu = Dominance, Full Moon, Strength)', () => {
    // Use bone_shadows tribe (death, insight, warding) to avoid overlap with rahu tabs
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu', tribe: 'bone_shadows' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.getByRole('button', { name: 'Dominance' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Full Moon' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Strength' })).toBeInTheDocument()
  })

  it('shows "0 of 3" counter for each section initially', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu', tribe: 'blood_talons' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.getAllByText('0 of 3')).toHaveLength(2)
  })

  it('calls onSetPowers with auspice_gifts when a level-1 gift is clicked', () => {
    const onSetPowers = vi.fn()
    // Ithaeur: Crescent Moon is the first tab; first gift = Two-World Eyes (level 1)
    render(<StepPowers lineData={werewolf} template={{ auspice: 'ithaeur', tribe: 'bone_shadows' }} powers={{}} onSetPowers={onSetPowers} renown={{ Cunning: 0, Glory: 0, Honor: 0, Purity: 0, Wisdom: 1 }} onSetRenown={() => {}} />)
    fireEvent.click(screen.getByText('Two-World Eyes'))
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ auspice_gifts: ['two_world_eyes'] }))
  })

  it('deselects a gift when clicked again', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={werewolf} template={{ auspice: 'ithaeur', tribe: 'bone_shadows' }} powers={{ auspice_gifts: ['two_world_eyes'] }} onSetPowers={onSetPowers} renown={{ Cunning: 0, Glory: 0, Honor: 0, Purity: 0, Wisdom: 1 }} onSetRenown={() => {}} />)
    fireEvent.click(screen.getByText('Two-World Eyes'))
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ auspice_gifts: [] }))
  })

  it('does not add a 4th auspice gift when 3 are already selected', () => {
    const onSetPowers = vi.fn()
    // 3 already selected; Between the Weave is level 4 and unlocked (Wisdom 4); it should be disabled (maxed)
    const threeSelected = { auspice_gifts: ['two_world_eyes', 'read_spirit', 'gauntlet_cloak'] }
    render(<StepPowers lineData={werewolf} template={{ auspice: 'ithaeur', tribe: 'bone_shadows' }} powers={threeSelected} onSetPowers={onSetPowers} renown={{ Cunning: 0, Glory: 0, Honor: 0, Purity: 0, Wisdom: 4 }} onSetRenown={() => {}} />)
    fireEvent.click(screen.getByText('Between the Weave'))
    expect(onSetPowers).not.toHaveBeenCalled()
  })

  it('does not activate gifts above the Renown cap', () => {
    const onSetPowers = vi.fn()
    // Read Spirit is level 2; with Wisdom 1 (maxLevel=1), it is locked
    render(<StepPowers lineData={werewolf} template={{ auspice: 'ithaeur', tribe: 'bone_shadows' }} powers={{}} onSetPowers={onSetPowers} renown={{ Cunning: 0, Glory: 0, Honor: 0, Purity: 0, Wisdom: 1 }} onSetRenown={() => {}} />)
    fireEvent.click(screen.getByText('Read Spirit'))
    expect(onSetPowers).not.toHaveBeenCalled()
  })

  it('renders Renown section with all 5 tracks', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu', tribe: 'blood_talons' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.getByText('Renown')).toBeInTheDocument()
    expect(screen.getByText('Cunning')).toBeInTheDocument()
    expect(screen.getByText('Glory')).toBeInTheDocument()
    expect(screen.getByText('Purity')).toBeInTheDocument()
  })

  it('marks the Auspice renown track', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice: 'rahu' }} powers={{}} onSetPowers={() => {}} renown={baseRenown} onSetRenown={() => {}} />)
    expect(screen.getByText('Auspice')).toBeInTheDocument()
  })
})

describe('StepPowers — arcana type (Mage)', () => {
  // Pull real spells from the data so tests don't depend on extraction wording
  const death1 = SPELLS.death.spells.find(s => s.level === 1)
  const death3 = SPELLS.death.spells.find(s => s.level === 3)
  const death2s = SPELLS.death.spells.filter(s => s.level === 2).slice(0, 3)
  const validBuild = { death: 3, matter: 2, fate: 1 } // Moros: ruling Death + Matter

  it('renders all arcana names', () => {
    render(<StepPowers lineData={mage} template={{}} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('Death')).toBeInTheDocument()
    expect(screen.getByText('Forces')).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
  })

  it('shows Ruling badge for path arcana', () => {
    render(<StepPowers lineData={mage} template={{ path: 'acanthus' }} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getAllByText('Ruling').length).toBe(2)
  })

  it('shows 6 dots remaining initially', () => {
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('6 dots remaining')).toBeInTheDocument()
  })

  it('shows a validation error while the allocation is incomplete', () => {
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={{ death: 2 }} onSetPowers={() => {}} />)
    expect(screen.getByText('Spend exactly 6 dots (2 spent).')).toBeInTheDocument()
  })

  it('shows no validation errors for a legal build', () => {
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.queryByText(/Spend exactly 6 dots/)).toBeNull()
    expect(screen.queryByText('Both Ruling Arcana need at least 1 dot.')).toBeNull()
    expect(screen.queryByText('Rate at least 3 different Arcana.')).toBeNull()
    expect(screen.queryByText('Your Inferior Arcanum is capped at 2 dots.')).toBeNull()
  })

  it('shows rote tabs only for rated arcana', () => {
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.getByRole('button', { name: 'Matter' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Time' })).toBeNull()
  })

  it('selects a legal rote on click', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={validBuild} onSetPowers={onSetPowers} />)
    fireEvent.click(screen.getByText(death1.name))
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ _rotes: [death1.id] }))
  })

  it('deselects a selected rote on click', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={{ ...validBuild, _rotes: [death1.id] }} onSetPowers={onSetPowers} />)
    fireEvent.click(screen.getByText(death1.name))
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ _rotes: [] }))
  })

  it('does not select a rote above the arcanum rating', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={{ death: 2, matter: 2, fate: 2 }} onSetPowers={onSetPowers} />)
    fireEvent.click(screen.getByText(death3.name))
    expect(onSetPowers).not.toHaveBeenCalled()
  })

  it('does not select a rote that would exceed the 6-dot budget', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={{ ...validBuild, _rotes: death2s.map(s => s.id) }} onSetPowers={onSetPowers} />)
    fireEvent.click(screen.getByText(death1.name))
    expect(onSetPowers).not.toHaveBeenCalled()
  })

  it('flags rotes that exceed lowered arcana for removal', () => {
    render(<StepPowers lineData={mage} template={{ path: 'moros' }} powers={{ death: 1, matter: 2, fate: 3, _rotes: [death3.id] }} onSetPowers={() => {}} />)
    expect(screen.getByText(/exceed your current Arcana/i)).toBeInTheDocument()
  })
})

describe('StepPowers — Hunter (compact vs conspiracy)', () => {
  it('shows compact note for compact hunters, not the picks UI', () => {
    render(<StepPowers lineData={hunter} template={{ org_type: 'compact' }} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText(/compact hunters have no endowments/i)).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('shows picks UI for conspiracy hunters', () => {
    render(<StepPowers lineData={hunter} template={{ org_type: 'conspiracy' }} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText(/Organization Endowments/i)).toBeInTheDocument()
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
  })
})

describe('StepPowers — Geist (pool + keys)', () => {
  it('renders manifestation names and Keys section', () => {
    render(<StepPowers lineData={geist} template={{}} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('Boneyard')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Keys/i })).toBeInTheDocument()
  })

  it('calls onSetPowers with _keys when a key is toggled', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={geist} template={{}} powers={{}} onSetPowers={onSetPowers} />)
    fireEvent.click(screen.getByText('Beasts Key').closest('button'))
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ _keys: ['beasts'] }))
  })

  it('counts dots correctly when _keys is populated', () => {
    render(<StepPowers lineData={geist} template={{}} powers={{ boneyard: 2, _keys: ['beasts'] }} onSetPowers={() => {}} />)
    // startingDots=3, spent=2, remaining=1
    expect(screen.getByText(/1 dot/i)).toBeInTheDocument()
  })
})

describe('StepPowers — pillars type (Mummy)', () => {
  const validBuild = { ab: 3, ba: 2, ka: 2, ren: 1, sheut: 1 }
  const heartTemplate = { decree: 'heart', guild: 'maa_kep' }

  const soulAb = AFFINITIES.find(a => a.type === 'soul' && a.pillar === 'ab')
  const miscNoReq = AFFINITIES.find(a => a.type === 'misc' && !a.pillar)
  const utteranceWithBa1 = UTTERANCES.find(u => u.tiers.find(t => t.tier === 1 && t.pillar === 'ba' && t.level === 1))

  it('renders all 5 Pillar names', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('Ab')).toBeInTheDocument()
    expect(screen.getByText('Ba')).toBeInTheDocument()
    expect(screen.getByText('Sheut')).toBeInTheDocument()
  })

  it('shows Defining badge for the decree defining pillar', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('Defining')).toBeInTheDocument()
  })

  it('shows dot-point counter', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText(/0 of 9 dot-points spent/i)).toBeInTheDocument()
  })

  it('shows a validation error when points are not fully spent', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={{ ab: 2 }} onSetPowers={() => {}} />)
    expect(screen.getByText('Spend exactly 9 dot-points (2 spent).')).toBeInTheDocument()
  })

  it('shows no validation errors for a fully legal build', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.queryByText(/Spend exactly 9 dot-points/)).toBeNull()
    expect(screen.queryByText(/No Pillar may exceed/)).toBeNull()
    expect(screen.queryByText(/At most one Pillar/)).toBeNull()
  })

  it('shows Affinity section only after Pillars are valid', () => {
    const { rerender } = render(<StepPowers lineData={mummy} template={heartTemplate} powers={{ ab: 2 }} onSetPowers={() => {}} />)
    expect(screen.queryByText('Affinities')).toBeNull()

    rerender(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.getByText('Affinities')).toBeInTheDocument()
  })

  it('shows Soul Affinity dropdown with soul affinities for the decree pillar', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.getByText(/Soul Affinity/i)).toBeInTheDocument()
    expect(soulAb).toBeDefined()
    expect(screen.getAllByText(soulAb.name).length).toBeGreaterThan(0)
  })

  it('shows guild affinity name in the Guild Affinity slot', () => {
    const guildAffinityId = mummy.template.group2.options.find(o => o.id === 'maa_kep')?.guildAffinity
    const guildAffinity = AFFINITIES.find(a => a.id === guildAffinityId)
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(guildAffinity).toBeDefined()
    expect(screen.getByText(guildAffinity.name)).toBeInTheDocument()
  })

  it('calls onSetPowers with _free_affinity when a free affinity is picked', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={onSetPowers} />)
    expect(miscNoReq).toBeDefined()
    fireEvent.click(screen.getByText(miscNoReq.name))
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ _free_affinity: miscNoReq.id }))
  })

  it('shows Utterance section only after Pillars are valid', () => {
    const { rerender } = render(<StepPowers lineData={mummy} template={heartTemplate} powers={{ ab: 2 }} onSetPowers={() => {}} />)
    expect(screen.queryByText('Utterances')).toBeNull()

    rerender(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.getByText('Utterances')).toBeInTheDocument()
  })

  it('shows an utterance that the character qualifies for', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(utteranceWithBa1).toBeDefined()
    expect(screen.getByText(utteranceWithBa1.name)).toBeInTheDocument()
  })

  it('unlocks a second utterance slot when all 5 pillars have at least 1 dot', () => {
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={() => {}} />)
    expect(screen.getByText(/1 of 2|0 of 2/)).toBeInTheDocument()
  })

  it('keeps utterance slot at 1 when a pillar is at 0', () => {
    const buildWithZero = { ab: 3, ba: 2, ka: 2, ren: 2, sheut: 0 }
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={buildWithZero} onSetPowers={() => {}} />)
    expect(screen.getByText(/of 1/)).toBeInTheDocument()
  })

  it('calls onSetPowers with _utterances when an utterance is selected', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={mummy} template={heartTemplate} powers={validBuild} onSetPowers={onSetPowers} />)
    expect(utteranceWithBa1).toBeDefined()
    fireEvent.click(screen.getByText(utteranceWithBa1.name))
    expect(onSetPowers).toHaveBeenCalledWith(expect.objectContaining({ _utterances: [utteranceWithBa1.id] }))
  })
})
