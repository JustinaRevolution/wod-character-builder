export default function StepIndicator({ steps, currentStep, onGoTo }) {
  return (
    <div className="flex items-center gap-1 flex-wrap mb-8">
      {steps.map((step, i) => {
        const done    = i < currentStep
        const active  = i === currentStep
        return (
          <button
            key={i}
            onClick={() => i < currentStep && onGoTo(i)}
            disabled={i > currentStep}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              active  ? 'bg-amber-600 text-white'
              : done  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer'
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
