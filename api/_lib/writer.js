import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../..')

// ─── SYSTEM PROMPT LOADERS ─────────────────────────────────────────────────────

function loadProductionPrompt(writerMode = 'factual') {
  const core     = fs.readFileSync(path.join(ROOT, 'runtime/writer-core.md'), 'utf-8')
  const modeFile = writerMode === 'fiction' ? 'writer-fiction.md' : 'writer-factual.md'
  const modeCtx  = fs.readFileSync(path.join(ROOT, 'runtime', modeFile), 'utf-8')
  return `${core}\n\n---\n\n${modeCtx}`
}

function loadDebugPrompt(writerMode = 'factual') {
  const claudeMd   = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf-8')
  const writerMd   = fs.readFileSync(path.join(ROOT, 'agents/writer.md'), 'utf-8')
  const principles = fs.readFileSync(path.join(ROOT, 'rules/studio-principles.md'), 'utf-8')
  const retention  = fs.readFileSync(path.join(ROOT, 'rules/viral-retention.md'), 'utf-8')
  const modeFile   = writerMode === 'fiction' ? 'writer-fiction.md' : 'writer-factual.md'
  const modeCtx    = fs.readFileSync(path.join(ROOT, 'runtime', modeFile), 'utf-8')
  return [
    '# STUDIO OS\n' + claudeMd,
    '# WRITER AGENT\n' + writerMd,
    '# STUDIO PRINCIPLES\n' + principles,
    '# VIRAL RETENTION\n' + retention,
    `# WRITER MODE — ${writerMode.toUpperCase()}\n` + modeCtx,
  ].join('\n\n---\n\n')
}

// ─── MAX TOKENS ────────────────────────────────────────────────────────────────
//
// Production:
//   Concept Pitch — 3 compact angles + Recommendation + Ledger + Snapshots
//                   Target ~2,000–3,000 tokens. 4,000 leaves headroom for edge cases.
//   Script        — Hook + 10–15 scenes + Payoff + CTA + Ledger updates
//                   Target ~5,000–7,000 tokens. 8,000 leaves headroom for longer videos.
// Debug:
//   Both calls use 16,000 to preserve full audit output.

const MAX_TOKENS = {
  production: { conceptPitch: 4000, script: 8000 },
  debug:      { conceptPitch: 16000, script: 16000 },
}

// ─── BRIEF SERIALIZER ──────────────────────────────────────────────────────────

function briefToText(brief) {
  const writerMode = brief.writerMode || 'factual'
  return [
    `Tema: ${brief.tema}`,
    `Writer Mode: ${writerMode.toUpperCase()}`,
    `Objetivo: ${brief.objetivo || (writerMode === 'fiction'
      ? 'Criar uma história original envolvente.'
      : 'Criar um vídeo educacional envolvente sobre o tema.')}`,
    `Público: ${brief.publico || 'Público geral interessado em ciência, história e curiosidades. Sem conhecimento avançado necessário.'}`,
    `Plataforma: ${brief.plataforma || 'YouTube'}`,
    `Duração alvo: ${brief.duracao} minutos`,
    `Tom: ${brief.tom || 'Intrigante, inteligente e acessível, sem sensacionalismo.'}`,
    `Mensagem principal: ${brief.mensagem || brief.tema}`,
    brief.restricoes ? `Restrições do CEO: ${brief.restricoes}` : '',
  ].filter(Boolean).join('\n')
}

// ─── BACKEND CONCEPT PITCH PARSER ─────────────────────────────────────────────
//
// Parses the Writer's Production-mode output into structured JSON after the
// stream completes. Runs once on the backend — no additional AI calls.
// The original Markdown text is preserved as artifactMarkdown.
//
// Architecture: instead of having the frontend parse arbitrary Markdown prose,
// the backend uses ordered-field extraction with explicit boundaries. Fields are
// extracted in their known sequence (GANCHO → MOTOR NARRATIVO → … → RISCO
// PRINCIPAL), so each field ends exactly where the next begins — no ambiguity.
// Bold/italic markers are stripped from extracted text before returning.

