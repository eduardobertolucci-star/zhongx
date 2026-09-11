import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é o Roteirista do ZhongX Studio, um escritório de produção audiovisual especializado em vídeos educativos virais.

Seu trabalho é criar roteiros longos, envolventes e extremamente virais para vídeos educativos no estilo YouTube/TikTok educacional.

ESTRUTURA OBRIGATÓRIA DO ROTEIRO:
- GANCHO INICIAL (primeiros 30 segundos): pergunta provocativa ou afirmação surpreendente que prende a atenção
- DESENVOLVIMENTO em CENAS numeradas (CENA 1, CENA 2, etc.)
- Cada cena deve ter: título, indicação de narração, indicação visual/animação sugerida
- CONCLUSÃO com chamada para ação
- CRÉDITOS/ENCERRAMENTO

REGRAS DE ESTILO:
- Linguagem acessível, sem jargão desnecessário
- Ritmo dinâmico — frases curtas intercaladas com explicações mais longas
- Use analogias do cotidiano para explicar conceitos complexos
- Indique pausas dramáticas com [pausa]
- Indique tom da narração entre colchetes: [voz grave], [animado], [misterioso]
- Indique sugestões visuais entre parênteses: (animação mostrando...) (texto aparece na tela...)
- Cada cena deve ter duração estimada em segundos

Gere o roteiro COMPLETO e LONGO — não resuma, não corte. O roteiro deve cobrir toda a duração solicitada.`

export async function gerarRoteiro({ tema, duracao, estilo, voz, observacoes }, res) {
  const duracaoSegundos = parseInt(duracao) * 60
  const numCenas = Math.ceil(parseInt(duracao) * 1.5)

  const userPrompt = `Faça um roteiro bem forte, acadêmico, extremamente viral para um vídeo no YouTube falando sobre o tema "${tema}". Preciso que o vídeo seja longo, cerca de ${duracao} minutos, então elabore um roteiro cativante, entusiasta e que prenda a atenção das pessoas para aprender o conteúdo.

ESPECIFICAÇÕES TÉCNICAS:
DURAÇÃO ALVO: ${duracao} minutos (aproximadamente ${duracaoSegundos} segundos)
ESTILO VISUAL: ${estilo}
VOZ DO NARRADOR: ${voz}
NÚMERO DE CENAS: aproximadamente ${numCenas} cenas
${observacoes ? `ORIENTAÇÕES ADICIONAIS DO CEO: ${observacoes}` : ''}

Comece com um gancho irresistível nos primeiros 30 segundos. O roteiro deve ser completo, sem cortes ou resumos.`

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
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
