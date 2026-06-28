export default function StepIndicator({ steps, currentStep, onGoTo }) {
  return (
    <div className="flex items-center gap-1 flex-wrap mb-8">
      {steps.map((step, i) => {
        const done   = i < currentStep
        const active = i === currentStep
        return (
          <button
            key={i}
            onClick={() => i < currentStep && onGoTo(i)}
            disabled={i > currentStep}
            style={{ fontFamily: 'Cinzel, serif' }}
            className={`px-3 py-1 rounded text-xs font-medium tracking-wide transition-all ${
              active  ? 'bg-wod-red text-wod-cream'
              : done  ? 'bg-gray-700 text-wod-stone hover:bg-gray-600 hover:text-wod-cream cursor-pointer'
              :         'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {i + 1}. {step}
          </button>
        )
      })}
    </div>
  )
}