function escapeRx(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Strip Markdown formatting tokens from presentation text.
// Does NOT modify the artifactMarkdown itself.
function stripMd(text) {
  if (!text) return ''
  return text
    .replace(/\*\*([^*]*)\*\*/g, '$1')   // **bold**
    .replace(/\*([^*]*)\*/g, '$1')        // *italic*
    .replace(/<!--[\s\S]*?-->/g, '')      // <!-- HTML comments -->
    .trim()
}

// Extract a single angle field using the NEXT known field as the end boundary.
// Handles labels that may appear as "GANCHO:", "**GANCHO:**", "**GANCHO**:", etc.
// Returns null (not empty string) when the field is absent, so callers can
// distinguish missing fields from empty ones.
function extractAngleField(body, field, nextField) {
  const esc     = escapeRx(field)
  const labelRx = new RegExp(
    `(?:^|\\n)[ \\t]*\\*{0,2}\\s*${esc}\\s*\\*{0,2}:\\s*`,
    'i'
  )
  const m = body.match(labelRx)
  if (!m) return null

  const start = m.index + m[0].length
  let   end   = body.length

  if (nextField) {
    const nextEsc = escapeRx(nextField)
    const nextRx  = new RegExp(
      `(?:^|\\n)[ \\t]*\\*{0,2}\\s*${nextEsc}\\s*\\*{0,2}:`,
      'i'
    )
    const nm = body.slice(start).match(nextRx)
    if (nm) end = start + nm.index
  }

  const raw = body.slice(start, end)
  return stripMd(raw) || null
}

// ─── FACTUAL PARSER HELPERS ────────────────────────────────────────────────────

// Known ordered fields for a single angle section.
// Order matters: each field ends where the next begins.
const ANGLE_FIELDS = [
  'GANCHO',
  'MOTOR NARRATIVO',
  'TENSÃO CENTRAL',
  'TRANSFORMAÇÃO',
  'PROMESSA CENTRAL',
  'RISCO PRINCIPAL',
]

function parseAngleBody(body) {
  const extracted = {}
  for (let i = 0; i < ANGLE_FIELDS.length; i++) {
    extracted[ANGLE_FIELDS[i]] = extractAngleField(
      body,
      ANGLE_FIELDS[i],
      ANGLE_FIELDS[i + 1] ?? null
    )
  }

  // Parse TRANSFORMAÇÃO sub-fields (ANTES / DEPOIS)
  let before = '', after = ''
  const tText = extracted['TRANSFORMAÇÃO']
  if (tText) {
    const bm = tText.match(/ANTES:\s*([\s\S]*?)(?=\nDEPOIS:|$)/i)
    const am = tText.match(/DEPOIS:\s*([\s\S]*?)$/i)
    before = bm ? bm[1].trim() : ''
    after  = am ? am[1].trim() : ''
  }

  return {
    hook            : extracted['GANCHO'],
    narrativeEngine : extracted['MOTOR NARRATIVO'],
    centralTension  : extracted['TENSÃO CENTRAL'],
    viewerTransformation: { before, after },
    corePromise     : extracted['PROMESSA CENTRAL'],
    mainRisk        : extracted['RISCO PRINCIPAL'],
  }
}

// Parse a single SNAPSHOT block (content between <!-- SNAPSHOT:N --> comments).
// Returns the raw text alongside parsed fields so the raw form can be sent
// to the Script call without re-serialization.
function parseSnapshotText(raw) {
  if (!raw) return null
  const g = (label) => {
    const m = raw.match(new RegExp(`${escapeRx(label)}:\\s*([^|\\n]+)`, 'i'))
    return m ? m[1].trim() : ''
  }
  const claimsStr = g('Claims')
  return {
    raw,
    engine  : g('Motor'),
    tension : g('Tensão'),
    viewerTransformation: { before: g('Antes'), after: g('Depois') },
    promise : g('Promessa'),
    claims  : (claimsStr && !/^(nenhum|none|\s*)$/i.test(claimsStr))
              ? claimsStr.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
              : [],
  }
}

// ─── FICTION PARSER HELPERS ────────────────────────────────────────────────────

// Known ordered fields for a single story section in the Fiction CEO Compact View.
const FICTION_FIELDS = [
  'IDEIA',
  'ABERTURA',
  'JORNADA EMOCIONAL',
  'POR QUE ESTA HISTÓRIA',
  'RISCO',
]

// Fiction fields use "**FIELD**\n content" (bold header, no colon) — different
// from factual's "FIELD: content". This extractor handles both formats, trying
// the bold-header form first and falling back to the colon form.
function extractFictionField(body, field, nextField) {
  const esc   = escapeRx(field)

  // Try "**FIELD**" or "**FIELD**:" on its own line (the fiction format)
  const boldRx = new RegExp(
    `(?:^|\\n)[ \\t]*\\*{1,2}${esc}\\*{1,2}:?[ \\t]*\\n`,
    'i'
  )
  const bm = body.match(boldRx)

  // End boundary: next **FIELD** line or end of body
  function findEnd(startPos) {
    let end = body.length
    if (!nextField) return end
    const nextEsc  = escapeRx(nextField)
    // Match next field in bold-header or colon form
    const nextBold = new RegExp(`(?:^|\\n)[ \\t]*\\*{1,2}${nextEsc}\\*{1,2}:?[ \\t]*\\n`, 'i')
    const nextColon = new RegExp(`(?:^|\\n)[ \\t]*\\*{0,2}\\s*${nextEsc}\\s*\\*{0,2}:`, 'i')
    const nb = body.slice(startPos).match(nextBold)
    const nc = body.slice(startPos).match(nextColon)
    const nbIdx = nb ? startPos + nb.index : Infinity
    const ncIdx = nc ? startPos + nc.index : Infinity
    return Math.min(nbIdx, ncIdx, body.length)
  }

  if (bm) {
    const start = bm.index + bm[0].length
    return stripMd(body.slice(start, findEnd(start))) || null
  }

  // Fallback: colon format (FIELD: or **FIELD:**)
  return extractAngleField(body, field, nextField)
}

function parseStoryBody(body) {
  const extracted = {}
  for (let i = 0; i < FICTION_FIELDS.length; i++) {
    extracted[FICTION_FIELDS[i]] = extractFictionField(
      body, FICTION_FIELDS[i], FICTION_FIELDS[i + 1] ?? null
    )
  }
  return {
    idea        : extracted['IDEIA'],
    hook        : extracted['ABERTURA'],
    emotionalArc: extracted['JORNADA EMOCIONAL'],
    whyThisStory: extracted['POR QUE ESTA HISTÓRIA'],
    mainRisk    : extracted['RISCO'],
    corePromise : extracted['IDEIA'],  // alias — shared UI uses corePromise for the idea/premise field
  }
}

// Parse APPROVED STORY SNAPSHOT JSON block from fiction concept pitch.
function parseSnapshotJson(raw) {
  if (!raw) return null
  const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/i) || raw.match(/(\{[\s\S]*\})/i)
  if (!m) return { raw }
  try {
    const obj = JSON.parse(m[1])
    return { raw, ...obj }
  } catch {
    return { raw }
  }
}

