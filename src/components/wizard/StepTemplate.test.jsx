import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepTemplate from './StepTemplate'
import vampire     from '../../data/lines/vampire.json'
import geist       from '../../data/lines/geist.json'
import hunter      from '../../data/lines/hunter.json'
import secondSight from '../../data/lines/second-sight.json'

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

  it('calls onUpdate when freeform text input changes', () => {
    const onUpdate = vi.fn()
    render(<StepTemplate lineData={geist} template={{}} onUpdate={onUpdate} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'The Hollow Crown' } })
    expect(onUpdate).toHaveBeenCalledWith('geist_name', 'The Hollow Crown')
  })

  it('renders both group1 and group2 for Hunter', () => {
    render(<StepTemplate lineData={hunter} template={{}} onUpdate={() => {}} />)
    expect(screen.getByText('Organization Type')).toBeInTheDocument()
    expect(screen.getByText('Organization')).toBeInTheDocument()
  })

  it('renders only group1 when group2 is null (Second Sight)', () => {
    render(<StepTemplate lineData={secondSight} template={{}} onUpdate={() => {}} />)
    expect(screen.getByText('Mortal Type')).toBeInTheDocument()
    expect(screen.queryByText('Geist')).not.toBeInTheDocument()
  })
})
