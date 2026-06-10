import { useState } from 'react'
import DotRating from '../ui/DotRating'
import POWERS from '../../data/discipline-powers.json'

function PowersPanel({ itemId, currentDots }) {
  const powers = POWERS[itemId]
  if (!powers) return null
  return (
    <div className="ml-1 mb-2 mt-1 border-l-2 border-gray-700 pl-3 space-y-2.5">
      {powers.map((p, i) => {
        const unlocked = p.dot === 'passive' ? currentDots > 0 : currentDots >= p.dot
        return (
          <div key={i} className={unlocked ? 'text-gray-200' : 'text-gray-600'}>
            <div className="flex flex-wrap items-baseline gap-x-2 text-xs">
              {p.dot !== 'passive' && (
                <span className={`shrink-0 ${unlocked ? 'text-amber-500' : 'text-gray-700'}`}>
                  {'●'.repeat(p.dot)}
                </span>
              )}
              <span className="font-semibold">{p.name}</span>
              <span className={`ml-auto text-right ${unlocked ? 'text-gray-500' : 'text-gray-700'}`}>
                {p.cost} · {p.action}
              </span>
            </div>
            <p className="text-xs leading-snug mt-0.5">{p.description}</p>
            {p.dice !== 'No roll' && p.dice !== 'No roll (always on)' && (
              <p className={`text-xs mt-0.5 ${unlocked ? 'text-gray-600' : 'text-gray-700'}`}>
                Roll: {p.dice}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PoolPowers({ lineData, template, powers, onSetPowers }) {
  const { items, startingDots, affinityFrom, description, caps } = lineData.powers
  const selectedAffinity = affinityFrom ? template[lineData.template[affinityFrom]?.field] : null
  const spent = Object.entries(powers).reduce((s, [k, v]) => k === '_keys' ? s : s + (v || 0), 0)
  const remaining = startingDots - spent
  const [expanded, setExpanded] = useState(null)

  const handleChange = (id, v) => {
    const next = { ...powers, [id]: v }
    const newSpent = Object.entries(next).reduce((s, [k, val]) => k === '_keys' ? s : s + (val || 0), 0)
    if (newSpent <= startingDots || v < (powers[id] || 0)) onSetPowers(next)
  }

  const affinityLabel = lineData.id === 'vampire' ? 'Clan'
    : lineData.id === 'mage' ? 'Ruling'
    : 'Affinity'

  return (
    <div>
      <p className="text-gray-400 mb-2">{description}</p>
      <p className={`text-sm mb-4 font-medium ${remaining < 0 ? 'text-red-400' : 'text-amber-400'}`}>
        {remaining} dots remaining
      </p>
      <div className="space-y-1 max-w-sm">
        {items.map(item => {
          const isAffinity = selectedAffinity && item.affinityFor?.includes(selectedAffinity)
          const itemMax = caps ? (isAffinity ? caps.affinity : caps.default) : 5
          const hasPowers = Boolean(POWERS[item.id])
          const isExpanded = expanded === item.id
          return (
            <div key={item.id}>
              <div className="flex items-center justify-between py-0.5">
                <div
                  className={`flex items-center gap-2 ${hasPowers ? 'cursor-pointer' : ''}`}
                  onClick={() => hasPowers && setExpanded(isExpanded ? null : item.id)}
                >
                  <span className="text-sm text-gray-300 w-28">{item.name}</span>
                  {isAffinity && <span className="text-xs text-amber-500 bg-amber-900/30 px-1 rounded">{affinityLabel}</span>}
                  {hasPowers && (
                    <span className="text-xs text-gray-600 select-none">{isExpanded ? '▾' : '▸'}</span>
                  )}
                </div>
                <DotRating value={powers[item.id] || 0} max={itemMax} onChange={v => handleChange(item.id, v)} />
              </div>
              {isExpanded && (
                <PowersPanel itemId={item.id} currentDots={powers[item.id] || 0} />
              )}
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

function RenownSection({ lineData, template, renown, onSetRenown }) {
  const { tracks, fromAuspice } = lineData.renown
  const auspiceId = fromAuspice ? template[lineData.template.group2.field] : null
  const auspiceOption = auspiceId
    ? lineData.template.group2.options.find(o => o.id === auspiceId)
    : null
  const auspiceTrack = auspiceOption?.renownTrack || null

  const getValue = (track) =>
    track === auspiceTrack ? Math.max(1, renown[track] || 0) : (renown[track] || 0)

  const handleChange = (track, value) =>
    onSetRenown({ ...renown, [track]: track === auspiceTrack ? Math.max(1, value) : value })

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-gray-200 mb-1">Renown</h3>
      <p className="text-gray-400 text-sm mb-4">
        Your Auspice Renown starts at 1. Additional Renown is earned through play.
      </p>
      <div className="space-y-2 max-w-sm">
        {tracks.map(track => (
          <div key={track} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300 w-28">{track}</span>
              {track === auspiceTrack && (
                <span className="text-xs text-amber-500 bg-amber-900/30 px-1 rounded">Auspice</span>
              )}
            </div>
            <DotRating value={getValue(track)} max={5} onChange={v => handleChange(track, v)} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StepPowers({ lineData, template, powers, onSetPowers, renown = {}, onSetRenown = () => {} }) {
  const { type, label, keys, compactNote } = lineData.powers
  const selectedKeys = powers._keys || []

  const isCompact = compactNote &&
    template[lineData.template.group1.field] === 'compact'

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{label}</h2>
      {isCompact
        ? <p className="text-gray-400 mb-4">{compactNote}</p>
        : type === 'pool'
          ? <PoolPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} />
          : <PicksPowers lineData={lineData} powers={powers} onSetPowers={onSetPowers} />
      }
      {!isCompact && keys && (
        <KeysPicker keys={keys} selectedKeys={selectedKeys} onSetPowers={onSetPowers} powers={powers} />
      )}
      {lineData.renown && (
        <RenownSection lineData={lineData} template={template} renown={renown} onSetRenown={onSetRenown} />
      )}
    </div>
  )
}
