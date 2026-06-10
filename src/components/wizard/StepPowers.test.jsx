import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepPowers from './StepPowers'
import vampire  from '../../data/lines/vampire.json'
import werewolf from '../../data/lines/werewolf.json'
import geist    from '../../data/lines/geist.json'
import mage     from '../../data/lines/mage.json'
import hunter   from '../../data/lines/hunter.json'

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

describe('StepPowers — picks type (Werewolf)', () => {
  it('renders group headings and text inputs', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice:'rahu', tribe:'blood_talons' }} powers={{}} onSetPowers={() => {}} renown={{}} onSetRenown={() => {}} />)
    expect(screen.getByText(/Auspice Gifts/i)).toBeInTheDocument()
    expect(screen.getByText(/Tribe Gifts/i)).toBeInTheDocument()
    // picksFrom has 3 auspice + 3 tribe = 6 text inputs
    expect(screen.getAllByRole('textbox')).toHaveLength(6)
  })

  it('renders Renown section with all 5 tracks', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice:'rahu', tribe:'blood_talons' }} powers={{}} onSetPowers={() => {}} renown={{}} onSetRenown={() => {}} />)
    expect(screen.getByText('Renown')).toBeInTheDocument()
    expect(screen.getByText('Cunning')).toBeInTheDocument()
    expect(screen.getByText('Glory')).toBeInTheDocument()
    expect(screen.getByText('Purity')).toBeInTheDocument()
  })

  it('marks the Auspice renown track', () => {
    render(<StepPowers lineData={werewolf} template={{ auspice:'rahu' }} powers={{}} onSetPowers={() => {}} renown={{}} onSetRenown={() => {}} />)
    // Rahu = Purity
    expect(screen.getByText('Auspice')).toBeInTheDocument()
  })
})

describe('StepPowers — pool type with caps (Mage)', () => {
  it('renders all arcana names', () => {
    render(<StepPowers lineData={mage} template={{}} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('Death')).toBeInTheDocument()
    expect(screen.getByText('Forces')).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
  })

  it('shows Ruling badge for path arcana', () => {
    render(<StepPowers lineData={mage} template={{ path: 'acanthus' }} powers={{}} onSetPowers={() => {}} />)
    // Acanthus ruling: Fate, Time
    expect(screen.getAllByText('Ruling').length).toBe(2)
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
