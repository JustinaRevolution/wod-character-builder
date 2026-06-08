import { useEffect } from 'react'
import calculateDerived from '../../utils/calculateDerived'

function StatBox({ label, value, sub }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className="text-2xl font-bold text-amber-400">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  )
}

export default function StepDerived({ character, lineData, setDerived }) {
  const derived = calculateDerived(character.attributes, lineData)

  useEffect(() => {
    setDerived(derived)
  }, [character.attributes, lineData.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Derived Traits</h2>
      <p className="text-gray-400 mb-6">Calculated automatically from your Attributes.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatBox label="Health"     value={derived.health}     sub="boxes" />
        <StatBox label="Willpower"  value={derived.willpower}  sub="boxes" />
        <StatBox label="Speed"      value={derived.speed}      />
        <StatBox label="Defense"    value={derived.defense}    />
        <StatBox label="Initiative" value={derived.initiative} />
        {derived.resource_pool.name && (
          <StatBox label={derived.resource_pool.name} value={derived.resource_pool.max} sub="max" />
        )}
        {derived.integrity.name && (
          <StatBox label={derived.integrity.name} value={derived.integrity.value} sub="starting" />
        )}
        {derived.supernatural_trait.name && (
          <StatBox label={derived.supernatural_trait.name} value={derived.supernatural_trait.value} sub="starting" />
        )}
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <div>Health = Stamina ({character.attributes.physical.stamina}) + 5</div>
        <div>Willpower = Resolve ({character.attributes.mental.resolve}) + Composure ({character.attributes.social.composure})</div>
        <div>Speed = Strength + Dexterity + 5</div>
        <div>Defense = lowest of Wits / Dexterity</div>
        <div>Initiative = Dexterity + Composure</div>
      </div>
    </div>
  )
}
