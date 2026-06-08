import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepTemplate from './StepTemplate'
import vampire from '../../data/lines/vampire.json'
import geist   from '../../data/lines/geist.json'
import hunter  from '../../data/lines/hunter.json'

describe('StepTemplate', () => {
  it('renders group1 and group2 options for Vampire', () => {
    render(<StepTemplate lineData={vampire} template={{}} onUpdate={() => {}} />)
    expect(screen.getByText('Daeva')).toBeInTheDocument()
    expect(screen.getByText('The Invictus')).toBeInTheDocument()
  })

  it('calls onUpdate with field and option id when clicked', () => {
    const onUpdate = vi.fn()
    render(<StepTemplate lineData={vampire} template={{}} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByText('Gangrel').closest('button'))
    expect(onUpdate).toHaveBeenCalledWith('clan', 'gangrel')
  })

  it('renders freeform text input for Geist group2', () => {
    render(<StepTemplate lineData={geist} template={{}} onUpdate={() => {}} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders only group1 when group2 is null', () => {
    render(<StepTemplate lineData={hunter} template={{}} onUpdate={() => {}} />)
    expect(screen.queryByText('Organization')).toBeInTheDocument()
  })
})
