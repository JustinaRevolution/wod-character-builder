import { useState } from 'react'
import DotRating from '../ui/DotRating'

const BUDGET = 7

export default function StepMerits({ merits, onAdd, onRemove }) {
  const [name, setName] = useState('')
  const [dots, setDots] = useState(1)

  const spent   = merits.reduce((s, m) => s + m.dots, 0)
  const remaining = BUDGET - spent

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd({ name: name.trim(), dots })
    setName('')
    setDots(1)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Merits</h2>
      <p className="text-gray-400 mb-1">Spend your merit dots on Merits from the World of Darkness core book or your game line.</p>
      <p className={`text-sm font-medium mb-6 ${remaining < 0 ? 'text-red-400' : 'text-amber-400'}`}>
        {remaining} of {BUDGET} dots remaining
      </p>

      <div className="space-y-2 mb-6 max-w-md">
        {merits.map((m, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-900 rounded px-3 py-2 border border-gray-700">
            <span className="text-gray-200">{m.name}</span>
            <div className="flex items-center gap-3">
              <DotRating value={m.dots} max={5} />
              <button onClick={() => onRemove(i)} className="text-gray-500 hover:text-red-400">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 max-w-md">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Merit name"
          className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
        />
        <DotRating value={dots} max={5} onChange={setDots} />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded text-white text-sm"
        >
          Add
        </button>
      </div>
    </div>
  )
}
