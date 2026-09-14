import { useState } from 'react'

const FRAMING_STYLE = {
  'Close-up':    'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  'Médio':       'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  'Aberto':      'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  'Abstrato':    'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  'Diagrama':    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  'Tipográfico': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
}

const MOTION_STYLE = {
  'Estático': 'bg-zinc-700/60 text-zinc-400',
  'Pan':      'bg-blue-500/15 text-blue-400',
  'Zoom':     'bg-indigo-500/15 text-indigo-400',
  'Fade':     'bg-zinc-600/60 text-zinc-300',
  'Animação': 'bg-emerald-500/15 text-emerald-400',
}

function framingClass(framing) {
  for (const [k, v] of Object.entries(FRAMING_STYLE)) {
    if (framing && framing.startsWith(k)) return v
  }
  return 'bg-zinc-700/60 text-zinc-400'
}

function motionClass(motion) {
  for (const [k, v] of Object.entries(MOTION_STYLE)) {
    if (motion && motion.startsWith(k)) return v
  }
  return 'bg-zinc-700/60 text-zinc-400'
}

function beatLabel(id) {
  return id.replace('beat-', '').toUpperCase()
}

function BeatCard({ beat, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [copied, setCopied]     = useState(false)

  const copyPrompt = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(beat.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3.5 text-left flex items-start gap-3 hover:bg-zinc-800/40 transition-colors"
      >
        <span className="text-xs font-bold text-zinc-600 tracking-widest shrink-0 w-10 mt-0.5">
          {beatLabel(beat.id)}
        </span>
        <div className="flex-1 min-w-0">
          {beat.sceneRef && (
            <p className="text-zinc-500 text-xs mb-1 truncate">{beat.sceneRef}</p>
          )}
          <p className="text-zinc-100 text-sm font-medium leading-snug">{beat.visualConcept}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {beat.framing && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${framingClass(beat.framing)}`}>
                {beat.framing}
              </span>
            )}
            {beat.motion && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${motionClass(beat.motion)}`}>
                {beat.motion}
              </span>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-600 shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body — collapsible */}
      {expanded && (
        <div className="border-t border-zinc-800 px-4 pt-3 pb-4 space-y-3">
          {beat.composition && (
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Composição</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{beat.composition}</p>
            </div>
          )}
          {beat.narrationSegment && (
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Narração coberta</p>
              <p className="text-zinc-400 text-sm italic">"{beat.narrationSegment}"</p>
            </div>
          )}
          {beat.colorMood && (
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Cor / Clima</p>
              <p className="text-zinc-300 text-sm">{beat.colorMood}</p>
            </div>
          )}
          {beat.onScreenText && beat.onScreenText !== 'Nenhum' && (
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Texto em Tela</p>
              <p className="text-zinc-300 text-sm">{beat.onScreenText}</p>
            </div>
          )}
          {beat.prompt && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-zinc-600 uppercase tracking-wider">Prompt de Geração</p>
                <button
                  onClick={copyPrompt}
                  className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
              <pre className="text-xs text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg p-3 whitespace-pre-wrap leading-relaxed font-mono">
                {beat.prompt}
              </pre>
              {beat.negative && (
                <p className="text-xs text-zinc-600 mt-1.5">
                  <span className="font-medium text-zinc-500">Negativo:</span> {beat.negative}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function StoryboardView({ storyboardData }) {
  const [allCopied, setAllCopied] = useState(false)
  const { artDirection, colorPalette, visualStyle, typography, beats = [], imageUrl } = storyboardData

  const copyAll = () => {
    const text = beats
      .filter(b => b.prompt)
      .map(b => `// ${beatLabel(b.id)} — ${b.visualConcept}\n${b.prompt}`)
      .join('\n\n---\n\n')
    navigator.clipboard.writeText(text)
    setAllCopied(true)
    setTimeout(() => setAllCopied(false), 2500)
  }

  return (
    <div className="space-y-4">
      {/* Storyboard image */}
      {imageUrl && (
        <div className="rounded-2xl overflow-hidden border border-zinc-800">
          <img
            src={imageUrl}
            alt="Storyboard gerado pelo Ilustrador"
            className="w-full object-cover"
          />
          <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Storyboard · gerado por DALL-E 3</span>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Abrir original ↗
            </a>
          </div>
        </div>
      )}

      {/* Art direction header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-zinc-200">Direção Visual</span>
            {visualStyle && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 font-medium">
                {visualStyle}
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-600">{beats.length} beats</span>
        </div>
        {artDirection && (
          <p className="text-zinc-300 text-sm leading-relaxed">{artDirection}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {colorPalette && (
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Paleta</p>
              <p className="text-zinc-400 text-xs leading-relaxed">{colorPalette}</p>
            </div>
          )}
          {typography && (
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Tipografia</p>
              <p className="text-zinc-400 text-xs">{typography}</p>
            </div>
          )}
        </div>
      </div>

      {/* Beat cards */}
      <div className="space-y-2">
        {beats.map((beat, i) => (
          <BeatCard key={beat.id} beat={beat} defaultExpanded={i < 3} />
        ))}
      </div>

      {/* Copy all */}
      {beats.some(b => b.prompt) && (
        <div className="flex justify-end pt-1">
          <button
            onClick={copyAll}
            className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-700 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            {allCopied ? '✓ Todos copiados' : 'Copiar todos os prompts'}
          </button>
        </div>
      )}
    </div>
  )
}
