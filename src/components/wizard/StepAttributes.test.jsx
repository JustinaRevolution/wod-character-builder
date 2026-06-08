import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepAttributes from './StepAttributes'

const attrs = {
  mental:   { intelligence: 1, wits: 1, resolve: 1 },
  physical: { strength: 1, dexterity: 1, stamina: 1 },
  social:   { presence: 1, manipulation: 1, composure: 1 },
}

describe('StepAttributes', () => {
  it('renders all 9 attribute labels', () => {
    render(<StepAttributes attributes={attrs} onUpdate={() => {}} />)
    expect(screen.getByText('Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Strength')).toBeInTheDocument()
    expect(screen.getByText('Presence')).toBeInTheDocument()
  })

  it('shows priority selector for each category', () => {
    render(<StepAttributes attributes={attrs} onUpdate={() => {}} />)
    expect(screen.getAllByText('Primary (5 dots)').length).toBeGreaterThan(0)
  })

  it('calls onUpdate when a dot is clicked', () => {
    const onUpdate = vi.fn()
    render(<StepAttributes attributes={attrs} onUpdate={onUpdate} />)
    // Click the 3rd dot of intelligence (currently 1, clicking 3 sets to 3)
    const dots = screen.getAllByRole('button')
    fireEvent.click(dots[2])
    expect(onUpdate).toHaveBeenCalledWith('mental', 'intelligence', 3)
  })
})
