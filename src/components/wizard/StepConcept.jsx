const FIELDS = [
  { key: 'name',      label: 'Character Name', placeholder: 'What is their name?' },
  { key: 'concept',   label: 'Concept',        placeholder: 'Who are they in one phrase?' },
  { key: 'virtue',    label: 'Virtue',         placeholder: 'e.g. Prudence, Justice, Hope' },
  { key: 'vice',      label: 'Vice',           placeholder: 'e.g. Envy, Greed, Sloth' },
  { key: 'chronicle', label: 'Chronicle',      placeholder: 'Campaign name' },
  { key: 'player',    label: 'Player',         placeholder: 'Your real name' },
]

export default function StepConcept({ meta, onChange }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Concept</h2>
      <p className="text-gray-400 mb-6">Who is this character? Give them a name and identity.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm text-gray-400 mb-1">{label}</label>
            <input
              id={key}
              type="text"
              value={meta[key]}
              placeholder={placeholder}
              onChange={e => onChange(key, e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
