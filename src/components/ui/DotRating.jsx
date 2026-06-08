export default function DotRating({ value, max = 5, onChange }) {
  const dots = Array.from({ length: max }, (_, i) => i + 1)

  if (!onChange) {
    return (
      <span className="tracking-widest text-sm select-none">
        {dots.map(i => (
          <span key={i} className={i <= value ? 'text-amber-400' : 'text-gray-600'}>●</span>
        ))}
      </span>
    )
  }

  return (
    <span className="tracking-widest">
      {dots.map(i => (
        <button
          key={i}
          role="button"
          aria-pressed={i <= value}
          onClick={() => onChange(i === value ? i - 1 : i)}
          className={`text-base transition-colors ${i <= value ? 'text-amber-400 hover:text-amber-300' : 'text-gray-600 hover:text-gray-400'}`}
        >
          ●
        </button>
      ))}
    </span>
  )
}
