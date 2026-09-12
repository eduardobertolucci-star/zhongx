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
    ? `\nAPROVED ANGLE SNAPSHOT:\n${approvedAngleSnapshot}\n`
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
  await stream(systemPrompt, userPrompt, maxTokens, mode, res)
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

async function stream(systemPrompt, userPrompt, maxTokens, mode, res) {
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

    for await (const chunk of s) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
    res.end()
  }
}
