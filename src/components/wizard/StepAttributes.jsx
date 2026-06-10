import DotRating from '../ui/DotRating'

const CATEGORIES = [
  { key: 'mental',   label: 'Mental',   attrs: ['intelligence','wits','resolve'] },
  { key: 'physical', label: 'Physical', attrs: ['strength','dexterity','stamina'] },
  { key: 'social',   label: 'Social',   attrs: ['presence','manipulation','composure'] },
]

const BUDGETS = { primary: 5, secondary: 4, tertiary: 3 }

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

export default function StepAttributes({ attributes, priority, onUpdate, onSetPriority }) {
  const assignPriority = (cat, level) => {
    const current = Object.entries(priority).find(([, v]) => v === level)?.[0]
    const newPriority = { ...priority, [cat]: level }
    if (current && current !== cat) newPriority[current] = priority[cat]
    onSetPriority(newPriority)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Attributes</h2>
      <p className="text-gray-400 mb-6">All attributes start at 1. Prioritize your categories, then spend your dots.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CATEGORIES.map(({ key, label, attrs }) => {
          const level = priority[key] || 'tertiary'
          const budget = BUDGETS[level]
          const spent = attrs.reduce((sum, a) => sum + (attributes[key][a] - 1), 0)
          const remaining = budget - spent
          return (
            <div key={key} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-100">{label}</h3>
                <select
                  value={level}
                  onChange={e => assignPriority(key, e.target.value)}
                  className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-300"
                >
                  <option value="primary">Primary (5 dots)</option>
                  <option value="secondary">Secondary (4 dots)</option>
                  <option value="tertiary">Tertiary (3 dots)</option>
                </select>
              </div>
              <div className={`text-xs mb-3 ${remaining < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                {remaining} dots remaining
              </div>
              <div className="space-y-2">
                {attrs.map(attr => (
                  <div key={attr} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 w-28">{capitalize(attr)}</span>
                    <DotRating
                      value={attributes[key][attr]}
                      max={5}
                      onChange={v => onUpdate(key, attr, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
