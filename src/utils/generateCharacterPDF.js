import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import AFFINITIES from '../data/affinities.json'
import UTTERANCES from '../data/utterances.json'
import { SPELL_INDEX } from './arcanaValidation'

// ── Layout constants ────────────────────────────────────────────────────────
const PW = 612, PH = 792
const M  = 36
const CW = PW - M*2   // 540
const TOP = PH - M    // 756

const LEFT = M                       // 36
const MID  = M + (CW/2) + 6         // 312
const HALF = (CW - 12) / 2          // 264

// Attribute columns: 3 across full width
const ATTR_COL_W = CW / 3           // 180

// Dot checkboxes
const DOT_SZ     = 7
const DOT_GAP_PX = 2
const DOT_TOT    = 5 * DOT_SZ + 4 * DOT_GAP_PX  // 43

// Row heights
const ROW_H    = 13
const FIELD_H  = 14
const SEC_H    = 16
const SUBCAT_H = 11

const BLACK = rgb(0, 0, 0)
const GRAY  = rgb(0.45, 0.45, 0.45)
const LGRAY = rgb(0.7, 0.7, 0.7)

// ── Data ────────────────────────────────────────────────────────────────────

const ATTR_CATS = [
  { key: 'mental',   label: 'Mental',   attrs: ['intelligence','wits','resolve'] },
  { key: 'physical', label: 'Physical', attrs: ['strength','dexterity','stamina'] },
  { key: 'social',   label: 'Social',   attrs: ['presence','manipulation','composure'] },
]

const SKILL_CATS = [
  { key: 'mental',   label: 'Mental',   skills: ['academics','computer','crafts','investigation','medicine','occult','politics','science'] },
  { key: 'physical', label: 'Physical', skills: ['athletics','brawl','drive','firearms','larceny','stealth','survival','weaponry'] },
  { key: 'social',   label: 'Social',   skills: ['animal_ken','empathy','expression','intimidation','persuasion','socialize','streetwise','subterfuge'] },
]

// ── Helpers ─────────────────────────────────────────────────────────────────

function toLabel(s) {
  return s === 'animal_ken' ? 'Animal Ken' : s.charAt(0).toUpperCase() + s.slice(1)
}

function drawSectionHeader(page, font, text, x, y, width) {
  page.drawLine({ start: {x, y: y-1}, end: {x: x+width, y: y-1}, thickness: 0.75, color: BLACK })
  page.drawText(text, { x, y, font, size: 8, color: BLACK })
  return y - SEC_H
}

// Single-line trait row: label + dotted leader + checkboxes, all within colW
function drawTraitRow(form, page, font, name, label, value, max=5, x, y, colW) {
  const dotsX = x + colW - DOT_TOT - 2

  if (label) {
    page.drawText(label, { x, y: y + 1, font, size: 7, color: BLACK })
    const labelW = font.widthOfTextAtSize(label, 7)
    const leaderStart = x + labelW + 2
    const leaderEnd   = dotsX - 3
    if (leaderEnd > leaderStart + 4) {
      page.drawLine({
        start: { x: leaderStart, y: y + 2 },
        end:   { x: leaderEnd,   y: y + 2 },
        thickness: 0.4,
        color: LGRAY,
        dashArray: [1, 2],
        dashPhase: 0,
      })
    }
  }

  for (let i = 1; i <= max; i++) {
    const cb = form.createCheckBox(`${name}.${i}`)
    cb.addToPage(page, {
      x: dotsX + (i-1) * (DOT_SZ + DOT_GAP_PX),
      y,
      width: DOT_SZ,
      height: DOT_SZ,
      borderWidth: 0.5,
    })
    if (i <= value) cb.check()
  }

  return y - ROW_H
}

function drawTextField(form, page, name, value, x, y, width, height=FIELD_H, multiline=false) {
  const field = form.createTextField(name)
  if (value) field.setText(String(value))
  if (multiline) field.enableMultiline()
  field.addToPage(page, { x, y, width, height, borderWidth: 0.5 })
  return y - height
}

// ── Header ──────────────────────────────────────────────────────────────────

