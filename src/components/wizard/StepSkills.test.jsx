import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StepSkills from './StepSkills'

const skills = {
  mental:   { academics:0, computer:0, crafts:0, investigation:0, medicine:0, occult:0, politics:0, science:0 },
  physical: { athletics:0, brawl:0, drive:0, firearms:0, larceny:0, stealth:0, survival:0, weaponry:0 },
  social:   { animal_ken:0, empathy:0, expression:0, intimidation:0, persuasion:0, socialize:0, streetwise:0, subterfuge:0 },
}

const priority = { mental: 'primary', physical: 'secondary', social: 'tertiary' }

describe('StepSkills', () => {
  it('renders all 24 skill labels', () => {
    render(<StepSkills skills={skills} priority={priority} specialties={[]} onUpdateSkill={() => {}} onSetPriority={() => {}} onAddSpecialty={() => {}} onRemoveSpecialty={() => {}} />)
    expect(screen.getAllByText('Academics').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Athletics').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Animal Ken').length).toBeGreaterThan(0)
  })

  it('renders specialty add button', () => {
    render(<StepSkills skills={skills} priority={priority} specialties={[]} onUpdateSkill={() => {}} onSetPriority={() => {}} onAddSpecialty={() => {}} onRemoveSpecialty={() => {}} />)
    expect(screen.getByText('Add Specialty')).toBeInTheDocument()
  })

  it('calls onAddSpecialty when add button clicked with inputs filled', () => {
    const onAdd = vi.fn()
    render(<StepSkills skills={skills} priority={priority} specialties={[]} onUpdateSkill={() => {}} onSetPriority={() => {}} onAddSpecialty={onAdd} onRemoveSpecialty={() => {}} />)
    fireEvent.change(screen.getByRole('combobox', { name: /specialty skill/i }), { target: { value: 'Occult' } })
    fireEvent.change(screen.getByPlaceholderText('Specialty name'), { target: { value: 'Vampires' } })
    fireEvent.click(screen.getByText('Add Specialty'))
    expect(onAdd).toHaveBeenCalledWith({ skill: 'Occult', name: 'Vampires' })
  })
})
