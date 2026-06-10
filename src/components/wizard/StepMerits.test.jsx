import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepMerits from './StepMerits'

describe('StepMerits', () => {
  it('shows the 7-dot budget', () => {
    render(<StepMerits merits={[]} onAdd={() => {}} onRemove={() => {}} />)
    expect(screen.getByText(/7 dots/i)).toBeInTheDocument()
  })

  it('calls onAdd via custom form with 1 dot by default', () => {
    const onAdd = vi.fn()
    render(<StepMerits merits={[]} onAdd={onAdd} onRemove={() => {}} />)
    fireEvent.change(screen.getByPlaceholderText('Merit name'), { target: { value: 'Resources' } })
    fireEvent.click(screen.getByText('Add'))
    expect(onAdd).toHaveBeenCalledWith({ name: 'Resources', dots: 1 })
  })

  it('calls onRemove when remove button clicked', () => {
    const onRemove = vi.fn()
    render(<StepMerits merits={[{ name: 'Resources', dots: 3 }]} onAdd={() => {}} onRemove={onRemove} />)
    fireEvent.click(screen.getByText('✕'))
    expect(onRemove).toHaveBeenCalledWith(0)
  })

  it('clears the name input after adding via custom form', () => {
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

  it('adds a fixed-cost catalog merit when its row is clicked', () => {
    const onAdd = vi.fn()
    render(<StepMerits merits={[]} onAdd={onAdd} onRemove={() => {}} />)
    fireEvent.click(screen.getByText('Danger Sense').closest('button'))
    expect(onAdd).toHaveBeenCalledWith({ name: 'Danger Sense', dots: 2 })
  })

  it('shows dot picker for variable-cost merit and adds at min dots by default', () => {
    const onAdd = vi.fn()
    render(<StepMerits merits={[]} onAdd={onAdd} onRemove={() => {}} />)
    // Fleet of Foot is 1–3 dots (variable)
    fireEvent.click(screen.getByText('Fleet of Foot').closest('button'))
    // Two "Add" buttons now: pending row + custom form. Pending row appears first in DOM.
    const addBtns = screen.getAllByText('Add')
    expect(addBtns.length).toBe(2)
    fireEvent.click(addBtns[0])
    expect(onAdd).toHaveBeenCalledWith({ name: 'Fleet of Foot', dots: 1 })
  })

  it('filters catalog to show only mental merits when Mental tab clicked', () => {
    render(<StepMerits merits={[]} onAdd={() => {}} onRemove={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'mental' }))
    expect(screen.getByText('Danger Sense')).toBeInTheDocument()
    expect(screen.queryByText('Fleet of Foot')).not.toBeInTheDocument()
  })

  it('filters by search text', () => {
    render(<StepMerits merits={[]} onAdd={() => {}} onRemove={() => {}} />)
    fireEvent.change(screen.getByPlaceholderText('Search merits...'), { target: { value: 'Initiative' } })
    expect(screen.getByText('Fast Reflexes')).toBeInTheDocument()
    // Danger Sense doesn't mention Initiative
    expect(screen.queryByText('Danger Sense')).not.toBeInTheDocument()
  })
})
