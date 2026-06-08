import { useState } from 'react'
import DotRating from '../ui/DotRating'

const CATEGORIES = [
  { key: 'mental',   label: 'Mental',   budget: 11,
    skills: ['academics','computer','crafts','investigation','medicine','occult','politics','science'] },
  { key: 'physical', label: 'Physical', budget: 7,
    skills: ['athletics','brawl','drive','firearms','larceny','stealth','survival','weaponry'] },
  { key: 'social',   label: 'Social',   budget: 4,
    skills: ['animal_ken','empathy','expression','intimidation','persuasion','socialize','streetwise','subterfuge'] },
]

const labelFor = s => s === 'animal_ken' ? 'Animal Ken' : s.charAt(0).toUpperCase() + s.slice(1)

export default function StepSkills({ skills, specialties, onUpdateSkill, onAddSpecialty, onRemoveSpecialty }) {
  const [specSkill, setSpecSkill] = useState('')
  const [specName, setSpecName]   = useState('')

  const handleAdd = () => {
    if (!specSkill || !specName) return
    onAddSpecialty({ skill: specSkill, name: specName })
    setSpecSkill('')
    setSpecName('')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Skills</h2>
      <p className="text-gray-400 mb-6">Spend 11 / 7 / 4 dots across Mental / Physical / Social. Then add 3 specialties.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {CATEGORIES.map(({ key, label, budget, skills: skillList }) => {
          const spent = skillList.reduce((s, sk) => s + skills[key][sk], 0)
          const remaining = budget - spent
          return (
            <div key={key} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-100">{label}</h3>
                <span className={`text-xs ${remaining < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                  {remaining} / {budget} remaining
                </span>
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
            <input value={specSkill} onChange={e => setSpecSkill(e.target.value)} placeholder="Skill"
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100 w-24 focus:outline-none focus:border-amber-400" />
            <input value={specName} onChange={e => setSpecName(e.target.value)} placeholder="Specialty name"
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100 flex-1 focus:outline-none focus:border-amber-400" />
            <button onClick={handleAdd} className="px-3 py-1 text-sm bg-amber-600 hover:bg-amber-500 rounded text-white">
              Add Specialty
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
