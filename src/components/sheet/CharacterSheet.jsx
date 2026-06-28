import DotRating from '../ui/DotRating'
import { SPELL_INDEX } from '../../utils/arcanaValidation'
import AFFINITIES from '../../data/affinities.json'
import UTTERANCES from '../../data/utterances.json'

const ATTR_CATS = [
  { key: 'mental',   attrs: ['intelligence','wits','resolve'] },
  { key: 'physical', attrs: ['strength','dexterity','stamina'] },
  { key: 'social',   attrs: ['presence','manipulation','composure'] },
]

const SKILL_CATS = [
  { key: 'mental',   catLabel: 'Mental',   penalty: '-3 unskilled', skills: ['academics','computer','crafts','investigation','medicine','occult','politics','science'] },
  { key: 'physical', catLabel: 'Physical', penalty: '-1 unskilled', skills: ['athletics','brawl','drive','firearms','larceny','stealth','survival','weaponry'] },
  { key: 'social',   catLabel: 'Social',   penalty: '-1 unskilled', skills: ['animal_ken','empathy','expression','intimidation','persuasion','socialize','streetwise','subterfuge'] },
]

const skillLabel = s => s === 'animal_ken' ? 'Animal Ken' : s.charAt(0).toUpperCase() + s.slice(1)
const attrLabel  = s => s.charAt(0).toUpperCase() + s.slice(1)

const traitRow     = { display: 'flex', alignItems: 'baseline', marginBottom: '2px', gap: '3px' }
const dotLeader    = { flex: 1, borderBottom: '1px dotted #bbb', marginBottom: '2px' }
const sectionHead  = { fontWeight: 'bold', fontSize: '8pt', letterSpacing: '1px', borderBottom: '1px solid #000', marginBottom: '5px' }

