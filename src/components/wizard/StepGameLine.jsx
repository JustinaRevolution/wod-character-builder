import vampire     from '../../data/lines/vampire.json'
import werewolf    from '../../data/lines/werewolf.json'
import mage        from '../../data/lines/mage.json'
import mummy       from '../../data/lines/mummy.json'
import hunter      from '../../data/lines/hunter.json'
import changeling  from '../../data/lines/changeling.json'
import promethean  from '../../data/lines/promethean.json'
import geist       from '../../data/lines/geist.json'
import secondSight from '../../data/lines/second-sight.json'

const LINES = [vampire, werewolf, mage, mummy, hunter, changeling, promethean, geist, secondSight]

export default function StepGameLine({ selectedLine, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Choose Your Game Line</h2>
      <p className="text-gray-400 mb-6">Select the Chronicles of Darkness line you want to play.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LINES.map(line => (
          <button
            key={line.id}
            onClick={() => onSelect(line.id)}
            className={`text-left p-4 rounded-lg border-2 transition-all hover:border-gray-400 ${
              selectedLine === line.id
                ? 'ring-2 ring-amber-400 border-amber-400 bg-gray-800'
                : 'border-gray-700 bg-gray-900'
            }`}
          >
            <h3 className="font-bold text-lg" style={{ color: line.color }}>{line.name}</h3>
          </button>
        ))}
      </div>
    </div>
  )
}

export { LINES }