function drawHeader(page, form, boldFont, font, character, lineData) {
  let y = TOP

  const title  = lineData.name.toUpperCase()
  const titleW = boldFont.widthOfTextAtSize(title, 13)
  page.drawText(title, { x: LEFT + (CW - titleW)/2, y: y-14, font: boldFont, size: 13, color: BLACK })
  y -= 22

  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 1.5, color: BLACK })
  y -= 6

  const FW = CW / 3
  const headerFields = [
    ['Name',      'meta.name',      character.meta.name],
    ['Concept',   'meta.concept',   character.meta.concept],
    ['Player',    'meta.player',    character.meta.player],
    ['Virtue',    'meta.virtue',    character.meta.virtue],
    ['Vice',      'meta.vice',      character.meta.vice],
    ['Chronicle', 'meta.chronicle', character.meta.chronicle],
  ]
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const [lbl, name, val] = headerFields[row*3 + col]
      const fx = LEFT + col * FW
      page.drawText(lbl + ':', { x: fx, y: y-1, font, size: 6.5, color: GRAY })
      drawTextField(form, page, name, val, fx, y - FIELD_H - 3, FW - 4)
    }
    y -= FIELD_H + 18
  }

  const g1 = lineData.template.group1
  const g2 = lineData.template.group2
  const parts = [
    g1 && character.template[g1.field] && `${g1.label}: ${g1.options.find(o => o.id === character.template[g1.field])?.name || character.template[g1.field]}`,
    g2 && !g2.freeform && character.template[g2.field] && `${g2.label}: ${g2.options.find(o => o.id === character.template[g2.field])?.name || character.template[g2.field]}`,
    g2?.freeform && character.template[g2.field] && `${g2.label}: ${character.template[g2.field]}`,
  ].filter(Boolean)
  if (parts.length) {
    page.drawText(parts.join('  |  '), { x: LEFT, y, font, size: 7.5, color: GRAY })
    y -= 12
  }

  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 0.75, color: BLACK })
  return y - 8
}

// ── Attributes — full width, 3 columns ──────────────────────────────────────

function drawAttributes(page, form, boldFont, font, attributes, startY) {
  let y = drawSectionHeader(page, boldFont, 'ATTRIBUTES', LEFT, startY, CW)

  ATTR_CATS.forEach(({ label }, i) => {
    const colX = LEFT + i * ATTR_COL_W
    const tw   = font.widthOfTextAtSize(label, 6.5)
    page.drawText(label, { x: colX + (ATTR_COL_W - tw)/2, y, font, size: 6.5, color: GRAY })
  })
  y -= SUBCAT_H

  for (let row = 0; row < 3; row++) {
    ATTR_CATS.forEach(({ key, attrs }, col) => {
      const attr = attrs[row]
      const colX = LEFT + col * ATTR_COL_W
      drawTraitRow(form, page, font, `attr.${key}.${attr}`, toLabel(attr), attributes[key][attr], 5, colX, y, ATTR_COL_W - 4)
    })
    y -= ROW_H
  }

  return y - 6
}

// ── Skills — full width, 3 columns ─────────────────────────────────────────

function drawSkills(page, form, boldFont, font, skills, specialties, startY) {
  let y = drawSectionHeader(page, boldFont, 'SKILLS', LEFT, startY, CW)

  const SKILL_COL_W = CW / 3  // 180 — matches ATTR_COL_W

  SKILL_CATS.forEach(({ label }, i) => {
    const colX = LEFT + i * SKILL_COL_W
    const tw   = font.widthOfTextAtSize(label, 6.5)
    page.drawText(label, { x: colX + (SKILL_COL_W - tw) / 2, y, font, size: 6.5, color: GRAY })
  })
  y -= SUBCAT_H

  for (let row = 0; row < 8; row++) {
    SKILL_CATS.forEach(({ key, skills: sk }, col) => {
      const skill = sk[row]
      const colX  = LEFT + col * SKILL_COL_W
      drawTraitRow(form, page, font, `skill.${key}.${skill}`, toLabel(skill), skills[key][skill], 5, colX, y, SKILL_COL_W - 4)
    })
    y -= ROW_H
  }

  if (specialties.length > 0) {
    y -= 2
    const specText = 'Specialties: ' + specialties.map(s => `${toLabel(s.skill)} (${s.name})`).join(', ')
    page.drawText(specText, { x: LEFT, y, font, size: 6.5, color: GRAY })
    y -= ROW_H
  }

  return y - 4
}

// ── Powers — right half ──────────────────────────────────────────────────────

