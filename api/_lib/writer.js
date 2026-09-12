import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../..')

// ─── SYSTEM PROMPT LOADERS ─────────────────────────────────────────────────────

function loadProductionPrompt() {
  return fs.readFileSync(path.join(ROOT, 'runtime/writer-core.md'), 'utf-8')
}

function loadDebugPrompt() {
  const claudeMd   = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf-8')
  const writerMd   = fs.readFileSync(path.join(ROOT, 'agents/writer.md'), 'utf-8')
  const principles = fs.readFileSync(path.join(ROOT, 'rules/studio-principles.md'), 'utf-8')
  const retention  = fs.readFileSync(path.join(ROOT, 'rules/viral-retention.md'), 'utf-8')
  return [
    '# STUDIO OS\n' + claudeMd,
    '# WRITER AGENT\n' + writerMd,
    '# STUDIO PRINCIPLES\n' + principles,
    '# VIRAL RETENTION\n' + retention,
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
  return [
    `Tema: ${brief.tema}`,
    `Objetivo: ${brief.objetivo || 'Criar um vídeo educacional envolvente sobre o tema.'}`,
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

export function parseConceptPitchText(text) {
  if (!text || text.length < 50) return null

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
  if (mode === 'debug') {
    return `Você é o Writer (Head Writer / Roteirista) do ZhongX Studio.

IMPORTANTE: Escreva todo o output em Português do Brasil. Nenhuma seção, título, label ou conteúdo deve aparecer em inglês — incluindo termos técnicos do pipeline que tenham equivalente natural em português.

O CEO entregou o seguinte brief. Execute as Fases 1–7 do seu método de trabalho:
leia o brief, conduza a Pesquisa de Material Narrativo, identifique Narrative Engines e Central Tensions,
gere 3–5 ângulos genuinamente distintos e entregue o concept-pitch.md completo.

BRIEF:
${briefToText(brief)}

Deliver the full concept-pitch.md exactly as defined in your DELIVERABLES section:
- WRITER'S RESEARCH LOG (all 11 Story Material Discovery categories)
- 3–5 fully structured ANGLES (each with Narrative Engine, Central Tension, Hook, Curiosity Gap,
  Viewer Transformation, Angle Profile, WHY IT COULD FAIL)
- WRITER RECOMMENDATION (with explicit runner-up comparison)
- FACTUAL CLAIM LEDGER (all narrative-critical claims across all angles)
- CEO DECISION section (leave blank — the CEO will fill it)

Do NOT write the full script. Stop after the concept pitch. This is CEO Gate #1 pending.`
  }

  // Production
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
  if (mode === 'debug') {
    return `Você é o Writer (Head Writer / Roteirista) do ZhongX Studio.

IMPORTANTE: Escreva todo o output em Português do Brasil. Nenhuma seção, título, label ou conteúdo deve aparecer em inglês.

O CEO Gate #1 foi aprovado. Execute as Fases 8–14 do seu método de trabalho:
construa o Story Spine, escreva o script completo cena a cena, e execute todos os passes
(Economia de Informação, Linguagem Falada, Densidade de Atenção Narrativa, Integridade Factual, Self Review).

BRIEF:
${briefToText(brief)}

CEO GATE #1 — APPROVED DIRECTION:
${gateDecision}

Deliver the complete script.md exactly as defined in your DELIVERABLES section:
- Header (Approved angle, Narrative Engine, Central Tension, Viewer Transformation, Target duration, Platform, Tone)
- STORY SPINE (all 10 beats)
- HOOK SEQUENCE with scene purpose, narration, loop tags, and Narrative Visual Intent
- All scenes from hook to CTA — each with SCENE ID, scene purpose, narration, loop tags where applicable,
  and Narrative Visual Intent where needed
- FACTUAL CLAIM LEDGER updates (any new narrative-critical claims introduced in the script)
- CLAIMS MEDIUM/LOW used in the script with framing confirmation
- SELF REVIEW checklist (all items)

Important: no unresolved narrative placeholders ([RE-HOOK], [TBD], [EXAMPLE], etc.) may remain.
Do not execute any other agent. Stop after script.md is complete.`
  }

  // Production
  const snapshotBlock = approvedAngleSnapshot
    ? `\nAPPROVED ANGLE SNAPSHOT:\n${approvedAngleSnapshot}\n`
    : ''

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
  const systemPrompt = mode === 'debug' ? loadDebugPrompt() : loadProductionPrompt()
  const userPrompt   = conceptPitchPrompt(brief, mode)
  const maxTokens    = MAX_TOKENS[mode]?.conceptPitch ?? MAX_TOKENS.production.conceptPitch
  // Parse structured data in production mode only; debug format differs
  const parseOutput  = mode === 'production' ? parseConceptPitchText : null
  await stream(systemPrompt, userPrompt, maxTokens, mode, res, parseOutput)
}

export async function gerarScript(brief, gateDecision, approvedAngleSnapshot = '', mode = 'production', res) {
  const systemPrompt = mode === 'debug' ? loadDebugPrompt() : loadProductionPrompt()
  const userPrompt   = scriptPrompt(brief, gateDecision, approvedAngleSnapshot, mode)
  const maxTokens    = MAX_TOKENS[mode]?.script ?? MAX_TOKENS.production.script
  await stream(systemPrompt, userPrompt, maxTokens, mode, res)
}

// ─── STREAM ────────────────────────────────────────────────────────────────────
//
// PROMPT CACHING — Production Mode only.
//
// In production, the system prompt (writer-core.md, ~4,200 tokens) is marked
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
