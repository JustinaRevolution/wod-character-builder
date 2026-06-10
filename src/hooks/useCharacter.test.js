import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import useCharacter from './useCharacter'

beforeEach(() => localStorage.clear())

describe('useCharacter', () => {
  it('initializes with empty meta and base attributes', () => {
    const { result } = renderHook(() => useCharacter())
    expect(result.current.character.meta.name).toBe('')
    expect(result.current.character.attributes.mental.intelligence).toBe(1)
    expect(result.current.character.attributes.physical.strength).toBe(1)
    expect(result.current.character.skills.mental.occult).toBe(0)
  })

  it('updateMeta updates a meta field', () => {
    const { result } = renderHook(() => useCharacter())
    act(() => result.current.updateMeta('name', 'Selene'))
    expect(result.current.character.meta.name).toBe('Selene')
  })

  it('updateAttribute updates a single attribute', () => {
    const { result } = renderHook(() => useCharacter())
    act(() => result.current.updateAttribute('mental', 'intelligence', 4))
    expect(result.current.character.attributes.mental.intelligence).toBe(4)
  })

  it('updateSkill updates a single skill', () => {
    const { result } = renderHook(() => useCharacter())
    act(() => result.current.updateSkill('mental', 'occult', 3))
    expect(result.current.character.skills.mental.occult).toBe(3)
  })

  it('addSpecialty appends and removeSpecialty removes by index', () => {
    const { result } = renderHook(() => useCharacter())
    act(() => result.current.addSpecialty({ skill: 'occult', name: 'Vampires' }))
    expect(result.current.character.specialties).toHaveLength(1)
    act(() => result.current.removeSpecialty(0))
    expect(result.current.character.specialties).toHaveLength(0)
  })

  it('updateTemplate sets a template field', () => {
    const { result } = renderHook(() => useCharacter())
    act(() => result.current.updateTemplate('clan', 'daeva'))
    expect(result.current.character.template.clan).toBe('daeva')
  })

  it('setPowers replaces the powers object', () => {
    const { result } = renderHook(() => useCharacter())
    act(() => result.current.setPowers({ animalism: 2 }))
    expect(result.current.character.powers.animalism).toBe(2)
  })

  it('addMerit appends and removeMerit removes by index', () => {
    const { result } = renderHook(() => useCharacter())
    act(() => result.current.addMerit({ id: 'resources', name: 'Resources', dots: 3 }))
    expect(result.current.character.merits).toHaveLength(1)
    act(() => result.current.removeMerit(0))
    expect(result.current.character.merits).toHaveLength(0)
  })

  it('setDerived replaces derived object entirely', () => {
    const { result } = renderHook(() => useCharacter())
    const fullDerived = {
      health: 7, willpower: 4, speed: 10, defense: 3, initiative: 5,
      resource_pool: { name: 'Vitae', max: 10 },
      integrity: { name: 'Humanity', value: 7 },
      supernatural_trait: { name: 'Blood Potency', value: 1 },
    }
    act(() => result.current.setDerived(fullDerived))
    expect(result.current.character.derived.health).toBe(7)
    expect(result.current.character.derived.willpower).toBe(4)
    expect(result.current.character.derived.resource_pool.name).toBe('Vitae')
  })

  it('updateNotes updates the notes field', () => {
    const { result } = renderHook(() => useCharacter())
    act(() => result.current.updateNotes('A spy from Venice.'))
    expect(result.current.character.notes).toBe('A spy from Venice.')
  })

  it('persists to localStorage and restores on remount', () => {
    const { result, unmount } = renderHook(() => useCharacter())
    act(() => result.current.updateMeta('name', 'Lucien'))
    unmount()
    const { result: r2 } = renderHook(() => useCharacter())
    expect(r2.current.character.meta.name).toBe('Lucien')
  })

  it('resetCharacter clears state and localStorage', () => {
    const { result } = renderHook(() => useCharacter())
    act(() => result.current.updateMeta('name', 'Lucien'))
    act(() => result.current.resetCharacter())
    expect(result.current.character.meta.name).toBe('')
    expect(localStorage.getItem('wod-draft')).toBeNull()
  })

  it('setRenown replaces the renown object', () => {
    const { result } = renderHook(() => useCharacter())
    act(() => result.current.setRenown({ Glory: 2, Purity: 1 }))
    expect(result.current.character.renown.Glory).toBe(2)
    expect(result.current.character.renown.Purity).toBe(1)
  })

  it('importCharacter replaces state and merges with defaults', () => {
    const { result } = renderHook(() => useCharacter())
    act(() => result.current.importCharacter({ meta: { name: 'Imported', line: 'vampire', concept: '', virtue: '', vice: '', chronicle: '', player: '' } }))
    expect(result.current.character.meta.name).toBe('Imported')
    // Fields not in imported data should fall back to defaults
    expect(result.current.character.attributes.mental.intelligence).toBe(1)
    expect(result.current.character.renown).toEqual({})
  })
})
