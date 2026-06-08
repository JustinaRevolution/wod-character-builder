import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepConcept from './StepConcept'

const meta = { name: '', concept: '', virtue: '', vice: '', chronicle: '', player: '' }

describe('StepConcept', () => {
  it('renders all 6 meta fields', () => {
    render(<StepConcept meta={meta} onChange={() => {}} />)
    expect(screen.getByLabelText('Character Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Concept')).toBeInTheDocument()
    expect(screen.getByLabelText('Virtue')).toBeInTheDocument()
    expect(screen.getByLabelText('Vice')).toBeInTheDocument()
    expect(screen.getByLabelText('Chronicle')).toBeInTheDocument()
    expect(screen.getByLabelText('Player')).toBeInTheDocument()
  })

  it('calls onChange with field and value on input', () => {
    const onChange = vi.fn()
    render(<StepConcept meta={meta} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Character Name'), { target: { value: 'Selene' } })
    expect(onChange).toHaveBeenCalledWith('name', 'Selene')
  })
})
