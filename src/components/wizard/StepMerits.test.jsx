import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepMerits from './StepMerits'

describe('StepMerits', () => {
  it('shows the 7-dot budget', () => {
    render(<StepMerits merits={[]} onAdd={() => {}} onRemove={() => {}} />)
    expect(screen.getByText(/7 dots/i)).toBeInTheDocument()
  })

  it('calls onAdd with name and dots when Add is clicked', () => {
    const onAdd = vi.fn()
    render(<StepMerits merits={[]} onAdd={onAdd} onRemove={() => {}} />)
    fireEvent.change(screen.getByPlaceholderText('Merit name'), { target: { value: 'Resources' } })
    const dots = screen.getAllByRole('button')
    fireEvent.click(dots[2]) // select 3 dots
    fireEvent.click(screen.getByText('Add'))
    expect(onAdd).toHaveBeenCalledWith({ name: 'Resources', dots: 3 })
  })

  it('calls onRemove when remove button clicked', () => {
    const onRemove = vi.fn()
    render(<StepMerits merits={[{ name: 'Resources', dots: 3 }]} onAdd={() => {}} onRemove={onRemove} />)
    fireEvent.click(screen.getByText('✕'))
    expect(onRemove).toHaveBeenCalledWith(0)
  })

  it('clears the name input after adding', () => {
    render(<StepMerits merits={[]} onAdd={() => {}} onRemove={() => {}} />)
    fireEvent.change(screen.getByPlaceholderText('Merit name'), { target: { value: 'Contacts' } })
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByPlaceholderText('Merit name').value).toBe('')
  })

  it('shows remaining dots and negative when over budget', () => {
    const overBudget = [{ name: 'A', dots: 5 }, { name: 'B', dots: 3 }]
    render(<StepMerits merits={overBudget} onAdd={() => {}} onRemove={() => {}} />)
    expect(screen.getByText(/-1 of 7 dots remaining/i)).toBeInTheDocument()
  })
})