function parseFictionConceptPitch(text) {
  const sections = text.split(/(?=^## )/m)
  const angles   = []

  for (const sec of sections) {
    const headerText = sec.replace(/\*\*([^*]*)\*\*/g, '$1')

    // Recommended story: "## HISTÓRIA RECOMENDADA — TITLE" (always id=1)
    const recMatch = headerText.match(/^## HISTÓRIA RECOMENDADA\s*[—–-]+\s*(.+)/im)
    if (recMatch) {
      const firstNl = sec.indexOf('\n')
      const body    = firstNl >= 0 ? sec.slice(firstNl + 1) : ''
      angles.push({ id: 1, title: stripMd(recMatch[1].trim()), _isRec: true, ...parseStoryBody(body), snapshot: null })
      continue
    }

    // Other stories: "## HISTÓRIA N — TITLE"
    const storyMatch = headerText.match(/^## HISTÓRIA\s+(\d+)\s*[—–-]+\s*(.+)/im)
    if (storyMatch) {
      const n       = +storyMatch[1]
      const firstNl = sec.indexOf('\n')
      const body    = firstNl >= 0 ? sec.slice(firstNl + 1) : ''
      angles.push({ id: n, title: stripMd(storyMatch[2].trim()), ...parseStoryBody(body), snapshot: null })
    }
  }

  if (angles.length === 0) return null

  // Parse WRITER RECOMMENDATION (English per runtime format; also handle Portuguese)
  let recommendation = null
  const recSec = sections.find(s => {
    const h = s.replace(/\*\*([^*]*)\*\*/g, '$1')
    return /^## WRITER RECOMMENDATION/im.test(h) || /^## RECOMENDAÇÃO DO ROTEIRISTA/im.test(h)
  })
  if (recSec) {
    const rb  = stripMd(recSec.replace(/^##[^\n]+\n/m, ''))
    const why = rb.match(/(?:WHY THIS ONE|POR QUÊ):\s*([\s\S]*?)(?=\n(?:MAIN ADVANTAGE|VANTAGEM|MAIN RISK|RISCO PRINCIPAL|WHY NOT|POR QUE NÃO)|$)/im)
    const wno = rb.match(/(?:WHY NOT THE RUNNER-UP|POR QUE NÃO):\s*([\s\S]*?)(?=\n##|$)/im)
    recommendation = {
      angleId        : null, // set below after sort
      why            : why ? why[1].trim() : '',
      runnerUpAngleId: null,
      whyNotRunnerUp : wno ? wno[1].trim() : '',
    }
  } else {
    // Fallback: use whyThisStory from the recommended card body
    const recAngle = angles.find(a => a._isRec) || angles[0]
    recommendation = {
      angleId        : null,
      why            : recAngle?.whyThisStory || '',
      runnerUpAngleId: null,
      whyNotRunnerUp : '',
    }
  }

  // Parse APPROVED STORY SNAPSHOT (JSON block)
  let snapshot = null
  const snapSec = sections.find(s =>
    /^## APPROVED STORY SNAPSHOT/im.test(s.replace(/\*\*([^*]*)\*\*/g, '$1'))
  )
  if (snapSec) {
    snapshot = parseSnapshotJson(snapSec.replace(/^##[^\n]+\n/m, ''))
  }

  // Sort: recommended first
  const recAngle = angles.find(a => a._isRec)
  const sorted   = recAngle
    ? [recAngle, ...angles.filter(a => !a._isRec)]
    : angles

  // Clean internal flag, set recommendation.angleId
  const recId = sorted[0]?.id ?? null
  sorted.forEach(a => { delete a._isRec })
  if (recommendation) recommendation.angleId = recId

  // Attach snapshot to recommended angle
  if (snapshot && sorted.length > 0) sorted[0].snapshot = snapshot

  return {
    writerMode            : 'fiction',
    angles                : sorted,
    recommendation,
    factualClaims         : [],
    approvedAngleSnapshots: snapshot && recId != null ? { [recId]: snapshot } : {},
    artifactMarkdown      : text,
  }
}

// ─── MAIN PARSER ──────────────────────────────────────────────────────────────

export function parseConceptPitchText(text, writerMode = 'factual') {
  if (!text || text.length < 50) return null
  if (writerMode === 'fiction') return parseFictionConceptPitch(text)

  // ── FACTUAL PARSER (unchanged) ──────────────────────────────────────────────

  // 1. Extract SNAPSHOT blocks (HTML comments — parsed + raw preserved)
  const snapshots = {}
  const snRx = /<!-- SNAPSHOT:(\d+) -->([\s\S]*?)<!-- \/SNAPSHOT:\1 -->/g
  let sm
  while ((sm = snRx.exec(text)) !== null) {
    snapshots[+sm[1]] = parseSnapshotText(sm[2].trim())
  }

  // 2. Split into top-level ## sections and parse angle sections
  const sections = text.split(/(?=^## )/m)
  const angles   = []

  for (const sec of sections) {
    // Strip bold markers for header matching only (preserves body for extraction)
    const headerText  = sec.replace(/\*\*([^*]*)\*\*/g, '$1')
    const angleMatch  = headerText.match(/^## ÂNGULO\s+(\d+)\s*[—–-]+\s*(.+)/im)
    if (!angleMatch) continue

    const n    = +angleMatch[1]
    const title = stripMd(angleMatch[2].trim())

    // Body: everything after the first line (the ## ÂNGULO header)
    const firstNewline = sec.indexOf('\n')
    const body = firstNewline >= 0 ? sec.slice(firstNewline + 1) : ''

    angles.push({
      id      : n,
      title,
      ...parseAngleBody(body),
      snapshot: snapshots[n] ?? null,
    })
  }

  if (angles.length === 0) return null

  // 3. Parse RECOMENDAÇÃO DO ROTEIRISTA section
  let recommendation = null
  const recSec = sections.find(s =>
    /^## RECOMENDAÇÃO DO ROTEIRISTA/im.test(s.replace(/\*\*([^*]*)\*\*/g, '$1'))
  )
  if (recSec) {
    const rb  = stripMd(recSec.replace(/^##[^\n]+\n/m, ''))
    const rn  = rb.match(/ÂNGULO RECOMENDADO:\s*(\d+)/i)
    const why = rb.match(/POR QUÊ:\s*([\s\S]*?)(?=\nSEGUNDO LUGAR:|$)/im)
    const rup = rb.match(/SEGUNDO LUGAR:\s*(\d+)/i)
    const wno = rb.match(/POR QUE NÃO:\s*([\s\S]*?)(?=\n##|$)/im)
    recommendation = {
      angleId        : rn  ? +rn[1]       : null,
      why            : why ? why[1].trim() : '',
      runnerUpAngleId: rup ? +rup[1]       : null,
      whyNotRunnerUp : wno ? wno[1].trim() : '',
    }
  }

  // 4. Parse REGISTRO FACTUAL section
  const factualClaims = []
  const ldSec = sections.find(s =>
    /^## REGISTRO FACTUAL/im.test(s.replace(/\*\*([^*]*)\*\*/g, '$1'))
  )
  if (ldSec) {
    const ldBody   = ldSec.replace(/^##[^\n]+\n/m, '')
    const claimRx  = /\[([^\]]+)\]\s*Afirmação:\s*([^|]+)\|\s*Confiança:\s*(ALTA|MÉDIA|BAIXA)\s*\|\s*Fonte:\s*([^|]+)(?:\|\s*Nuance:\s*(.+))?/gi
    let cm
    while ((cm = claimRx.exec(ldBody)) !== null) {
      factualClaims.push({
        id        : cm[1].trim(),
        claim     : cm[2].trim(),
        confidence: cm[3],
        source    : cm[4].trim(),
        nuance    : cm[5] ? cm[5].trim() : '',
        critical  : cm[3] !== 'ALTA',
      })
    }
  }

  // 5. Sort: recommended angle first
  const recId  = recommendation?.angleId
  const sorted = recId
    ? [...angles.filter(a => a.id === recId), ...angles.filter(a => a.id !== recId)]
    : angles

  return {
    angles                : sorted,
    recommendation,
    factualClaims,
    approvedAngleSnapshots: snapshots,
    artifactMarkdown      : text,     // original Markdown preserved untouched
  }
}

// ─── USER PROMPTS ──────────────────────────────────────────────────────────────

function conceptPitchPrompt(brief, mode) {
  const writerMode = brief.writerMode || 'factual'
  const isFiction  = writerMode === 'fiction'

  if (mode === 'debug') {
    return `Você é o Writer (Head Writer / Roteirista) do ZhongX Studio. Modo: ${writerMode.toUpperCase()}.

IMPORTANTE: Escreva todo o output em Português do Brasil. Nenhuma seção, título, label ou conteúdo deve aparecer em inglês — incluindo termos técnicos do pipeline que tenham equivalente natural em português.

O CEO entregou o seguinte brief. Execute as fases de pesquisa e geração de ângulos/histórias do seu runtime:

BRIEF:
${briefToText(brief)}

Deliver the full concept pitch exactly as defined in your runtime DELIVERABLES section.
Do NOT write the full script. Stop after the concept pitch. CEO Gate #1 pending.`
  }

  // Production — Fiction
  if (isFiction) {
    return `Você é o Writer do ZhongX Studio. Modo: PRODUCTION — FICTION.

BRIEF:
${briefToText(brief)}

Execute internamente Story Discovery — explore possibilidades narrativas genuinamente distintas antes de apresentar. Gere 3 histórias com conflito, protagonista e arco emocional diferentes.

Entregue no formato Production Fiction definido no seu runtime:

## HISTÓRIA RECOMENDADA — TÍTULO
(campos: IDEIA, ABERTURA, JORNADA EMOCIONAL, POR QUE ESTA HISTÓRIA, RISCO)

## HISTÓRIA 2 — TÍTULO
(mesmos campos em formato compacto)

## HISTÓRIA 3 — TÍTULO
(mesmos campos em formato compacto)

## WRITER RECOMMENDATION
(RECOMMENDED STORY, WHY THIS ONE, MAIN ADVANTAGE, MAIN RISK, WHY NOT THE RUNNER-UP)

## APPROVED STORY SNAPSHOT
(JSON completo conforme definido no seu runtime para a história recomendada)

## CEO DECISION
(deixar em branco — o CEO preencherá)

Escreva em Português do Brasil. Não escreva o roteiro completo. CEO Gate #1 pendente.`
  }

  // Production — Factual
  return `Você é o Writer do ZhongX Studio. Modo: PRODUCTION.

BRIEF:
${briefToText(brief)}

Execute internamente: pesquisa de material narrativo (todas as 11 categorias), identificação de Motores Narrativos e Tensões Centrais, Transformação para cada ângulo. Gere preferencialmente 3 ângulos genuinamente distintos.

Entregue no formato Production definido no seu runtime:
- ÂNGULO 1/2/3 com GANCHO, MOTOR NARRATIVO, TENSÃO CENTRAL, TRANSFORMAÇÃO (ANTES/DEPOIS), PROMESSA CENTRAL, RISCO PRINCIPAL
- RECOMENDAÇÃO DO ROTEIRISTA
- REGISTRO FACTUAL (claims narrativo-críticos e confiança MÉDIA/BAIXA)
- SNAPSHOTS DE ÂNGULOS

Não serializar Research Log. Não incluir análise longa de retenção por ângulo. Escreva em Português do Brasil.`
}

function scriptPrompt(brief, gateDecision, approvedAngleSnapshot, mode) {
  const writerMode = brief.writerMode || 'factual'
  const isFiction  = writerMode === 'fiction'

  if (mode === 'debug') {
    return `Você é o Writer (Head Writer / Roteirista) do ZhongX Studio. Modo: ${writerMode.toUpperCase()}.

IMPORTANTE: Escreva todo o output em Português do Brasil. Nenhuma seção, título, label ou conteúdo deve aparecer em inglês.

O CEO Gate #1 foi aprovado. Execute as fases de escrita e revisão do roteiro do seu runtime.

BRIEF:
${briefToText(brief)}

CEO GATE #1 — DECISÃO APROVADA:
${gateDecision}

Deliver the complete script exactly as defined in your runtime DELIVERABLES section.
Important: no unresolved narrative placeholders may remain. Do not execute any other agent. Stop after the script is complete.`
  }

  // Production
  const snapshotLabel = isFiction ? 'APPROVED STORY SNAPSHOT' : 'APPROVED ANGLE SNAPSHOT'
  const snapshotBlock = approvedAngleSnapshot
    ? `\n${snapshotLabel}:\n${approvedAngleSnapshot}\n`
    : ''

  if (isFiction) {
    return `Você é o Writer do ZhongX Studio. Modo: PRODUCTION — FICTION.

BRIEF:
${briefToText(brief)}

CEO GATE #1 — HISTÓRIA APROVADA:
${gateDecision}
${snapshotBlock}
Execute planejamento interno (story spine, progressão causal, turning points, setup→payoff, arco do personagem, continuidade). Não serializar planejamento no output.

Escreva o roteiro ficcional no formato Production definido no seu runtime:
- Header (História aprovada, Protagonista, Conflito Central, Arco Emocional, Duração, Plataforma, Tom)
- GANCHO — cena de abertura com propósito e NARRAÇÃO
- Todas as cenas com NARRAÇÃO e INTENÇÃO VISUAL NARRATIVA onde necessário
- PAYOFF + CTA
- STORY CONTINUITY LEDGER atualizado
- AUTOAVALIAÇÃO: APROVADO ou REPROVADO com problema específico

Sem placeholders narrativos não resolvidos. Escreva em Português do Brasil.`
  }

  // Production — Factual
  return `Você é o Writer do ZhongX Studio. Modo: PRODUCTION.

BRIEF:
${briefToText(brief)}

CEO GATE #1 — DIREÇÃO APROVADA:
${gateDecision}
${snapshotBlock}
Execute Story Spine internamente como planejamento obrigatório — não serializar no output. Escreva o roteiro no formato Production definido no seu runtime:
- GANCHO com NARRAÇÃO e INTENÇÃO VISUAL NARRATIVA
- CENAS com NARRAÇÃO e INTENÇÃO VISUAL NARRATIVA (quando a cena depende de comunicação visual)
- PAYOFF + CTA
- REGISTRO FACTUAL — ATUALIZAÇÕES (novos claims narrativo-críticos não cobertos no Concept Pitch)
- AUTOAVALIAÇÃO: APROVADO ou REPROVADO com problema específico

Sem Story Spine no output. Sem checklist de Autoavaliação. Escreva em Português do Brasil.`
}

// ─── PUBLIC API ────────────────────────────────────────────────────────────────

export async function gerarConceptPitch(brief, mode = 'production', res) {
  const writerMode   = brief.writerMode || 'factual'
  const systemPrompt = mode === 'debug' ? loadDebugPrompt(writerMode) : loadProductionPrompt(writerMode)
  const userPrompt   = conceptPitchPrompt(brief, mode)
  const maxTokens    = MAX_TOKENS[mode]?.conceptPitch ?? MAX_TOKENS.production.conceptPitch
  // Parse structured data in production mode only; bind writerMode for fiction parser
  const parseOutput  = mode === 'production'
    ? (text) => parseConceptPitchText(text, writerMode)
    : null
  await stream(systemPrompt, userPrompt, maxTokens, mode, res, parseOutput)
}

export async function gerarScript(brief, gateDecision, approvedAngleSnapshot = '', mode = 'production', res) {
  const writerMode   = brief.writerMode || 'factual'
  const systemPrompt = mode === 'debug' ? loadDebugPrompt(writerMode) : loadProductionPrompt(writerMode)
  const userPrompt   = scriptPrompt(brief, gateDecision, approvedAngleSnapshot, mode)
  const maxTokens    = MAX_TOKENS[mode]?.script ?? MAX_TOKENS.production.script
  await stream(systemPrompt, userPrompt, maxTokens, mode, res)
}

// ─── STREAM ────────────────────────────────────────────────────────────────────
//
// PROMPT CACHING — Production Mode only.
//
// In production, the system prompt (writer-core.md + mode file) is marked
// with cache_control: { type: "ephemeral" }. Anthropic caches the prefix for
// ~5 minutes. Cache hits reduce input cost from $3.00/MTok to $0.30/MTok (~90%).
//
// Cache writes cost slightly more ($3.75/MTok) but are amortized on the first
// hit. In a typical session (multiple videos or both CP + Script calls), caching
// is net-positive from the first hit.
//
// Debug mode uses the plain string form — no caching — to preserve full
// auditability without cache interference.
//
// parseOutput (optional): called once with the full accumulated text after
// streaming ends. If it returns a non-null value, that value is included as
// `structured` in the done event. Parsing failures are non-fatal — the done
// event is still sent without structured data.

async function stream(systemPrompt, userPrompt, maxTokens, mode, res, parseOutput = null) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Production: array form with cache_control. Debug: plain string.
  const system = mode === 'production'
    ? [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }]
    : systemPrompt

  try {
    const s = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    })

    let fullText = ''

    for await (const chunk of s) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        fullText += chunk.delta.text
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
      }
    }

    // Build done payload — include structured data if a parser was provided
    const donePayload = { done: true }
    if (parseOutput) {
      try {
        const structured = parseOutput(fullText)
        if (structured) donePayload.structured = structured
      } catch (parseErr) {
        console.warn('[writer] parseOutput failed:', parseErr.message)
      }
    }

    res.write(`data: ${JSON.stringify(donePayload)}\n\n`)
    res.end()
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
    res.end()
  }
}
