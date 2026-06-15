import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import AFFINITIES from '../data/affinities.json'
import UTTERANCES from '../data/utterances.json'
import { SPELL_INDEX } from './arcanaValidation'

// ── Layout constants ────────────────────────────────────────────────────────
const PW = 612, PH = 792
const M = 36          // margin
const CW = PW - M*2  // content width = 540
const TOP = PH - M   // 756 — top of content area

const LEFT = M        // 36
const MID  = M + (CW/2) + 6  // 312 (gap of 12, each side gets 6)
const HALF = (CW - 12) / 2   // 264

// Sub-columns (3 per half, for attr/skill categories)
const SUB_W = 84
const SUB_GAP = 6

// Dot checkboxes
const DOT_SZ  = 7
const DOT_GAP_PX = 2
const DOT_TOT = 5 * DOT_SZ + 4 * DOT_GAP_PX  // 43
const LBL_W   = SUB_W - DOT_TOT - 4           // 37 — label width before dots

// Row heights
const ROW_H    = 13   // compact attr/skill/power row
const FIELD_H  = 14   // input field height
const SEC_H    = 16   // section header
const SUBCAT_H = 11   // Mental/Physical/Social label

const BLACK = rgb(0, 0, 0)
const GRAY  = rgb(0.45, 0.45, 0.45)
const LGRAY = rgb(0.7, 0.7, 0.7)

// ── Helpers ─────────────────────────────────────────────────────────────────

function toLabel(s) {
  return s === 'animal_ken' ? 'Animal Ken' : s.charAt(0).toUpperCase() + s.slice(1)
}

function drawSectionHeader(page, font, text, x, y, width) {
  page.drawLine({ start: {x, y: y-1}, end: {x: x+width, y: y-1}, thickness: 0.75, color: BLACK })
  page.drawText(text, { x, y, font, size: 8, color: BLACK })
  return y - SEC_H
}

function drawDots(form, page, font, name, label, value, max=5, x, y) {
  if (label) page.drawText(label, { x, y: y+1, font, size: 7, color: BLACK })
  for (let i = 1; i <= max; i++) {
    const cx = x + LBL_W + (i-1) * (DOT_SZ + DOT_GAP_PX)
    const cb = form.createCheckBox(`${name}.${i}`)
    cb.addToPage(page, { x: cx, y, width: DOT_SZ, height: DOT_SZ, borderWidth: 0.5 })
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

  // Splat title — centered
  const title = lineData.name.toUpperCase()
  const titleW = boldFont.widthOfTextAtSize(title, 13)
  page.drawText(title, { x: LEFT + (CW - titleW)/2, y: y-14, font: boldFont, size: 13, color: BLACK })
  y -= 22

  // Top separator
  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 1.5, color: BLACK })
  y -= 6

  // 6 fields in 2 rows of 3
  const FW = CW / 3   // 180 per field
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

  // Template line (Clan/Tribe/Order/etc)
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

  // Bottom separator
  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 0.75, color: BLACK })
  return y - 8
}

// ── Placeholder sections (filled in later tasks) ─────────────────────────────

const ATTR_CATS = [
  { key: 'mental',   label: 'Mental',   attrs: ['intelligence','wits','resolve'] },
  { key: 'physical', label: 'Physical', attrs: ['strength','dexterity','stamina'] },
  { key: 'social',   label: 'Social',   attrs: ['presence','manipulation','composure'] },
]

