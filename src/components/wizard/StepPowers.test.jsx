import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepPowers from './StepPowers'
import vampire from '../../data/lines/vampire.json'
import werewolf from '../../data/lines/werewolf.json'

describe('StepPowers — pool type (Vampire)', () => {
  it('renders all discipline names', () => {
    render(<StepPowers lineData={vampire} template={{}} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText('Animalism')).toBeInTheDocument()
    expect(screen.getByText('Dominate')).toBeInTheDocument()
  })

  it('shows dots remaining counter', () => {
    render(<StepPowers lineData={vampire} template={{}} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText(/3 dots remaining/i)).toBeInTheDocument()
  })

  it('calls onSetPowers when a dot is changed', () => {
    const onSetPowers = vi.fn()
    render(<StepPowers lineData={vampire} template={{}} powers={{animalism: 1}} onSetPowers={onSetPowers} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1]) // second dot of first item
    expect(onSetPowers).toHaveBeenCalled()
  })
})

describe('StepPowers — picks type (Werewolf)', () => {
  it('renders text inputs for gift names', () => {
    render(<StepPowers lineData={werewolf} template={{auspice:'rahu',tribe:'blood_talons'}} powers={{}} onSetPowers={() => {}} />)
    expect(screen.getByText(/Auspice Gifts/i)).toBeInTheDocument()
    expect(screen.getByText(/Tribe Gifts/i)).toBeInTheDocument()
  })
})
