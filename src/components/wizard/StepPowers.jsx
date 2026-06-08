import DotRating from '../ui/DotRating'

function PoolPowers({ lineData, template, powers, onSetPowers }) {
  const { items, startingDots, affinityFrom, description } = lineData.powers
  const selectedAffinity = affinityFrom ? template[lineData.template[affinityFrom]?.field] : null
  const spent = Object.entries(powers).reduce((s, [k, v]) => k === '_keys' ? s : s + (v || 0), 0)
  const remaining = startingDots - spent

  const handleChange = (id, v) => {
    const next = { ...powers, [id]: v }
    const newSpent = Object.entries(next).reduce((s, [k, val]) => k === '_keys' ? s : s + (val || 0), 0)
    if (newSpent <= startingDots || v < (powers[id] || 0)) onSetPowers(next)
  }

  return (
    <div>
      <p className="text-gray-400 mb-2">{description}</p>
      <p className={`text-sm mb-4 font-medium ${remaining < 0 ? 'text-red-400' : 'text-amber-400'}`}>
        {remaining} dots remaining
      </p>
      <div className="space-y-2 max-w-sm">
        {items.map(item => {
          const isAffinity = selectedAffinity && item.affinityFor?.includes(selectedAffinity)
          return (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300 w-28">{item.name}</span>
                {isAffinity && <span className="text-xs text-amber-500 bg-amber-900/30 px-1 rounded">Clan</span>}
              </div>
              <DotRating value={powers[item.id] || 0} max={5} onChange={v => handleChange(item.id, v)} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PicksPowers({ lineData, powers, onSetPowers }) {
  const { picksFrom } = lineData.powers

  const handleChange = (groupKey, index, value) => {
    const key = `${groupKey}_${index}`
    onSetPowers({ ...powers, [key]: value })
  }

  return (
    <div>
      {picksFrom.map(({ source, count, label }) => (
        <div key={source} className="mb-6">
          <h4 className="font-semibold text-gray-200 mb-2">{label} ({count})</h4>
          <div className="space-y-2">
            {Array.from({ length: count }, (_, i) => {
              const key = `${source}_${i}`
              return (
                <input
                  key={key}
                  type="text"
                  value={powers[key] || ''}
                  placeholder={`${label} ${i + 1}`}
                  onChange={e => handleChange(source, i, e.target.value)}
                  className="w-full max-w-sm bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-400"
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function KeysPicker({ keys, selectedKeys, onSetPowers, powers }) {
  const toggle = (id) => {
    const current = selectedKeys.includes(id)
      ? selectedKeys.filter(k => k !== id)
      : selectedKeys.length < keys.startingPicks
        ? [...selectedKeys, id]
        : selectedKeys
    onSetPowers({ ...powers, _keys: current })
  }

  return (
    <div className="mt-8">
      <h4 className="font-semibold text-gray-200 mb-2">{keys.label} — choose {keys.startingPicks}</h4>
      <p className="text-gray-400 text-sm mb-3">{keys.description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
        {keys.items.map(key => (
          <button
            key={key.id}
            onClick={() => toggle(key.id)}
            className={`text-left p-2 rounded border text-sm transition-all ${
              selectedKeys.includes(key.id)
                ? 'border-amber-400 bg-gray-800 text-gray-100'
                : 'border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            <span className="font-medium">{key.name}</span>
            <span className="text-xs text-gray-500 block">{key.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function StepPowers({ lineData, template, powers, onSetPowers }) {
  const { type, label, keys } = lineData.powers
  const selectedKeys = powers._keys || []

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{label}</h2>
      {type === 'pool'
        ? <PoolPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} />
        : <PicksPowers lineData={lineData} powers={powers} onSetPowers={onSetPowers} />
      }
      {keys && (
        <KeysPicker keys={keys} selectedKeys={selectedKeys} onSetPowers={onSetPowers} powers={powers} />
      )}
    </div>
  )
}