function drawAttributes(page, form, boldFont, font, attributes, startY) {
  let y = drawSectionHeader(page, boldFont, 'ATTRIBUTES', LEFT, startY, HALF)

  // Sub-category headers
  ATTR_CATS.forEach(({ label }, i) => {
    const x = LEFT + i * (SUB_W + SUB_GAP)
    page.drawText(label, { x, y, font, size: 6.5, color: GRAY })
  })
  y -= SUBCAT_H

  // 3 rows (one per attribute per category), categories as parallel columns
  const maxRows = 3
  for (let row = 0; row < maxRows; row++) {
    ATTR_CATS.forEach(({ key, attrs }, col) => {
      const attr = attrs[row]
      const x = LEFT + col * (SUB_W + SUB_GAP)
      drawDots(form, page, font, `attr.${key}.${attr}`, toLabel(attr), attributes[key][attr], 5, x, y)
    })
    y -= ROW_H
  }

  return y - 4
}

const SKILL_CATS = [
  { key: 'mental',   label: 'Mental',   skills: ['academics','computer','crafts','investigation','medicine','occult','politics','science'] },
  { key: 'physical', label: 'Physical', skills: ['athletics','brawl','drive','firearms','larceny','stealth','survival','weaponry'] },
  { key: 'social',   label: 'Social',   skills: ['animal_ken','empathy','expression','intimidation','persuasion','socialize','streetwise','subterfuge'] },
]

function drawSkills(page, form, boldFont, font, skills, specialties, startY) {
  let y = drawSectionHeader(page, boldFont, 'SKILLS', MID, startY, HALF)

  // Sub-category headers
  SKILL_CATS.forEach(({ label }, i) => {
    const x = MID + i * (SUB_W + SUB_GAP)
    page.drawText(label, { x, y, font, size: 6.5, color: GRAY })
  })
  y -= SUBCAT_H

  // 8 rows (one per skill per category), categories as parallel columns
  const maxRows = 8
  for (let row = 0; row < maxRows; row++) {
    SKILL_CATS.forEach(({ key, skills: sk }, col) => {
      const skill = sk[row]
      const x = MID + col * (SUB_W + SUB_GAP)
      drawDots(form, page, font, `skill.${key}.${skill}`, toLabel(skill), skills[key][skill], 5, x, y)
    })
    y -= ROW_H
  }

  // Specialties text field
  y -= 4
  page.drawText('Specialties:', { x: MID, y, font, size: 7, color: GRAY })
  y -= 2
  const specText = specialties.map(s => `${toLabel(s.skill)} (${s.name})`).join(', ')
  drawTextField(form, page, 'specialties', specText, MID, y - FIELD_H, HALF - 4)
  y -= FIELD_H + 8

  return y
}

function drawPowers(_page, _form, _boldFont, _font, _powers, _lineData, startY) {
  return startY
}

function drawMerits(_page, _form, _boldFont, _font, _merits, startY) {
  return startY
}

function drawRenown(_page, _form, _boldFont, _font, _renown, _lineData, _character, startY) {
  return startY
}

function drawDerived(_page, _form, _boldFont, _font, _derived, startY) {
  return startY
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function generateCharacterPDF(character, lineData) {
  const pdfDoc   = await PDFDocument.create()
  const page     = pdfDoc.addPage([PW, PH])
  const form     = pdfDoc.getForm()
  const font     = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

  let y = drawHeader(page, form, boldFont, font, character, lineData)

  const attrSkillTop = y
  const attrBottom   = drawAttributes(page, form, boldFont, font, character.attributes, attrSkillTop)
  const skillBottom  = drawSkills(page, form, boldFont, font, character.skills, character.specialties, attrSkillTop)
  y = Math.min(attrBottom, skillBottom) - 4

  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 0.5, color: LGRAY })
  y -= 8

  const powMerTop = y
  const powBottom = drawPowers(page, form, boldFont, font, character.powers, lineData, powMerTop)
  const merBottom = drawMerits(page, form, boldFont, font, character.merits, powMerTop)
  y = Math.min(powBottom, merBottom) - 4

  page.drawLine({ start: {x: LEFT, y}, end: {x: LEFT+CW, y}, thickness: 0.5, color: LGRAY })
  y -= 8

  y = drawRenown(page, form, boldFont, font, character.renown ?? {}, lineData, character, y)
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