export default function CharacterSheet({ character, lineData }) {
  const { meta, template, attributes, skills, specialties, powers, renown = {}, merits, derived, notes } = character
  const g1 = lineData.template.group1
  const g2 = lineData.template.group2

  const templateLine = [
    g1 && template[g1.field] && `${g1.label}: ${g1.options.find(o => o.id === template[g1.field])?.name || template[g1.field]}`,
    g2 && !g2.freeform && template[g2.field] && `${g2.label}: ${g2.options.find(o => o.id === template[g2.field])?.name || template[g2.field]}`,
    g2?.freeform && template[g2.field] && `${g2.label}: ${template[g2.field]}`,
  ].filter(Boolean).join('  |  ')

  const powerEntries = Object.entries(powers).filter(([k]) => !k.startsWith('_'))
  const selectedKeys = powers._keys || []

  const hasPowers =
    (lineData.powers.picksFrom?.length > 0) ||
    (lineData.powers.items?.length > 0)

  const integrityName  = (derived.integrity.name || 'Integrity').toUpperCase()
  const integrityValue = derived.integrity.value

  return (
    <div className="print-only" style={{ fontFamily: 'Georgia, serif', fontSize: '9pt', color: '#000', background: '#fff', padding: '1cm' }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: '2px solid #000', paddingBottom: '6px', marginBottom: '10px' }}>
        <div style={{ textAlign: 'center', fontSize: '13pt', fontWeight: 'bold', letterSpacing: '3px', marginBottom: '5px' }}>
          {lineData.name.toUpperCase()}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px', fontSize: '8pt' }}>
          {[['Name', meta.name], ['Concept', meta.concept], ['Player', meta.player],
            ['Virtue', meta.virtue], ['Vice', meta.vice], ['Chronicle', meta.chronicle]].map(([lbl, val]) => (
            <div key={lbl} style={{ borderBottom: '1px solid #999', paddingBottom: '1px' }}>
              <span style={{ color: '#555', fontSize: '7pt' }}>{lbl}: </span>{val}
            </div>
          ))}
        </div>
        {templateLine && <div style={{ marginTop: '3px', fontSize: '8pt', color: '#555' }}>{templateLine}</div>}
      </div>

      {/* ── Attributes (unchanged) ── */}
      <div style={{ marginBottom: '10px' }}>
        <div style={sectionHead}>ATTRIBUTES</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '8pt' }}>
          {ATTR_CATS.map(({ key, attrs }) => (
            <div key={key}>
              <div style={{ textAlign: 'center', color: '#555', fontSize: '7pt', marginBottom: '4px' }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </div>
              {attrs.map(a => (
                <div key={a} style={traitRow}>
                  <span>{attrLabel(a)}</span>
                  <span style={dotLeader} />
                  <DotRating value={attributes[key][a]} max={5} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column body: Skills (45%) | Other Traits (55%) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '45% 55%', gap: '16px', marginBottom: '10px' }}>

        {/* Left column: Skills */}
        <div>
          <div style={sectionHead}>SKILLS</div>
          {SKILL_CATS.map(({ key, catLabel, penalty, skills: sk }) => (
            <div key={key} style={{ marginBottom: '8px' }}>
              <div style={{ textAlign: 'center', fontStyle: 'italic', fontWeight: 'bold', fontSize: '8pt' }}>{catLabel}</div>
              <div style={{ textAlign: 'center', color: '#777', fontSize: '7pt', marginBottom: '4px' }}>{penalty}</div>
              {sk.map(s => (
                <div key={s} style={traitRow}>
                  <span style={{ fontSize: '8pt' }}>{skillLabel(s)}</span>
                  <span style={dotLeader} />
                  <DotRating value={skills[key][s]} max={5} />
                </div>
              ))}
            </div>
          ))}
          {specialties.length > 0 && (
            <div style={{ marginTop: '4px', fontSize: '7.5pt' }}>
              <strong>Specialties: </strong>{specialties.map(s => `${s.skill} (${s.name})`).join(', ')}
            </div>
          )}
        </div>

        {/* Right column: Other Traits — sub-split 60% | 40% */}
        <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: '8px' }}>

          {/* Right-left: Merits */}
          <div>
            <div style={sectionHead}>MERITS</div>
            <div style={{ fontSize: '8pt' }}>
              {merits.map((m, i) => (
                <div key={i} style={traitRow}>
                  <span>{m.name}</span>
                  <span style={dotLeader} />
                  <DotRating value={m.dots} max={5} />
                </div>
              ))}
            </div>
          </div>

          {/* Right-right: Health / Willpower / Integrity / Derived */}
          <div style={{ fontSize: '8pt' }}>

            {/* Health */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '7pt', letterSpacing: '1px', marginBottom: '2px' }}>HEALTH</div>
              <div style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{'●'.repeat(derived.health)}</div>
              <div style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{'□'.repeat(derived.health)}</div>
            </div>

            {/* Willpower */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '7pt', letterSpacing: '1px', marginBottom: '2px' }}>WILLPOWER</div>
              <div style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{'●'.repeat(derived.willpower)}</div>
              <div style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{'□'.repeat(derived.willpower)}</div>
            </div>

            {/* Resource pool (supernatural lines only) */}
            {derived.resource_pool.name && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '7pt', letterSpacing: '1px', marginBottom: '2px' }}>{derived.resource_pool.name.toUpperCase()}</div>
                <div style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{'●'.repeat(Math.min(derived.resource_pool.max, 15))}</div>
                <div style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{'□'.repeat(Math.min(derived.resource_pool.max, 15))}</div>
              </div>
            )}

            {/* Integrity track */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '7pt', letterSpacing: '1px', marginBottom: '2px' }}>{integrityName}</div>
              {[10,9,8,7,6,5,4,3,2,1].map(n => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '1px' }}>
                  <span style={{ fontSize: '7pt', width: '10px', textAlign: 'right' }}>{n}</span>
                  <span style={{ flex: 1, borderBottom: '1px dotted #ccc', marginBottom: '1px' }} />
                  <span style={{ fontSize: '8pt' }}>{n === integrityValue ? '●' : '○'}</span>
                </div>
              ))}
            </div>

            {/* Derived stats */}
            <div>
              {[
                ['Size', '5'],
                ['Speed', String(derived.speed)],
                ['Defense', String(derived.defense)],
                ['Initiative', String(derived.initiative)],
                ['Experience', ''],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ display: 'flex', gap: '3px', fontSize: '7.5pt', marginBottom: '2px' }}>
                  <span style={{ color: '#555' }}>{lbl}:</span>
                  <span>{val}</span>
                </div>
              ))}
              {derived.supernatural_trait?.name && (
                <div style={{ display: 'flex', gap: '3px', fontSize: '7.5pt', marginBottom: '2px' }}>
                  <span style={{ color: '#555' }}>{derived.supernatural_trait.name}:</span>
                  <span>{derived.supernatural_trait.value}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Powers add-on block (supernatural lines only) ── */}
      {hasPowers && (
        <div style={{ borderTop: '1px solid #000', paddingTop: '6px', marginBottom: '10px' }}>
          <div style={sectionHead}>{lineData.powers.label.toUpperCase()}</div>
          <div style={{ fontSize: '8pt', lineHeight: '1.6' }}>
            {powerEntries.map(([id, val]) => {
              const item = lineData.powers.items?.find(i => i.id === id)
              const name = item?.name || id
              const activePowerNames = item?.powers && typeof val === 'number' && val > 0
                ? item.powers.slice(0, val).map(p => p.name).join(', ')
                : null
              return typeof val === 'number'
                ? (
                  <div key={id}>
                    <div style={traitRow}>
                      <span>{name}</span>
                      <span style={dotLeader} />
                      <DotRating value={val} max={5} />
                    </div>
                    {activePowerNames && <div style={{ fontSize: '7pt', color: '#777', marginLeft: '6px', marginBottom: '1px' }}>{activePowerNames}</div>}
                  </div>
                )
                : <div key={id} style={{ marginBottom: '2px' }}>{name}: {val}</div>
            })}
            {selectedKeys.length > 0 && (
              <div style={{ marginTop: '3px' }}><strong>Keys: </strong>{selectedKeys.join(', ')}</div>
            )}
            {(powers._rotes || []).length > 0 && (
              <div style={{ marginTop: '3px' }}>
                <strong>Rotes: </strong>{(powers._rotes || []).map(id => {
                  const s = SPELL_INDEX[id]
                  return s ? `${s.name} (${s.arcanumName} ${'●'.repeat(s.level)})` : id
                }).join(', ')}
              </div>
            )}
            {(powers._soul_affinity || powers._guild_affinity || powers._free_affinity) && (
              <div style={{ marginTop: '3px' }}>
                <strong>Affinities: </strong>{[
                  AFFINITIES.find(a => a.id === powers._soul_affinity)?.name,
                  AFFINITIES.find(a => a.id === powers._guild_affinity)?.name,
                  AFFINITIES.find(a => a.id === powers._free_affinity)?.name,
                ].filter(Boolean).join(', ')}
              </div>
            )}
            {(powers._utterances || []).length > 0 && (
              <div style={{ marginTop: '3px' }}>
                <strong>Utterances: </strong>{(powers._utterances || []).map(id => UTTERANCES.find(u => u.id === id)?.name ?? id).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Renown (Werewolf only) ── */}
      {lineData.renown && (
        <div style={{ borderTop: '1px solid #000', paddingTop: '6px', marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '7pt', letterSpacing: '1px', marginBottom: '4px' }}>RENOWN</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px', fontSize: '8pt' }}>
            {lineData.renown.tracks.map(track => {
              const auspiceId = template[lineData.template.group2.field]
              const auspiceOpt = lineData.template.group2.options.find(o => o.id === auspiceId)
              const isAuspice = auspiceOpt?.renownTrack === track
              const val = isAuspice ? Math.max(1, renown[track] || 0) : (renown[track] || 0)
              return (
                <div key={track} style={{ textAlign: 'center', border: '1px solid #ccc', borderRadius: '3px', padding: '3px' }}>
                  <div style={{ color: '#555', fontSize: '7pt' }}>{track}{isAuspice ? ' ★' : ''}</div>
                  <DotRating value={val} max={5} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Notes ── */}
      <div style={{ borderTop: '1px solid #000', paddingTop: '6px', fontSize: '8pt' }}>
        <div style={{ fontWeight: 'bold', fontSize: '8pt', letterSpacing: '1px', marginBottom: '3px' }}>NOTES</div>
        <div>{notes}</div>
        <div style={{ marginTop: '14px', borderBottom: '1px solid #ccc' }}>&nbsp;</div>
        <div style={{ marginTop: '8px', borderBottom: '1px solid #ccc' }}>&nbsp;</div>
      </div>
    </div>
  )
}
