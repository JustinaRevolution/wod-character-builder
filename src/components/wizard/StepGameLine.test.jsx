import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepGameLine from './StepGameLine'

describe('StepGameLine', () => {
  it('renders a card for each game line', () => {
    render(<StepGameLine selectedLine="" onSelect={() => {}} />)
    expect(screen.getByText('Vampire: the Requiem')).toBeInTheDocument()
    expect(screen.getByText('Werewolf: the Forsaken')).toBeInTheDocument()
    expect(screen.getByText('Second Sight')).toBeInTheDocument()
    expect(screen.getByText('World of Darkness')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(10)
  })

  it('marks the selected line as active', () => {
    render(<StepGameLine selectedLine="vampire" onSelect={() => {}} />)
    const vampireBtn = screen.getByText('Vampire: the Requiem').closest('button')
    expect(vampireBtn).toHaveClass('bg-gray-800')
  })

  it('calls onSelect with line id when a card is clicked', () => {
    const onSelect = vi.fn()
    render(<StepGameLine selectedLine="" onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Mage: the Awakening').closest('button'))
    expect(onSelect).toHaveBeenCalledWith('mage')
  })
})