function drawPowers(page, form, boldFont, font, powers, lineData, startY) {
  let y = drawSectionHeader(page, boldFont, lineData.powers.label.toUpperCase(), MID, startY, HALF)

  const powerEntries = Object.entries(powers).filter(([k]) => !k.startsWith('_'))

  for (const [id, val] of powerEntries) {
    if (y < 100) break
    const item = lineData.powers.items?.find(i => i.id === id)
    const name = item?.name || toLabel(id)

    if (typeof val === 'number') {
      y = drawTraitRow(form, page, font, `power.${id}`, name, val, 5, MID, y, HALF - 4)
    } else {
      page.drawText(`${name}: `, { x: MID, y: y+1, font, size: 7, color: BLACK })
      drawTextField(form, page, `power.${id}`, String(val), MID + 50, y, HALF - 54)
      y -= ROW_H
    }
  }

  const selectedKeys = powers._keys || []
  if (selectedKeys.length) {
    page.drawText('Keys:', { x: MID, y: y+1, font, size: 7, color: GRAY })
    drawTextField(form, page, 'power._keys', selectedKeys.join(', '), MID + 28, y, HALF - 32)
    y -= ROW_H
  }

  const rotes = powers._rotes || []
  if (rotes.length) {
    page.drawText('Rotes:', { x: MID, y: y+1, font, size: 7, color: GRAY })
    const roteText = rotes.map(id => {
      const s = SPELL_INDEX[id]
      return s ? `${s.name} (${s.arcanumName} ${'•'.repeat(s.level)})` : id
    }).join(', ')
    drawTextField(form, page, 'power._rotes', roteText, MID + 32, y, HALF - 36)
    y -= ROW_H
  }

  const affinityIds = [powers._soul_affinity, powers._guild_affinity, powers._free_affinity].filter(Boolean)
  if (affinityIds.length) {
    page.drawText('Affinities:', { x: MID, y: y+1, font, size: 7, color: GRAY })
    const affText = affinityIds.map(id => AFFINITIES.find(a => a.id === id)?.name ?? id).join(', ')
    drawTextField(form, page, 'power._affinities', affText, MID + 52, y, HALF - 56)
    y -= ROW_H
  }

  const utterances = powers._utterances || []
  if (utterances.length) {
    page.drawText('Utterances:', { x: MID, y: y+1, font, size: 7, color: GRAY })
    const uttText = utterances.map(id => UTTERANCES.find(u => u.id === id)?.name ?? id).join(', ')
    drawTextField(form, page, 'power._utterances', uttText, MID + 56, y, HALF - 60)
    y -= ROW_H
  }

  return y - 4
}

// ── Merits — right half, below powers ───────────────────────────────────────

function drawMerits(page, form, boldFont, font, merits, startY) {
  let y = drawSectionHeader(page, boldFont, 'MERITS', MID, startY, HALF)

  for (let i = 0; i < merits.length; i++) {
    if (y < 100) break
    const { name, dots } = merits[i]
    y = drawTraitRow(form, page, font, `merit.${i}`, name, dots, 5, MID, y, HALF - 4)
  }

  return y - 4
}

// ── Renown (Werewolf only) ───────────────────────────────────────────────────

function drawRenown(page, form, boldFont, font, renown, lineData, character, startY) {
  if (!lineData.renown) return startY

  let y = drawSectionHeader(page, boldFont, 'RENOWN', LEFT, startY, CW)

  const tracks  = lineData.renown.tracks
  const trackW  = CW / tracks.length
  const g2      = lineData.template.group2
  const auspiceId  = character.template[g2?.field]
  const auspiceOpt = g2?.options?.find(o => o.id === auspiceId)

  tracks.forEach((track, i) => {
    const x        = LEFT + i * trackW
    const trackKey = track.toLowerCase()
    const isAuspice = auspiceOpt?.renownTrack?.toLowerCase() === trackKey
    const val      = isAuspice ? Math.max(1, renown[trackKey] || 0) : (renown[trackKey] || 0)
    const lbl      = track.charAt(0).toUpperCase() + track.slice(1).toLowerCase() + (isAuspice ? ' *' : '')
    page.drawText(lbl, { x, y, font, size: 7, color: isAuspice ? BLACK : GRAY })
    for (let j = 1; j <= 5; j++) {
      const cb = form.createCheckBox(`renown.${trackKey}.${j}`)
      cb.addToPage(page, { x: x + (j-1)*(DOT_SZ+DOT_GAP_PX), y: y - 10, width: DOT_SZ, height: DOT_SZ, borderWidth: 0.5 })
      if (j <= val) cb.check()
    }
  })

  y -= ROW_H + 14
  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 0.5, color: LGRAY })
  return y - 8
}

// ── Derived traits ───────────────────────────────────────────────────────────

