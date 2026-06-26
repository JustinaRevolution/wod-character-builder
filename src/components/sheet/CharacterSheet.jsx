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
  { key: 'mental',   skills: ['academics','computer','crafts','investigation','medicine','occult','politics','science'] },
  { key: 'physical', skills: ['athletics','brawl','drive','firearms','larceny','stealth','survival','weaponry'] },
  { key: 'social',   skills: ['animal_ken','empathy','expression','intimidation','persuasion','socialize','streetwise','subterfuge'] },
]

const label = s => s === 'animal_ken' ? 'Animal Ken' : s.charAt(0).toUpperCase() + s.slice(1)
const boxes = n => '□'.repeat(n)

const traitRow = { display: 'flex', alignItems: 'baseline', marginBottom: '2px', gap: '3px' }
const dotLeader = { flex: 1, borderBottom: '1px dotted #bbb', marginBottom: '2px' }

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

  return (
    <div className="print-only" style={{ fontFamily: 'Georgia, serif', fontSize: '9pt', color: '#000', background: '#fff', padding: '1cm' }}>

      {/* Header */}
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

      {/* Attributes — full width, 3 equal columns, name + dots on same line */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '8pt', letterSpacing: '1px', borderBottom: '1px solid #000', marginBottom: '5px' }}>ATTRIBUTES</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '8pt' }}>
          {ATTR_CATS.map(({ key, attrs }) => (
            <div key={key}>
              <div style={{ textAlign: 'center', color: '#555', fontSize: '7pt', marginBottom: '4px' }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </div>
              {attrs.map(a => (
                <div key={a} style={traitRow}>
                  <span>{label(a)}</span>
                  <span style={dotLeader} />
                  <DotRating value={attributes[key][a]} max={5} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Skills — full width, 3 columns */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '8pt', letterSpacing: '1px', borderBottom: '1px solid #000', marginBottom: '5px' }}>SKILLS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '8pt' }}>
          {SKILL_CATS.map(({ key, skills: sk }) => (
            <div key={key}>
              <div style={{ textAlign: 'center', color: '#555', fontSize: '7pt', marginBottom: '4px' }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </div>
              {sk.map(s => (
                <div key={s} style={traitRow}>
                  <span>{label(s)}</span>
                  <span style={dotLeader} />
                  <DotRating value={skills[key][s]} max={5} />
                </div>
              ))}
            </div>
          ))}
        </div>
        {specialties.length > 0 && (
          <div style={{ marginTop: '5px', fontSize: '7.5pt' }}>
            <strong>Specialties: </strong>{specialties.map(s => `${s.skill} (${s.name})`).join(', ')}
          </div>
        )}
      </div>

      {/* Powers + Merits — 2-column split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '10px' }}>

        {/* Left: Powers */}
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '8pt', letterSpacing: '1px', borderBottom: '1px solid #000', marginBottom: '5px' }}>
            {lineData.powers.label.toUpperCase()}
          </div>
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

        {/* Right: Merits */}
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '8pt', letterSpacing: '1px', borderBottom: '1px solid #000', marginBottom: '5px' }}>MERITS</div>
          <div style={{ fontSize: '8pt', lineHeight: '1.6' }}>
            {merits.map((m, i) => (
              <div key={i} style={traitRow}>
                <span>{m.name}</span>
                <span style={dotLeader} />
                <DotRating value={m.dots} max={5} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Renown (Werewolf only) */}
      {lineData.renown && (
        <div style={{ borderTop: '1px solid #000', paddingTop: '6px', marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '8pt', letterSpacing: '1px', marginBottom: '5px' }}>RENOWN</div>
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

      {/* Derived Traits */}
      <div style={{ borderTop: '1px solid #000', paddingTop: '6px', marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '8pt', letterSpacing: '1px', marginBottom: '5px' }}>DERIVED TRAITS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', fontSize: '8pt', textAlign: 'center' }}>
          {[
            ['Health',    boxes(derived.health)],
            ['Willpower', boxes(derived.willpower)],
            derived.resource_pool.name ? [derived.resource_pool.name, boxes(Math.min(derived.resource_pool.max, 15))] : null,
            [derived.integrity.name || 'Integrity', `${derived.integrity.value} / 10`],
            ['Speed',      derived.speed],
            ['Defense',    derived.defense],
            ['Initiative', derived.initiative],
            derived.supernatural_trait.name ? [derived.supernatural_trait.name, derived.supernatural_trait.value] : null,
            ['Experience', ''],
          ].filter(Boolean).map(([lbl, val]) => (
            <div key={lbl} style={{ border: '1px solid #ccc', borderRadius: '3px', padding: '3px' }}>
              <div style={{ color: '#555', fontSize: '7pt' }}>{lbl}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '8pt', wordBreak: 'break-all', minHeight: '12px' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{ borderTop: '1px solid #000', paddingTop: '6px', fontSize: '8pt' }}>
        <div style={{ fontWeight: 'bold', fontSize: '8pt', letterSpacing: '1px', marginBottom: '3px' }}>NOTES</div>
        <div>{notes}</div>
        <div style={{ marginTop: '14px', borderBottom: '1px solid #ccc' }}>&nbsp;</div>
        <div style={{ marginTop: '8px', borderBottom: '1px solid #ccc' }}>&nbsp;</div>
      </div>
    </div>
  )
}
