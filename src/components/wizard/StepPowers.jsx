import { useState, useEffect } from 'react'
import DotRating from '../ui/DotRating'
import POWERS from '../../data/discipline-powers.json'
import GIFTS from '../../data/gifts.json'
import SPELLS from '../../data/spells.json'
import { validateArcana, findInvalidRotes, SPELL_INDEX } from '../../utils/arcanaValidation'
import AFFINITIES from '../../data/affinities.json'
import UTTERANCES from '../../data/utterances.json'
import { validatePillars, pillarPointsSpent, utteranceQualifies } from '../../utils/pillarValidation'

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

function GiftSection({ label, giftLists, maxPicks, maxLevel, selected, onToggle }) {
  const [activeList, setActiveList] = useState(giftLists[0] || null)
  const count = selected.length
  const listData = activeList ? GIFTS[activeList] : null

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
        {label}
        <span className={`text-xs px-2 py-0.5 rounded ${
          count === maxPicks ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
        }`}>
          {count} of {maxPicks}
        </span>
      </h3>

      <div className="flex gap-1 flex-wrap mb-3">
        {giftLists.map(listId => (
          <button
            key={listId}
            onClick={() => setActiveList(listId)}
            className={`px-3 py-1 text-xs rounded ${
              activeList === listId
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {GIFTS[listId]?.name ?? listId}
          </button>
        ))}
      </div>

      {listData && (
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {listData.gifts.map(gift => {
            const isSelected = selected.includes(gift.id)
            const isLocked = gift.level > maxLevel
            const isMaxed = !isSelected && count >= maxPicks
            const isDisabled = isLocked || isMaxed

            return (
              <div
                key={gift.id}
                onClick={() => !isDisabled && onToggle(gift.id)}
                className={`p-2 rounded border transition-colors ${
                  isSelected
                    ? 'border-amber-400 bg-gray-800 cursor-pointer'
                    : isDisabled
                    ? 'border-gray-800 opacity-40 cursor-not-allowed'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs shrink-0 tracking-widest ${isDisabled ? 'text-gray-700' : 'text-amber-500'}`}>
                      {'●'.repeat(gift.level)}
                    </span>
                    <span className={`text-sm font-medium ${isSelected ? 'text-gray-100' : isDisabled ? 'text-gray-600' : 'text-gray-300'}`}>
                      {gift.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && <span className="text-amber-400 text-xs">✓</span>}
                    {isLocked
                      ? <span className="text-xs text-gray-700">{'●'.repeat(gift.level)} req.</span>
                      : <span className="text-xs text-gray-600">{gift.cost} · {gift.action}</span>
                    }
                  </div>
                </div>
                {!isLocked && (
                  <p className={`text-xs mt-1 leading-snug ${isSelected ? 'text-gray-400' : 'text-gray-600'}`}>
                    {gift.description}
                  </p>
                )}
                {!isLocked && gift.dice !== 'No roll required' && gift.dice !== 'This power requires no roll.' && (
                  <p className={`text-xs mt-0.5 ${isSelected ? 'text-gray-500' : 'text-gray-700'}`}>
                    Roll: {gift.dice}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function GiftsPowers({ lineData, template, powers, onSetPowers, renown }) {
  const { auspicePicks, tribePicks } = lineData.powers
  const auspiceId = template[lineData.template.group2.field]
  const tribeId = template[lineData.template.group1.field]

  const auspiceOption = lineData.template.group2.options.find(o => o.id === auspiceId)
  const tribeOption = lineData.template.group1.options.find(o => o.id === tribeId)

  const auspiceGiftLists = auspiceOption?.giftLists ?? []
  const tribeGiftLists = tribeOption?.giftLists ?? []
  const isGhostWolf = tribeId === 'ghost_wolves'

  const renownValues = Object.values(renown).filter(v => typeof v === 'number')
  const maxLevel = renownValues.length > 0 ? Math.max(...renownValues, 1) : 1

  const auspiceSelected = powers.auspice_gifts ?? []
  const tribeSelected = powers.tribe_gifts ?? []

  const toggleAuspice = giftId => {
    const next = auspiceSelected.includes(giftId)
      ? auspiceSelected.filter(id => id !== giftId)
      : auspiceSelected.length < auspicePicks
        ? [...auspiceSelected, giftId]
        : auspiceSelected
    onSetPowers({ ...powers, auspice_gifts: next })
  }

  const toggleTribe = giftId => {
    const next = tribeSelected.includes(giftId)
      ? tribeSelected.filter(id => id !== giftId)
      : tribeSelected.length < tribePicks
        ? [...tribeSelected, giftId]
        : tribeSelected
    onSetPowers({ ...powers, tribe_gifts: next })
  }

  return (
    <div>
      {auspiceGiftLists.length > 0 && (
        <GiftSection
          label="Auspice Gifts"
          giftLists={auspiceGiftLists}
          maxPicks={auspicePicks}
          maxLevel={maxLevel}
          selected={auspiceSelected}
          onToggle={toggleAuspice}
        />
      )}
      {!isGhostWolf && tribeGiftLists.length > 0 && (
        <GiftSection
          label="Tribe Gifts"
          giftLists={tribeGiftLists}
          maxPicks={tribePicks}
          maxLevel={maxLevel}
          selected={tribeSelected}
          onToggle={toggleTribe}
        />
      )}
    </div>
  )
}

function RoteSection({ arcanaDots, budget, selected, invalid, onToggle }) {
  const ratedArcana = Object.keys(arcanaDots).filter(id => arcanaDots[id] > 0 && SPELLS[id])
  const [activeTab, setActiveTab] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const active = ratedArcana.includes(activeTab) ? activeTab : ratedArcana[0] ?? null
  const listData = active ? SPELLS[active] : null
  const spent = selected.reduce((s, id) => s + (SPELL_INDEX[id]?.level || 0), 0)

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
        Rotes
        <span className={`text-xs px-2 py-0.5 rounded ${
          spent === budget ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
        }`}>
          {spent} of {budget} dots
        </span>
      </h3>
      <p className="text-gray-400 text-sm mb-3">
        Spend {budget} dots on rotes. A rote costs its spell's level and needs that many dots in its Arcanum.
      </p>

      {invalid.length > 0 && (
        <div className="mb-3 p-2 rounded border border-red-700 bg-red-950/40">
          <p className="text-xs text-red-300 mb-1">These rotes exceed your current Arcana — click to remove:</p>
          <div className="flex gap-1 flex-wrap">
            {invalid.map(id => (
              <button key={id} onClick={() => onToggle(id)} className="px-2 py-0.5 text-xs rounded bg-red-900 text-red-200 hover:bg-red-800">
                {SPELL_INDEX[id]?.name ?? id} ✕
              </button>
            ))}
          </div>
        </div>
      )}

      {ratedArcana.length === 0 && (
        <p className="text-gray-600 text-sm">Allocate Arcana dots above to unlock rote choices.</p>
      )}

      <div className="flex gap-1 flex-wrap mb-3">
        {ratedArcana.map(id => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-3 py-1 text-xs rounded ${
              active === id ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {SPELLS[id].name}
          </button>
        ))}
      </div>

      {listData && (
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {[...listData.spells].sort((a, b) => a.level - b.level).map(spell => {
            const isSelected = selected.includes(spell.id)
            const isLocked = spell.level > arcanaDots[active]
            const overBudget = !isSelected && spent + spell.level > budget
            const isDisabled = isLocked || overBudget
            const isExpanded = expanded === spell.id

            return (
              <div
                key={spell.id}
                className={`p-2 rounded border transition-colors ${
                  isSelected
                    ? 'border-amber-400 bg-gray-800'
                    : isDisabled
                    ? 'border-gray-800 opacity-40'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div
                  className={`flex items-center justify-between gap-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => !isDisabled && onToggle(spell.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs shrink-0 tracking-widest ${isDisabled ? 'text-gray-700' : 'text-amber-500'}`}>
                      {'●'.repeat(spell.level)}
                    </span>
                    <span className={`text-sm font-medium ${isSelected ? 'text-gray-100' : isDisabled ? 'text-gray-600' : 'text-gray-300'}`}>
                      {spell.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && <span className="text-amber-400 text-xs">✓</span>}
                    {isLocked
                      ? <span className="text-xs text-gray-700">{'●'.repeat(spell.level)} req.</span>
                      : <span className="text-xs text-gray-600">{spell.aspect} · {spell.cost}</span>
                    }
                    <button
                      onClick={e => { e.stopPropagation(); setExpanded(isExpanded ? null : spell.id) }}
                      className="text-xs text-gray-600 select-none px-1"
                    >
                      {isExpanded ? '▾' : '▸'}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-1 ml-1 border-l-2 border-gray-700 pl-3 text-xs space-y-0.5">
                    <p className={isSelected ? 'text-gray-400' : 'text-gray-500'}>{spell.description}</p>
                    <p className="text-gray-600">{spell.practice} · {spell.action} · {spell.aspect} · Cost: {spell.cost}</p>
                    {spell.dice !== '—' && <p className="text-gray-600">Rote pool: {spell.dice}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ArcanaPowers({ lineData, template, powers, onSetPowers }) {
  const { items, totalDots, maxPerArcanum, rulingFrom, description } = lineData.powers
  const pathGroup = rulingFrom ? lineData.template[rulingFrom] : null
  const pathId = pathGroup ? template[pathGroup.field] : null
  const pathOption = pathId ? pathGroup.options.find(o => o.id === pathId) : null
  const rulingIds = pathId ? items.filter(i => i.affinityFor?.includes(pathId)).map(i => i.id) : []
  const inferiorId = pathOption?.inferiorArcanum ?? null

  const arcanaDots = Object.fromEntries(items.map(i => [i.id, powers[i.id] || 0]))
  const spent = Object.values(arcanaDots).reduce((s, v) => s + v, 0)
  const remaining = totalDots - spent
  const errors = validateArcana(powers, { rulingIds, inferiorId })
  const selectedRotes = powers._rotes || []
  const invalidRotes = findInvalidRotes(powers)

  const handleChange = (id, v) => onSetPowers({ ...powers, [id]: v })

  const toggleRote = spellId => {
    const next = selectedRotes.includes(spellId)
      ? selectedRotes.filter(id => id !== spellId)
      : [...selectedRotes, spellId]
    onSetPowers({ ...powers, _rotes: next })
  }

  return (
    <div>
      <p className="text-gray-400 mb-2">{description}</p>
      <p className={`text-sm mb-2 font-medium ${remaining < 0 ? 'text-red-400' : 'text-amber-400'}`}>
        {remaining} dots remaining
      </p>
      {errors.length > 0 && (
        <ul className="text-xs text-red-400 mb-3 space-y-0.5">
          {errors.map(e => <li key={e}>{e}</li>)}
        </ul>
      )}
      <div className="space-y-1 max-w-sm">
        {items.map(item => {
          const isRuling = rulingIds.includes(item.id)
          const isInferior = item.id === inferiorId
          const itemMax = isInferior ? 2 : maxPerArcanum
          return (
            <div key={item.id} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300 w-28">{item.name}</span>
                {isRuling && <span className="text-xs text-amber-500 bg-amber-900/30 px-1 rounded">Ruling</span>}
                {isInferior && <span className="text-xs text-gray-500 bg-gray-800 px-1 rounded">Inferior</span>}
              </div>
              <DotRating value={arcanaDots[item.id]} max={itemMax} onChange={v => handleChange(item.id, v)} />
            </div>
          )
        })}
      </div>
      <RoteSection
        arcanaDots={arcanaDots}
        budget={lineData.rotes?.budget ?? 6}
        selected={selectedRotes}
        invalid={invalidRotes}
        onToggle={toggleRote}
      />
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

function UtteranceEntry({ utterance, isSelected, isDisabled, definingPillarName, onToggle }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`p-2 rounded border transition-colors ${
      isSelected ? 'border-amber-400 bg-gray-800' : isDisabled ? 'border-gray-800 opacity-40' : 'border-gray-700 text-gray-400 hover:border-gray-500'
    }`}>
      <div
        className={`flex items-center justify-between gap-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={isDisabled ? undefined : onToggle}
      >
        <span className={`text-sm font-medium ${isSelected ? 'text-gray-100' : isDisabled ? 'text-gray-600' : 'text-gray-300'}`}>
          {utterance.name}
        </span>
        <div className="flex items-center gap-2">
          {isSelected && <span className="text-amber-400 text-xs">✓</span>}
          <button
            onClick={e => { e.stopPropagation(); setExpanded(x => !x) }}
            className="text-xs text-gray-600 select-none px-1"
          >
            {expanded ? '▾' : '▸'}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-1 ml-1 border-l-2 border-gray-700 pl-3 text-xs space-y-1">
          {utterance.tiers.map(tier => {
            const pillarLabel = tier.pillar === 'defining'
              ? `${definingPillarName ?? 'Defining'} [Defining]`
              : tier.pillar.charAt(0).toUpperCase() + tier.pillar.slice(1)
            return (
              <div key={tier.tier} className="text-gray-500">
                <span className="text-amber-600">Tier {tier.tier}:</span>{' '}
                {pillarLabel} {'●'.repeat(tier.level)}
                {tier.tags.length > 0 ? ` [${tier.tags.join(', ')}]` : ''} — {tier.description}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PillarsPowers({ lineData, template, powers, onSetPowers }) {
  const { items, totalDots, definingFrom, description } = lineData.powers
  const decreeGroup = definingFrom ? lineData.template[definingFrom] : null
  const decreeId = decreeGroup ? template[decreeGroup.field] : null
  const decreeOption = decreeId ? decreeGroup.options.find(o => o.id === decreeId) : null
  const definingPillarId = decreeOption?.definingPillar ?? null

  const guildGroup = lineData.template.group2
  const guildId = template[guildGroup.field]
  const guildOption = guildId ? guildGroup.options.find(o => o.id === guildId) : null
  const guildAffinityId = guildOption?.guildAffinity ?? null

  const spent = pillarPointsSpent(powers)
  const errors = definingPillarId ? validatePillars(powers, { definingPillarId }) : ['Choose a Decree first.']
  const isValid = errors.length === 0

  const soulAffinities = definingPillarId
    ? AFFINITIES.filter(a => a.type === 'soul' && a.pillar === definingPillarId)
    : []
  const guildAffinity = guildAffinityId ? AFFINITIES.find(a => a.id === guildAffinityId) : null

  const selectedSoul = powers._soul_affinity || soulAffinities[0]?.id || null
  const selectedFree = powers._free_affinity || null
  const selectedUtterances = powers._utterances || []

  useEffect(() => {
    if (!powers._soul_affinity && soulAffinities.length > 0) {
      onSetPowers({ ...powers, _soul_affinity: soulAffinities[0].id })
    }
  }, [definingPillarId])

  const allPillarsRated = items.every(i => (powers[i.id] || 0) >= 1)
  const utteranceSlots = allPillarsRated ? 2 : 1
  const eligibleUtterances = isValid ? UTTERANCES.filter(u => utteranceQualifies(u, powers)) : []

  const excludeIds = new Set([selectedSoul, guildAffinityId].filter(Boolean))
  const freeAffinityList = isValid
    ? AFFINITIES.filter(a => {
        if (a.type === 'guild') return false
        if (excludeIds.has(a.id)) return false
        if (a.pillar && a.prerequisite != null) return (powers[a.pillar] || 0) >= a.prerequisite
        return true
      })
    : []

  const handlePillarChange = (id, v) => {
    const next = { ...powers, [id]: v }
    if (pillarPointsSpent(next) <= totalDots || v < (powers[id] || 0)) onSetPowers(next)
  }

  const setSoulAffinity = id => onSetPowers({ ...powers, _soul_affinity: id })
  const toggleFreeAffinity = id =>
    onSetPowers({ ...powers, _free_affinity: selectedFree === id ? null : id })
  const toggleUtterance = id => {
    const next = selectedUtterances.includes(id)
      ? selectedUtterances.filter(u => u !== id)
      : selectedUtterances.length < utteranceSlots ? [...selectedUtterances, id] : selectedUtterances
    onSetPowers({ ...powers, _utterances: next })
  }

  const definingPillarName = items.find(i => i.id === definingPillarId)?.name ?? null

  return (
    <div>
      <p className="text-gray-400 mb-2">{description}</p>
      <p className={`text-sm mb-2 font-medium ${spent > totalDots ? 'text-red-400' : 'text-amber-400'}`}>
        {spent} of {totalDots} dot-points spent (5th dot costs 2)
      </p>
      {errors.length > 0 && (
        <ul className="text-xs text-red-400 mb-3 space-y-0.5">
          {errors.map(e => <li key={e}>{e}</li>)}
        </ul>
      )}
      <div className="space-y-1 max-w-sm mb-8">
        {items.map(item => {
          const isDefining = item.id === definingPillarId
          const maxDots = isDefining ? 5 : Math.min(5, powers[definingPillarId] || 0)
          return (
            <div key={item.id} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300 w-28">{item.name}</span>
                {isDefining && <span className="text-xs text-amber-500 bg-amber-900/30 px-1 rounded">Defining</span>}
              </div>
              <DotRating value={powers[item.id] || 0} max={maxDots} onChange={v => handlePillarChange(item.id, v)} />
            </div>
          )
        })}
      </div>

      {!isValid && (
        <p className="text-gray-600 text-sm">Complete your Pillar allocation above to unlock Affinities and Utterances.</p>
      )}

      {isValid && (
        <>
          <div className="mb-8">
            <h3 className="font-semibold text-gray-200 mb-4">Affinities</h3>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Soul Affinity (from Decree)</p>
              <select
                value={selectedSoul || ''}
                onChange={e => setSoulAffinity(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100 w-full max-w-sm"
              >
                {soulAffinities.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Guild Affinity (from Guild)</p>
              <p className="text-sm text-gray-300">{guildAffinity?.name ?? '—'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Free Affinity — pick one you qualify for</p>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {freeAffinityList.map(a => {
                  const isSelected = selectedFree === a.id
                  const prereqLabel = a.pillar && a.prerequisite != null
                    ? `${a.pillar} ${'●'.repeat(a.prerequisite)}`
                    : a.cultPrerequisite ? `Cult ${a.cultPrerequisite} (check)` : '—'
                  return (
                    <div
                      key={a.id}
                      onClick={() => toggleFreeAffinity(a.id)}
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        isSelected ? 'border-amber-400 bg-gray-800' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isSelected ? 'text-gray-100' : 'text-gray-300'}`}>{a.name}</span>
                        <span className="text-xs text-amber-500 shrink-0 ml-2">{prereqLabel}</span>
                      </div>
                      <p className={`text-xs mt-1 ${isSelected ? 'text-gray-400' : 'text-gray-600'}`}>{a.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-200 mb-1 flex items-center gap-2">
              Utterances
              <span className={`text-xs px-2 py-0.5 rounded ${
                selectedUtterances.length === utteranceSlots ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
              }`}>
                {selectedUtterances.length} of {utteranceSlots}
              </span>
            </h3>
            {allPillarsRated && (
              <p className="text-xs text-amber-500 mb-2">All Pillars rated — bonus Utterance unlocked!</p>
            )}
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1 mt-3">
              {eligibleUtterances.map(u => {
                const isSelected = selectedUtterances.includes(u.id)
                const isMaxed = !isSelected && selectedUtterances.length >= utteranceSlots
                return (
                  <UtteranceEntry
                    key={u.id}
                    utterance={u}
                    isSelected={isSelected}
                    isDisabled={isMaxed}
                    definingPillarName={definingPillarName}
                    onToggle={() => toggleUtterance(u.id)}
                  />
                )
              })}
              {eligibleUtterances.length === 0 && (
                <p className="text-gray-600 text-sm">No Utterances available for your current Pillar allocation.</p>
              )}
            </div>
          </div>
        </>
      )}
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
        : type === 'gifts'
          ? <GiftsPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} renown={renown} />
          : type === 'arcana'
            ? <ArcanaPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} />
            : type === 'pillars'
              ? <PillarsPowers lineData={lineData} template={template} powers={powers} onSetPowers={onSetPowers} />
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
