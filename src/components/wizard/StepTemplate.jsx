function GroupSelector({ group, selected, onSelect }) {
  if (group.freeform) {
    return (
      <div>
        <h3 className="font-bold text-gray-100 mb-3">{group.label}</h3>
        <input
          type="text"
          value={selected || ''}
          placeholder={group.placeholder || `Describe your ${group.label}`}
          onChange={e => onSelect(group.field, e.target.value)}
          className="w-full max-w-md bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-400"
        />
      </div>
    )
  }

  return (
    <div>
      <h3 className="font-bold text-gray-100 mb-3">{group.label}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {group.options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSelect(group.field, opt.id)}
            className={`text-left p-3 rounded-lg border transition-all ${
              selected === opt.id
                ? 'border-amber-400 bg-gray-800 ring-1 ring-amber-400'
                : 'border-gray-700 bg-gray-900 hover:border-gray-500'
            }`}
          >
            <div className="font-semibold text-gray-100">{opt.name}</div>
            <div className="text-xs text-gray-400 mt-1">{opt.description}</div>
            {opt.hint && <div className="text-xs text-amber-500 mt-1">{opt.hint}</div>}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function StepTemplate({ lineData, template, onUpdate }) {
  const { group1, group2 } = lineData.template

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Supernatural Template</h2>
        <p className="text-gray-400 mb-6">Choose your {lineData.name} origin and affiliation.</p>
      </div>
      <GroupSelector group={group1} selected={template[group1.field]} onSelect={onUpdate} />
      {group2 && (
        <GroupSelector group={group2} selected={template[group2.field]} onSelect={onUpdate} />
      )}
    </div>
  )
}
