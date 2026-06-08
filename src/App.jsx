import { useState } from 'react'
import useCharacter from './hooks/useCharacter'
import StepIndicator from './components/ui/StepIndicator'
import StepGameLine, { LINES } from './components/wizard/StepGameLine'
import StepConcept    from './components/wizard/StepConcept'
import StepTemplate   from './components/wizard/StepTemplate'
import StepAttributes from './components/wizard/StepAttributes'
import StepSkills     from './components/wizard/StepSkills'
import StepPowers     from './components/wizard/StepPowers'
import StepMerits     from './components/wizard/StepMerits'
import StepDerived    from './components/wizard/StepDerived'
import StepReview     from './components/wizard/StepReview'
import CharacterSheet from './components/sheet/CharacterSheet'

const STEP_LABELS = ['Game Line','Concept','Template','Attributes','Skills','Powers','Merits','Derived','Review']

export default function App() {
  const [step, setStep] = useState(0)
  const {
    character,
    updateMeta, updateAttribute, updateSkill,
    addSpecialty, removeSpecialty,
    updateTemplate, setPowers,
    addMerit, removeMerit,
    setDerived, updateNotes, resetCharacter,
  } = useCharacter()

  const lineData = LINES.find(l => l.id === character.meta.line) || null

  const canAdvance = () => {
    if (step === 0) return !!character.meta.line
    return true
  }

  const renderStep = () => {
    switch (step) {
      case 0: return <StepGameLine selectedLine={character.meta.line} onSelect={id => updateMeta('line', id)} />
      case 1: return <StepConcept meta={character.meta} onChange={updateMeta} />
      case 2: return lineData ? <StepTemplate lineData={lineData} template={character.template} onUpdate={updateTemplate} /> : null
      case 3: return <StepAttributes attributes={character.attributes} onUpdate={updateAttribute} />
      case 4: return <StepSkills skills={character.skills} specialties={character.specialties} onUpdateSkill={updateSkill} onAddSpecialty={addSpecialty} onRemoveSpecialty={removeSpecialty} />
      case 5: return lineData ? <StepPowers lineData={lineData} template={character.template} powers={character.powers} onSetPowers={setPowers} /> : null
      case 6: return <StepMerits merits={character.merits} onAdd={addMerit} onRemove={removeMerit} />
      case 7: return lineData ? <StepDerived character={character} lineData={lineData} setDerived={setDerived} /> : null
      case 8: return lineData ? <StepReview character={character} lineData={lineData} onUpdateNotes={updateNotes} /> : null
      default: return null
    }
  }

  return (
    <>
      {/* Wizard — hidden on print */}
      <div className="no-print min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-amber-400">Chronicles of Darkness</h1>
            <button onClick={resetCharacter} className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-2 py-1 rounded">
              Start Over
            </button>
          </div>

          <StepIndicator steps={STEP_LABELS} currentStep={step} onGoTo={setStep} />

          <div className="mb-8">{renderStep()}</div>

          <div className="flex gap-4">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="px-5 py-2 border border-gray-600 rounded text-gray-300 hover:border-gray-400">
                ← Back
              </button>
            )}
            {step < STEP_LABELS.length - 1 && (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed rounded text-white font-medium"
              >
                Next →
              </button>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-600">Draft saved automatically.</div>
        </div>
      </div>

      {/* Print sheet — hidden on screen, shown on print */}
      {lineData && <CharacterSheet character={character} lineData={lineData} />}
    </>
  )
}
