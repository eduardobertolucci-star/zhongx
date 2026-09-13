import { useState, useEffect, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const initialAgents = [
  { id: 'roteirista', name: 'Roteirista', role: 'Criação do Roteiro', status: 'active' },
  { id: 'diretor', name: 'Diretor', role: 'Direção Criativa', status: 'waiting' },
  { id: 'editor', name: 'Editor', role: 'Formatação e Estrutura', status: 'waiting' },
  { id: 'revisor', name: 'Revisor', role: 'Controle de Qualidade', status: 'waiting' },
]

const statusConfig = {
  active: { label: 'Em andamento', dotClass: 'bg-amber-400 animate-pulse', textClass: 'text-amber-400' },
  waiting: { label: 'Aguardando', dotClass: 'bg-zinc-600', textClass: 'text-zinc-500' },
  done: { label: 'Concluído', dotClass: 'bg-emerald-500', textClass: 'text-emerald-400' },
  reviewing: { label: 'Revisando', dotClass: 'bg-blue-400 animate-pulse', textClass: 'text-blue-400' },
}

export default function Studio({ production }) {
  const [agents, setAgents] = useState(initialAgents)
  const [script, setScript] = useState('')
  const [progress, setProgress] = useState(0)
  const [streaming, setStreaming] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)
  const scriptRef = useRef('')
  const outputRef = useRef(null)
  const MAX_CHARS = 12000 // ~8000 tokens output estimate for progress

  useEffect(() => {
    if (!production) return
    startRoteirista()
  }, [])

  async function startRoteirista() {
    setStreaming(true)
    setScript('')
    scriptRef.current = ''

    try {
      const response = await fetch(`${API_URL}/api/roteirista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(production),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.error) {
              setError(data.error)
              setStreaming(false)
              return
            }
            if (data.done) {
              setStreaming(false)
              setDone(true)
              setProgress(25)
              setAgents(prev => prev.map(a =>
                a.id === 'roteirista' ? { ...a, status: 'done' } : a
              ))
              return
            }
            if (data.text) {
              scriptRef.current += data.text
              setScript(scriptRef.current)
              const pct = Math.min(24, Math.round((scriptRef.current.length / MAX_CHARS) * 24))
              setProgress(pct)
              // Auto-scroll
              if (outputRef.current) {
                outputRef.current.scrollTop = outputRef.current.scrollHeight
              }
            }
          } catch {}
        }
      }
    } catch (err) {
      setError(err.message)
      setStreaming(false)
    }
  }

  const activeAgent = agents.find(a => a.status === 'active')

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 shrink-0">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                done
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {done ? '✓ Roteiro Concluído' : '● Em Produção'}
              </span>
            </div>
            <h1 className="text-white font-bold text-lg mt-1.5 truncate">
              {production?.tema || 'Sem tema definido'}
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              {production?.duracao} min · {production?.estilo} · Voz {production?.voz}
              {production?.writerMode && (
                <span className={`ml-2 font-semibold uppercase ${production.writerMode === 'fiction' ? 'text-violet-400' : 'text-sky-400'}`}>
                  · {production.writerMode}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 tabular-nums shrink-0">{progress}%</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Agent sidebar */}
        <div className="w-72 bg-zinc-900/50 border-r border-zinc-800 p-4 space-y-3 overflow-y-auto shrink-0">
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest px-1 mb-4">Agentes</p>
          {agents.map((agent) => {
            const cfg = statusConfig[agent.status]
            const isActive = agent.status === 'active'
            return (
              <div
                key={agent.id}
                className={`bg-zinc-800 rounded-xl p-4 border transition-colors ${
                  isActive ? 'border-amber-500/40' : 'border-zinc-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                    {agent.name}
                  </p>
                  <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                </div>
                <p className="text-xs text-zinc-500">{agent.role}</p>
                <p className={`text-xs font-medium mt-2 ${cfg.textClass}`}>{cfg.label}</p>
              </div>
            )
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
            <div>
              <h2 className="text-sm font-semibold text-white">Saída do Agente Ativo</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {activeAgent ? `${activeAgent.name} · Gerando roteiro em tempo real` : 'Roteirista · Roteiro concluído'}
              </p>
            </div>
            {streaming && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-400 font-medium">Ao vivo</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-xl p-4">
              Erro: {error}
            </div>
          )}

          <div ref={outputRef} className="flex-1 overflow-auto p-6">
            <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-900 rounded-xl p-6 border border-zinc-800 min-h-full">
              {script || (streaming ? '▌ Conectando ao Roteirista...' : '')}
              {streaming && script && <span className="animate-pulse">▌</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
