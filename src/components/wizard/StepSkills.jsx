import { useState } from 'react'
import DotRating from '../ui/DotRating'

const ALL_SKILLS = [
  'Academics','Computer','Crafts','Investigation','Medicine','Occult','Politics','Science',
  'Athletics','Brawl','Drive','Firearms','Larceny','Stealth','Survival','Weaponry',
  'Animal Ken','Empathy','Expression','Intimidation','Persuasion','Socialize','Streetwise','Subterfuge',
]

const CATEGORIES = [
  { key: 'mental',   label: 'Mental',
    skills: ['academics','computer','crafts','investigation','medicine','occult','politics','science'] },
  { key: 'physical', label: 'Physical',
    skills: ['athletics','brawl','drive','firearms','larceny','stealth','survival','weaponry'] },
  { key: 'social',   label: 'Social',
    skills: ['animal_ken','empathy','expression','intimidation','persuasion','socialize','streetwise','subterfuge'] },
]

const BUDGETS = { primary: 11, secondary: 7, tertiary: 4 }

const labelFor = s => s === 'animal_ken' ? 'Animal Ken' : s.charAt(0).toUpperCase() + s.slice(1)

export default function StepSkills({ skills, priority, specialties, onUpdateSkill, onSetPriority, onAddSpecialty, onRemoveSpecialty }) {
  const [specSkill, setSpecSkill] = useState('')
  const [specName, setSpecName]   = useState('')

  const assignPriority = (cat, level) => {
    const current = Object.entries(priority).find(([, v]) => v === level)?.[0]
    const next = { ...priority, [cat]: level }
    if (current && current !== cat) next[current] = priority[cat]
    onSetPriority(next)
  }

  const handleAdd = () => {
    if (!specSkill || !specName) return
    onAddSpecialty({ skill: specSkill, name: specName })
    setSpecSkill('')
    setSpecName('')
  }

  return (
    <div>
      <h2 className="wod-heading text-2xl font-bold mb-2">Skills</h2>
      <p className="text-wod-stone mb-6">Prioritize your categories (11 / 7 / 4 dots), then spend. Add 3 specialties.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {CATEGORIES.map(({ key, label, skills: skillList }) => {
          const level = priority[key]
          const budget = BUDGETS[level]
          const spent = skillList.reduce((s, sk) => s + skills[key][sk], 0)
          const remaining = budget - spent
          return (
            <div key={key} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-100">{label}</h3>
                <select
                  value={level}
                  onChange={e => assignPriority(key, e.target.value)}
                  className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-300"
                >
                  <option value="primary">Primary (11 dots)</option>
                  <option value="secondary">Secondary (7 dots)</option>
                  <option value="tertiary">Tertiary (4 dots)</option>
                </select>
              </div>
              <div className={`text-xs mb-3 ${remaining < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                {remaining} dots remaining
              </div>
              <div className="space-y-2">
                {skillList.map(sk => (
                  <div key={sk} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 w-28">{labelFor(sk)}</span>
                    <DotRating value={skills[key][sk]} max={5} onChange={v => onUpdateSkill(key, sk, v)} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 max-w-lg">
        <h3 className="font-bold text-gray-100 mb-3">Specialties ({specialties.length}/3)</h3>
        {specialties.map((s, i) => (
          <div key={i} className="flex items-center justify-between mb-2 text-sm">
            <span className="text-gray-300">{s.skill}: {s.name}</span>
            <button onClick={() => onRemoveSpecialty(i)} className="text-gray-500 hover:text-red-400 ml-2">✕</button>
          </div>
        ))}
        {specialties.length < 3 && (
          <div className="flex gap-2 mt-2">
            <select
              value={specSkill}
              onChange={e => setSpecSkill(e.target.value)}
              aria-label="Specialty skill"
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100 w-36 focus:outline-none focus:border-wod-silver"
            >
              <option value="">Skill…</option>
              {ALL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={specName} onChange={e => setSpecName(e.target.value)} placeholder="Specialty name"
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100 flex-1 focus:outline-none focus:border-wod-silver" />
            <button onClick={handleAdd} className="px-3 py-1 text-sm bg-wod-red hover:bg-wod-red-hover rounded text-wod-cream">
              Add Specialty
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