function drawBoxRow(form, page, fieldName, count, x, y) {
  const max = Math.min(count, 15)
  for (let i = 1; i <= max; i++) {
    const cb = form.createCheckBox(`${fieldName}.${i}`)
    cb.addToPage(page, { x: x + (i-1)*(DOT_SZ+DOT_GAP_PX), y, width: DOT_SZ, height: DOT_SZ, borderWidth: 0.5 })
  }
  return y - DOT_SZ - 4
}

function drawDerived(page, form, boldFont, font, derived, startY) {
  let y = drawSectionHeader(page, boldFont, 'DERIVED TRAITS', LEFT, startY, CW)

  const colW = CW / 4
  const cols = [LEFT, LEFT+colW, LEFT+colW*2, LEFT+colW*3]

  const { health, willpower, resource_pool, integrity, speed, defense, initiative, supernatural_trait } = derived

  // Row 1: checkbox fields
  const row1Labels = ['Health', 'Willpower', resource_pool?.name || null, integrity?.name || 'Integrity']
  row1Labels.forEach((lbl, i) => {
    if (lbl) page.drawText(lbl, { x: cols[i], y, font, size: 6.5, color: GRAY })
  })
  y -= 10

  drawBoxRow(form, page, 'derived.health',    health ?? 0,    cols[0], y)
  drawBoxRow(form, page, 'derived.willpower', willpower ?? 0, cols[1], y)
  if (resource_pool?.name) {
    drawBoxRow(form, page, 'derived.resource', Math.min(resource_pool?.max ?? 0, 15), cols[2], y)
  }
  drawTextField(form, page, 'derived.integrity', String(integrity?.value ?? ''), cols[3], y, colW - 8)

  y -= DOT_SZ + 18

  // Row 2: numeric fields
  const row2 = [
    ['Speed',      'derived.speed',      speed],
    ['Defense',    'derived.defense',    defense],
    ['Initiative', 'derived.initiative', initiative],
    supernatural_trait?.name ? [supernatural_trait.name, 'derived.supernatural', supernatural_trait?.value] : null,
  ].filter(Boolean)

  row2.forEach(([lbl, name, val], i) => {
    page.drawText(lbl, { x: cols[i], y, font, size: 6.5, color: GRAY })
    drawTextField(form, page, name, String(val ?? ''), cols[i], y - FIELD_H - 2, colW - 8)
  })

  y -= FIELD_H + 14

  // Row 3: Experience
  page.drawText('Experience', { x: cols[0], y, font, size: 6.5, color: GRAY })
  drawTextField(form, page, 'derived.experience', '', cols[0], y - FIELD_H - 2, colW - 8)

  y -= FIELD_H + 14

  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 0.5, color: LGRAY })
  return y - 8
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function generateCharacterPDF(character, lineData) {
  const pdfDoc   = await PDFDocument.create()
  const page     = pdfDoc.addPage([PW, PH])
  const form     = pdfDoc.getForm()
  const font     = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

  // Header
  let y = drawHeader(page, form, boldFont, font, character, lineData)

  // Attributes — full width
  y = drawAttributes(page, form, boldFont, font, character.attributes, y)

  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 0.5, color: LGRAY })
  y -= 8

  // Skills — full width
  y = drawSkills(page, form, boldFont, font, character.skills, character.specialties, y)

  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 0.5, color: LGRAY })
  y -= 8

  // Powers (left) and Merits (right) in parallel
  const colTop = y
  const powBot = drawPowers(page, form, boldFont, font, character.powers, lineData, colTop)
  const merBot = drawMerits(page, form, boldFont, font, character.merits, colTop)

  const divBot = Math.min(powBot, merBot)
  page.drawLine({
    start: { x: MID - 6, y: colTop },
    end:   { x: MID - 6, y: divBot },
    thickness: 0.4,
    color: LGRAY,
  })

  y = divBot - 4
  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 0.5, color: LGRAY })
  y -= 8

  // Renown (Werewolf only)
  y = drawRenown(page, form, boldFont, font, character.renown ?? {}, lineData, character, y)

  // Derived traits + XP
  y = drawDerived(page, form, boldFont, font, character.derived, y)

  // Notes fills remaining space
  const notesH = y - M - 4
  if (notesH > 20) {
    const notesField = form.createTextField('notes')
    if (character.notes) notesField.setText(character.notes)
    notesField.enableMultiline()
    notesField.addToPage(page, { x: LEFT, y: M + 4, width: CW, height: notesH, borderWidth: 0.5 })
  }

  return pdfDoc.save()
}
