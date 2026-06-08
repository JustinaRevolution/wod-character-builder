import DotRating from '../ui/DotRating'

export default function StepReview({ character, lineData, onUpdateNotes }) {
  const { meta, template, attributes, skills, specialties, powers, merits, derived } = character
  const g1 = lineData.template.group1
  const g2 = lineData.template.group2
  const powerItems = lineData.powers.items || []
  const powerEntries = Object.entries(powers).filter(([k]) => k !== '_keys')
  const selectedKeys = powers._keys || []

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Review & Notes</h2>
      <p className="text-gray-400 mb-6">Check everything looks right, add any notes, then print.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Identity */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h3 className="font-bold text-amber-400 mb-3">{meta.name || 'Unnamed'}</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <div><span className="text-gray-500">Concept:</span> {meta.concept}</div>
            <div><span className="text-gray-500">Virtue:</span> {meta.virtue} · <span className="text-gray-500">Vice:</span> {meta.vice}</div>
            {g1 && template[g1.field] && <div><span className="text-gray-500">{g1.label}:</span> {g1.options.find(o => o.id === template[g1.field])?.name}</div>}
            {g2 && !g2.freeform && template[g2.field] && <div><span className="text-gray-500">{g2.label}:</span> {g2.options.find(o => o.id === template[g2.field])?.name}</div>}
            {g2?.freeform && template[g2.field] && <div><span className="text-gray-500">{g2.label}:</span> {template[g2.field]}</div>}
          </div>
        </div>

        {/* Derived */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h3 className="font-bold text-gray-200 mb-3">Derived Traits</h3>
          <div className="grid grid-cols-2 gap-1 text-sm text-gray-300">
            <div><span className="text-gray-500">Health:</span> {derived.health}</div>
            <div><span className="text-gray-500">Willpower:</span> {derived.willpower}</div>
            <div><span className="text-gray-500">Speed:</span> {derived.speed}</div>
            <div><span className="text-gray-500">Defense:</span> {derived.defense}</div>
            <div><span className="text-gray-500">Initiative:</span> {derived.initiative}</div>
            {derived.resource_pool.name && <div><span className="text-gray-500">{derived.resource_pool.name}:</span> {derived.resource_pool.max}</div>}
            {derived.integrity.name && <div><span className="text-gray-500">{derived.integrity.name}:</span> {derived.integrity.value}</div>}
          </div>
        </div>

        {/* Powers */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h3 className="font-bold text-gray-200 mb-3">{lineData.powers.label}</h3>
          <div className="text-sm text-gray-300 space-y-1">
            {powerEntries.map(([id, val]) => {
              const item = powerItems.find(i => i.id === id)
              return typeof val === 'number'
                ? <div key={id} className="flex justify-between"><span>{item?.name || id}</span><DotRating value={val} max={5} /></div>
                : <div key={id}>{item?.name || id}: {val}</div>
            })}
            {selectedKeys.length > 0 && <div className="text-gray-500">Keys: {selectedKeys.join(', ')}</div>}
          </div>
        </div>

        {/* Merits */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h3 className="font-bold text-gray-200 mb-3">Merits</h3>
          <div className="text-sm text-gray-300 space-y-1">
            {merits.map((m, i) => (
              <div key={i} className="flex justify-between"><span>{m.name}</span><DotRating value={m.dots} max={5} /></div>
            ))}
            {specialties.length > 0 && (
              <div className="mt-2 text-gray-500">Specialties: {specialties.map(s => `${s.skill} (${s.name})`).join(', ')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8 max-w-2xl">
        <label className="block font-bold text-gray-200 mb-2" htmlFor="notes">Notes & Background</label>
        <textarea
          id="notes"
          value={character.notes}
          onChange={e => onUpdateNotes(e.target.value)}
          placeholder="Background, appearance, personality, story hooks..."
          rows={5}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
        />
      </div>

      <button
        onClick={() => window.print()}
        className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-lg"
      >
        Print Character Sheet
      </button>
    </div>
  )
}
