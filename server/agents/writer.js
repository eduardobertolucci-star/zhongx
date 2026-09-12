import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../..')
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function loadSystemPrompt() {
  const claudeMd      = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf-8')
  const writerMd      = fs.readFileSync(path.join(ROOT, 'agents/writer.md'), 'utf-8')
  const principles    = fs.readFileSync(path.join(ROOT, 'rules/studio-principles.md'), 'utf-8')
  const retention     = fs.readFileSync(path.join(ROOT, 'rules/viral-retention.md'), 'utf-8')

  return [
    '# STUDIO OS\n' + claudeMd,
    '# WRITER AGENT\n' + writerMd,
    '# STUDIO PRINCIPLES\n' + principles,
    '# VIRAL RETENTION\n' + retention,
  ].join('\n\n---\n\n')
}

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

export async function gerarConceptPitch(brief, res) {
  const systemPrompt = loadSystemPrompt()

  const userPrompt = `You are the Writer (Head Writer / Roteirista) of ZhongX Studio.

The CEO has delivered the following brief. Execute Phases 1–7 of your working method:
read the brief, conduct Story Material Research, identify Narrative Engines and Central Tensions,
generate 3–5 genuinely distinct angles, and deliver the complete concept-pitch.md.

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

  await stream(systemPrompt, userPrompt, res)
}

export async function gerarScript(brief, gateDecision, res) {
  const systemPrompt = loadSystemPrompt()

  const userPrompt = `You are the Writer (Head Writer / Roteirista) of ZhongX Studio.

CEO Gate #1 has been approved. Execute Phases 8–14 of your working method:
construct the Story Spine, write the complete script scene by scene, then run all passes
(Information Economy, Spoken Language, Narrative Attention Density, Factual Integrity, Self Review).

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

  await stream(systemPrompt, userPrompt, res)
}

async function stream(systemPrompt, userPrompt, res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const s = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      system: systemPrompt,
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
