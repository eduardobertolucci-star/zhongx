import 'dotenv/config'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.join(__dirname, '../..')
const RUNTIME   = path.join(ROOT, 'runtime')

function loadRuntimeContext(writerMode) {
  const mode     = writerMode || 'factual'
  const core     = fs.readFileSync(path.join(RUNTIME, 'writer-core.md'), 'utf-8')
  const modeFile = mode === 'fiction' ? 'writer-fiction.md' : 'writer-factual.md'
  const modeCtx  = fs.readFileSync(path.join(RUNTIME, modeFile), 'utf-8')
  return `${core}\n\n---\n\n${modeCtx}`
}

function loadStudioRules() {
  const claudeMd   = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf-8')
  const principles = fs.readFileSync(path.join(ROOT, 'rules/studio-principles.md'), 'utf-8')
  const retention  = fs.readFileSync(path.join(ROOT, 'rules/viral-retention.md'), 'utf-8')
  return [
    '# STUDIO OS\n' + claudeMd,
    '# STUDIO PRINCIPLES\n' + principles,
    '# VIRAL RETENTION\n' + retention,
  ].join('\n\n---\n\n')
}

function buildSystemPrompt(writerMode) {
  const runtime     = loadRuntimeContext(writerMode)
  const studioRules = loadStudioRules()
  return `# WRITER RUNTIME\n${runtime}\n\n---\n\n${studioRules}`
}

function briefToText(brief) {
  return [
    `Tema: ${brief.tema}`,
    `Writer Mode: ${(brief.writerMode || 'factual').toUpperCase()}`,
    `Objetivo: ${brief.objetivo || 'Criar um vídeo educacional envolvente sobre o tema.'}`,
    `Público: ${brief.publico || 'Público geral interessado em ciência, história e curiosidades.'}`,
    `Plataforma: ${brief.plataforma || 'YouTube'}`,
    `Duração alvo: ${brief.duracao} minutos`,
    `Tom: ${brief.tom || 'Intrigante, inteligente e acessível, sem sensacionalismo.'}`,
    `Mensagem principal: ${brief.mensagem || brief.tema}`,
    brief.restricoes ? `Restrições do CEO: ${brief.restricoes}` : '',
  ].filter(Boolean).join('\n')
}

export async function gerarConceptPitch(brief, res) {
  const writerMode   = brief.writerMode || 'factual'
  const systemPrompt = buildSystemPrompt(writerMode)
  const isFiction    = writerMode === 'fiction'

  const userPrompt = `Você é o Writer (Head Writer / Roteirista) do ZhongX Studio operando em modo ${writerMode.toUpperCase()}.

IMPORTANTE: Escreva todo o output em Português do Brasil.

O CEO entregou o seguinte brief. Execute as fases de pesquisa e geração de ângulos do seu runtime:

BRIEF:
${briefToText(brief)}

${isFiction
  ? `Entregue o Concept Pitch Ficcional completo conforme definido no seu runtime:
- STORY DISCOVERY (explore possibilidades narrativas internas antes de apresentar)
- 3 HISTÓRIAS genuinamente distintas — cada uma com Título, Ideia, Protagonista, Conflito Central, Arco Emocional, Abertura/Hook, Risco Principal
- RECOMENDAÇÃO DO ROTEIRISTA (com comparação explícita entre as histórias)
- APPROVED STORY SNAPSHOT para a história recomendada (JSON)
- SEÇÃO CEO DECISION (deixar em branco — o CEO preencherá)

NÃO escreva o roteiro completo. Pare após o Concept Pitch. CEO Gate #1 pendente.`
  : `Entregue o concept-pitch.md completo conforme definido no seu runtime:
- REGISTRO DE PESQUISA DO ROTEIRISTA (todas as 11 categorias de Story Material Discovery)
- 3–5 ÂNGULOS completamente estruturados (cada um com Narrative Engine, Central Tension, Hook, Curiosity Gap, Viewer Transformation, Angle Profile, WHY IT COULD FAIL)
- RECOMENDAÇÃO DO ROTEIRISTA (com comparação explícita do runner-up)
- REGISTRO DE CLAIMS FACTUAIS (todos os claims narrativo-críticos)
- SEÇÃO CEO DECISION (deixar em branco — o CEO preencherá)

NÃO escreva o roteiro completo. Pare após o concept pitch. CEO Gate #1 pendente.`
}`

  await stream(systemPrompt, userPrompt, res)
}

export async function gerarScript(brief, gateDecision, res) {
  const writerMode   = brief.writerMode || 'factual'
  const systemPrompt = buildSystemPrompt(writerMode)
  const isFiction    = writerMode === 'fiction'

  const userPrompt = `Você é o Writer (Head Writer / Roteirista) do ZhongX Studio operando em modo ${writerMode.toUpperCase()}.

IMPORTANTE: Escreva todo o output em Português do Brasil.

O CEO Gate #1 foi aprovado. Execute as fases de escrita e revisão do roteiro do seu runtime.

BRIEF:
${briefToText(brief)}

CEO GATE #1 — DECISÃO APROVADA:
${gateDecision}

${isFiction
  ? `Entregue o roteiro ficcional completo conforme definido no seu runtime:
- Header (História aprovada, Protagonista, Conflito Central, Arco Emocional, Duração, Plataforma, Tom)
- STORY SPINE (planejamento interno completo)
- GANCHO (abertura que começa imediatamente — sem warm-up)
- Todas as cenas do gancho ao payoff — cada uma com propósito, narração e Narrative Visual Intent onde necessário
- STORY CONTINUITY LEDGER atualizado
- SELF REVIEW completo

Sem placeholders narrativos não resolvidos. Não avance para outros agentes.`
  : `Entregue o script.md completo conforme definido no seu runtime:
- Header (Ângulo aprovado, Narrative Engine, Central Tension, Viewer Transformation, Duração, Plataforma, Tom)
- STORY SPINE (todos os 10 beats)
- GANCHO com propósito de cena, narração, marcadores de loop e Narrative Visual Intent
- Todas as cenas do gancho ao CTA — cada uma com ID, propósito, narração, marcadores de loop e Narrative Visual Intent onde necessário
- REGISTRO DE CLAIMS FACTUAIS atualizado
- SELF REVIEW completo

Sem placeholders narrativos não resolvidos. Não avance para outros agentes.`
}`

  await stream(systemPrompt, userPrompt, res)
}

async function stream(systemPrompt, userPrompt, res) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
