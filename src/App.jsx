import { useState } from 'react'
import { validateArcana, findInvalidRotes } from './utils/arcanaValidation'
import { validatePillars } from './utils/pillarValidation'
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
    setAttributePriority, setSkillPriority,
    addSpecialty, removeSpecialty,
    updateTemplate, setPowers, setRenown,
    addMerit, removeMerit,
    setDerived, updateNotes, resetCharacter, importCharacter,
  } = useCharacter()

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${character.meta.name || 'character'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try { importCharacter(JSON.parse(ev.target.result)) } catch { /* ignore malformed files */ }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const lineData = LINES.find(l => l.id === character.meta.line) || null

  const canAdvance = () => {
    if (step === 0) return !!character.meta.line
    if (step === 3) {
      const budgets = { primary: 5, secondary: 4, tertiary: 3 }
      return [
        { key: 'mental',   attrs: ['intelligence','wits','resolve'] },
        { key: 'physical', attrs: ['strength','dexterity','stamina'] },
        { key: 'social',   attrs: ['presence','manipulation','composure'] },
      ].every(({ key, attrs }) => {
        const spent = attrs.reduce((s, a) => s + (character.attributes[key][a] - 1), 0)
        return spent <= budgets[character.attributePriority[key]]
      })
    }
    if (step === 4) {
      const budgets = { primary: 11, secondary: 7, tertiary: 4 }
      return [
        { key: 'mental',   skills: ['academics','computer','crafts','investigation','medicine','occult','politics','science'] },
        { key: 'physical', skills: ['athletics','brawl','drive','firearms','larceny','stealth','survival','weaponry'] },
        { key: 'social',   skills: ['animal_ken','empathy','expression','intimidation','persuasion','socialize','streetwise','subterfuge'] },
      ].every(({ key, skills: sk }) => {
        const spent = sk.reduce((s, skill) => s + character.skills[key][skill], 0)
        return spent <= budgets[character.skillPriority[key]]
      })
    }
    if (step === 5 && lineData?.powers?.type === 'arcana') {
      const pathGroup = lineData.template[lineData.powers.rulingFrom]
      const pathId = character.template[pathGroup.field]
      const pathOption = pathGroup.options.find(o => o.id === pathId)
      const rulingIds = lineData.powers.items
        .filter(i => i.affinityFor?.includes(pathId))
        .map(i => i.id)
      return validateArcana(character.powers, {
        rulingIds,
        inferiorId: pathOption?.inferiorArcanum ?? null,
      }).length === 0 && findInvalidRotes(character.powers).length === 0
    }
    if (step === 5 && lineData?.powers?.type === 'pillars') {
      const decreeGroup = lineData.template[lineData.powers.definingFrom]
      const decreeId = character.template[decreeGroup.field]
      const decreeOption = decreeGroup.options.find(o => o.id === decreeId)
      const definingPillarId = decreeOption?.definingPillar ?? null
      if (!definingPillarId) return false
      return (
        validatePillars(character.powers, { definingPillarId }).length === 0 &&
        !!character.powers._free_affinity &&
        (character.powers._utterances || []).length >= 1
      )
    }
    return true
  }

  const renderStep = () => {
    switch (step) {
      case 0: return <StepGameLine selectedLine={character.meta.line} onSelect={id => updateMeta('line', id)} />
      case 1: return <StepConcept meta={character.meta} onChange={updateMeta} />
      case 2: return lineData ? <StepTemplate lineData={lineData} template={character.template} onUpdate={updateTemplate} /> : null
      case 3: return <StepAttributes attributes={character.attributes} priority={character.attributePriority} onUpdate={updateAttribute} onSetPriority={setAttributePriority} />
      case 4: return <StepSkills skills={character.skills} priority={character.skillPriority} specialties={character.specialties} onUpdateSkill={updateSkill} onSetPriority={setSkillPriority} onAddSpecialty={addSpecialty} onRemoveSpecialty={removeSpecialty} />
      case 5: return lineData ? <StepPowers lineData={lineData} template={character.template} powers={character.powers} onSetPowers={setPowers} renown={character.renown} onSetRenown={setRenown} /> : null
      case 6: return <StepMerits merits={character.merits} onAdd={addMerit} onRemove={removeMerit} lineId={lineData?.id} />
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
            <div className="flex items-center gap-2">
              <button onClick={handleExport} className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-2 py-1 rounded">
                Export
              </button>
              <label className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-2 py-1 rounded cursor-pointer">
                Import
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              <button onClick={resetCharacter} className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-2 py-1 rounded">
                Start Over
              </button>
            </div>
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
