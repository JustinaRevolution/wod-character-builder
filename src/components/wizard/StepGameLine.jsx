import vampire     from '../../data/lines/vampire.json'
import werewolf    from '../../data/lines/werewolf.json'
import mage        from '../../data/lines/mage.json'
import mummy       from '../../data/lines/mummy.json'
import hunter      from '../../data/lines/hunter.json'
import changeling  from '../../data/lines/changeling.json'
import promethean  from '../../data/lines/promethean.json'
import geist       from '../../data/lines/geist.json'
import secondSight from '../../data/lines/second-sight.json'
import mortal      from '../../data/lines/mortal.json'

const LINES = [vampire, werewolf, mage, mummy, hunter, changeling, promethean, geist, secondSight, mortal]

export default function StepGameLine({ selectedLine, onSelect }) {
  return (
    <div>
      <h2 className="wod-heading text-2xl font-bold mb-4">Choose Your Game Line</h2>
      <p className="text-wod-stone mb-6">Select the Chronicles of Darkness line you want to play.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LINES.map(line => (
          <button
            key={line.id}
            onClick={() => onSelect(line.id)}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              selectedLine === line.id
                ? 'bg-gray-800'
                : 'border-wod-border bg-gray-900 hover:border-gray-600'
            }`}
            style={selectedLine === line.id ? { borderColor: line.color } : {}}
          >
            <h3 className="font-bold text-lg font-cinzel" style={{ color: line.color }}>{line.name}</h3>
          </button>
        ))}
      </div>
    </div>
  )
}

export { LINES }
