import Anthropic from '@anthropic-ai/sdk'
import { put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const client   = new Anthropic()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.join(__dirname, '../..')

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

function loadIllustratorPrompt() {
  return fs.readFileSync(path.join(ROOT, 'runtime/illustrator.md'), 'utf-8')
}

// ─── STORYBOARD TEXT PROMPT ───────────────────────────────────────────────────

function briefContext(brief) {
  return [
    `Tema: ${brief.tema}`,
    `Tom: ${brief.tom || 'Intrigante, inteligente e acessível'}`,
    `Plataforma: ${brief.plataforma || 'YouTube'}`,
    `Duração alvo: ${brief.duracao} minutos`,
    `Writer Mode: ${(brief.writerMode   || 'factual').toUpperCase()}`,
    `Audience Mode: ${(brief.audienceMode || 'general').toUpperCase()}`,
    ...(brief.targetAge ? [`Target Age: ${brief.targetAge}`] : []),
  ].join('\n')
}

function scenesToText(scenes) {
  return scenes.map(s => {
    const parts = [`## ${s.fullTitle || s.type}\n\n**NARRAÇÃO**\n${s.narration}`]
    if (s.visualIntent) parts.push(`**INTENÇÃO VISUAL NARRATIVA**\n${s.visualIntent}`)
    return parts.join('\n\n')
  }).join('\n\n---\n\n')
}

function buildUserPrompt(brief, scenes) {
  return `BRIEF:\n${briefContext(brief)}\n\nROTEIRO — ${scenes.length} cenas:\n\n${scenesToText(scenes)}\n\nAnalise cada cena. Decida quantos beats cada uma precisa. Gere o storyboard completo no formato definido no seu runtime.`
}

// ─── STORYBOARD IMAGE GENERATION ──────────────────────────────────────────────

function buildImagePrompt(storyboardData, brief) {
  const { visualStyle, beats } = storyboardData

  // Select one beat per scene (skip sub-beats like beat-2a, beat-2b)
  // Primary beats have IDs like beat-1, beat-2, beat-3
  const primaryBeats = beats.filter(b => /^beat-\d+$/.test(b.id))
  const keyBeats = (primaryBeats.length >= 3 ? primaryBeats : beats).slice(0, 8)

  const cols = keyBeats.length <= 4 ? 2 : 3
  const rows = Math.ceil(keyBeats.length / cols)

  const panels = keyBeats.map((b, i) => {
    const label = b.sceneRef?.split(/[—–]/)[0]?.trim() || `Beat ${i + 1}`
    // Keep concept very short (≤10 words) so the prompt stays concise
    const concept = b.visualConcept?.split('.')[0]?.split(',')[0]?.trim() || ''
    return `Panel ${i + 1} "${label}": ${concept}`
  }).join('; ')

  const style = visualStyle || 'flat vector illustration'
  const topic = brief.tema || 'educational video'

  return `A professional storyboard sheet for an educational video about "${topic}". ${rows} rows × ${cols} columns grid of hand-drawn panels, each with a thin black border and a small label below. ${style}. Simple, clean sketches. ${panels}. No written words or text inside the panels themselves. Storyboard layout, sequential panels, sketch aesthetic.`
}

export async function generateStoryboardImage(storyboardData, brief) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

  const prompt = buildImagePrompt(storyboardData, brief)

  // 1. Generate image via DALL-E 3
  const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model:   'dall-e-3',
      prompt:  prompt.slice(0, 4000),
      size:    '1792x1024',
      quality: 'standard',
      n:       1,
    }),
  })

  if (!dalleRes.ok) {
    const err = await dalleRes.json()
    throw new Error(err.error?.message || `DALL-E error ${dalleRes.status}`)
  }

  const dalleData = await dalleRes.json()
  const tempUrl   = dalleData.data[0].url

  // 2. Fetch image bytes from the temporary DALL-E URL
  const imgRes = await fetch(tempUrl)
  if (!imgRes.ok) throw new Error('Failed to fetch generated image')
  const imgBuffer = await imgRes.arrayBuffer()

  // 3. Upload permanently to Vercel Blob
  const filename  = `storyboards/${Date.now()}.png`
  const { url }   = await put(filename, imgBuffer, {
    access:      'public',
    contentType: 'image/png',
  })

  return url
}

// ─── STORYBOARD PARSER ────────────────────────────────────────────────────────

function parseStoryboard(text) {
  const getHeader = (label) => {
    const m = text.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`))
    return m ? m[1].trim() : ''
  }

  const artDirection = getHeader('Direção Visual')
  const colorPalette = getHeader('Paleta de Cores')
  const visualStyle  = getHeader('Estilo Visual')
  const typography   = getHeader('Tipografia')

  const parts = text.split(/(?=^## BEAT \S)/m).filter(p => /^## BEAT \S/.test(p))

  const beats = parts.map((part, i) => {
    const headerM   = part.match(/^## BEAT (\S+)\s*[—–-]\s*(.+)/m)
    const beatId    = headerM ? `beat-${headerM[1].toLowerCase()}` : `beat-${i + 1}`
    const beatTitle = headerM ? headerM[2].trim() : ''

    const f = (label) => {
      const m = part.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, 'i'))
      return m ? m[1].trim() : ''
    }

    const promptM   = part.match(/\*\*Prompt:\*\*\s*\n([\s\S]+?)(?=\n\*\*Negativo:|^---|\n---\s*$)/im)
    const negativoM = part.match(/\*\*Negativo:\*\*\s*([^\n]+)/i)

    return {
      id:               beatId,
      title:            beatTitle,
      sceneRef:         f('Cena'),
      visualConcept:    f('Conceito Visual'),
      narrationSegment: f('Narração coberta').replace(/^[""\u201c]|[""\u201d]$/g, ''),
      composition:      f('Composição'),
      framing:          f('Enquadramento'),
      motion:           f('Movimento'),
      onScreenText:     f('Texto em Tela'),
      colorMood:        f('Cor / Clima'),
      prompt:           promptM ? promptM[1].trim() : '',
      negative:         negativoM ? negativoM[1].trim() : '',
    }
  })

  return { version: 1, artDirection, colorPalette, visualStyle, typography, totalBeats: beats.length, beats, artifactMarkdown: text }
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export async function generateStoryboard(brief, scenes, res) {
  const systemPrompt = loadIllustratorPrompt()
  const userPrompt   = buildUserPrompt(brief, scenes)

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  let fullText = ''

  try {
    // Phase 1: stream storyboard text
    const stream = await client.messages.stream({
      model:      'claude-sonnet-4-6',
      max_tokens: 16000,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userPrompt }],
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const text = chunk.delta.text
        fullText  += text
        res.write(`data: ${JSON.stringify({ text })}\n\n`)
      }
    }

    const structured = parseStoryboard(fullText)
    res.write(`data: ${JSON.stringify({ done: true, structured })}\n\n`)
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
  }

  res.end()
}
