import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DotRating from './DotRating'

describe('DotRating', () => {
  it('renders max number of buttons', () => {
    render(<DotRating value={2} max={5} onChange={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('marks filled dots as aria-pressed true', () => {
    render(<DotRating value={3} max={5} onChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true')
    expect(buttons[2]).toHaveAttribute('aria-pressed', 'true')
    expect(buttons[3]).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange with new value on click', () => {
    const onChange = vi.fn()
    render(<DotRating value={2} max={5} onChange={onChange} />)
    fireEvent.click(screen.getAllByRole('button')[3])
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('clicking the last filled dot decrements by 1', () => {
    const onChange = vi.fn()
    render(<DotRating value={3} max={5} onChange={onChange} />)
    fireEvent.click(screen.getAllByRole('button')[2])
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('renders spans not buttons when read-only (no onChange)', () => {
    render(<DotRating value={3} max={5} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})
