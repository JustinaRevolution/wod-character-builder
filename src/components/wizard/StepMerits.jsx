import { useState } from 'react'
import DotRating from '../ui/DotRating'
import BASE_CATALOG from '../../data/merits.json'
import VAMPIRE_MERITS from '../../data/vampire-merits.json'
import WEREWOLF_MERITS from '../../data/werewolf-merits.json'

const BUDGET = 7
const BASE_CATEGORIES = ['all', 'mental', 'physical', 'social']
const LINE_MERITS = { vampire: VAMPIRE_MERITS, werewolf: WEREWOLF_MERITS }
const LINE_LABELS = { vampire: 'Kindred only', werewolf: 'Uratha only' }

function dotLabel(merit) {
  const fill = (n) => '●'.repeat(n)
  if (merit.min_dots === merit.max_dots) return fill(merit.min_dots)
  return `${fill(merit.min_dots)}–${fill(merit.max_dots)}`
}

export default function StepMerits({ merits, onAdd, onRemove, lineId = null }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [pending, setPending] = useState(null) // { id, dots }

  const catalog = [...BASE_CATALOG, ...(LINE_MERITS[lineId] || [])]
  const categories = LINE_MERITS[lineId]
    ? [...BASE_CATEGORIES, lineId]
    : BASE_CATEGORIES

  const spent = merits.reduce((s, m) => s + m.dots, 0)
  const remaining = BUDGET - spent

  const filtered = catalog.filter(m => {
    if (category !== 'all' && m.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        (m.prerequisites && m.prerequisites.toLowerCase().includes(q))
      )
    }
    return true
  })

  const confirmAdd = (merit, dots) => {
    onAdd({ name: merit.name, dots })
    setPending(null)
  }

  const handleSelect = (merit) => {
    if (merit.min_dots === merit.max_dots) {
      confirmAdd(merit, merit.min_dots)
    } else {
      setPending(p => p?.id === merit.id ? null : { id: merit.id, dots: merit.min_dots })
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Merits</h2>
      <p className={`text-sm font-medium mb-4 ${remaining < 0 ? 'text-red-400' : 'text-amber-400'}`}>
        {remaining} of {BUDGET} dots remaining
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: catalog */}
        <div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search merits..."
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-100 mb-2 focus:outline-none focus:border-amber-400"
          />
          <div className="flex gap-1 mb-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 text-xs rounded capitalize ${
                  category === cat
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-1 max-h-[28rem] overflow-y-auto pr-1">
            {filtered.map(merit => {
              const isPending = pending?.id === merit.id
              return (
                <div key={merit.id} className="bg-gray-900 border border-gray-700 rounded overflow-hidden">
                  <button
                    onClick={() => handleSelect(merit)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm text-gray-200 font-medium">{merit.name}</span>
                      <span className="text-xs text-amber-400 tracking-widest shrink-0">{dotLabel(merit)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{merit.description}</p>
                    {merit.prerequisites && (
                      <p className="text-xs text-gray-600 mt-0.5">Req: {merit.prerequisites}</p>
                    )}
                    {merit.chargen_only && (
                      <p className="text-xs text-amber-800 mt-0.5">Character creation only</p>
                    )}
                    {merit.line && (
                      <p className="text-xs text-red-900 mt-0.5">{LINE_LABELS[merit.line] ?? `${merit.line} only`}</p>
                    )}
                  </button>
                  {isPending && (
                    <div className="flex items-center gap-3 px-3 pb-2 pt-2 border-t border-gray-700 bg-gray-800">
                      <DotRating
                        value={pending.dots}
                        max={merit.max_dots}
                        onChange={d => setPending(p => ({ ...p, dots: Math.max(merit.min_dots, d) }))}
                      />
                      <button
                        onClick={() => confirmAdd(merit, pending.dots)}
                        className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-500 rounded text-white"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-gray-600 text-sm px-1 py-3">No merits match your search.</p>
            )}
          </div>
        </div>

        {/* Right: selected merits + custom entry */}
        <div>
          <h3 className="font-semibold text-gray-300 mb-3 text-xs uppercase tracking-wider">Selected Merits</h3>
          <div className="space-y-2 mb-6">
            {merits.map((m, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-900 rounded px-3 py-2 border border-gray-700">
                <span className="text-gray-200 text-sm">{m.name}</span>
                <div className="flex items-center gap-3">
                  <DotRating value={m.dots} max={5} />
                  <button onClick={() => onRemove(i)} className="text-gray-500 hover:text-red-400 text-sm">✕</button>
                </div>
              </div>
            ))}
            {merits.length === 0 && (
              <p className="text-gray-600 text-sm">No merits selected yet.</p>
            )}
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Custom Merit</h4>
            <CustomMeritForm onAdd={onAdd} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomMeritForm({ onAdd }) {
  const [name, setName] = useState('')
  const [dots, setDots] = useState(1)

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd({ name: name.trim(), dots })
    setName('')
    setDots(1)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Merit name"
        className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-400"
      />
      <DotRating value={dots} max={5} onChange={setDots} />
      <button
        onClick={handleAdd}
        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded text-white text-sm"
      >
        Add
      </button>
    </div>
  )
}
