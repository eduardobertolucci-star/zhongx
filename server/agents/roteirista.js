import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const __dirname = dirname(fileURLToPath(import.meta.url))
const RUNTIME_DIR = join(__dirname, '../../runtime')

function loadRuntimeContext(writerMode) {
  const mode = writerMode || 'factual'

  const core = readFileSync(join(RUNTIME_DIR, 'writer-core.md'), 'utf8')

  const modeFile = mode === 'fiction' ? 'writer-fiction.md' : 'writer-factual.md'
  const modeContext = readFileSync(join(RUNTIME_DIR, modeFile), 'utf8')

  return `${core}\n\n---\n\n${modeContext}`
}

export async function gerarRoteiro({ tema, duracao, estilo, voz, observacoes, writerMode }, res) {
  const mode = writerMode || 'factual'
  const systemPrompt = loadRuntimeContext(mode)

  const duracaoSegundos = parseInt(duracao) * 60

  const userPrompt = `
BRIEF DO CEO:

Tema: ${tema}
Duração alvo: ${duracao} minutos (~${duracaoSegundos}s)
Estilo visual: ${estilo}
Voz do narrador: ${voz}
Writer Mode: ${mode.toUpperCase()}
${observacoes ? `Observações do CEO: ${observacoes}` : ''}

---

Comece pelo CONCEPT PITCH com 3 ângulos narrativos distintos conforme as instruções do seu runtime.

Após o Concept Pitch, inclua sua WRITER RECOMMENDATION e aguarde o CEO DECISION antes de escrever o roteiro completo.
`.trim()

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    for await (const chunk of stream) {
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
