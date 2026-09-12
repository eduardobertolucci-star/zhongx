import { useState, useEffect, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const STAGE = {
  CONCEPT_PITCH: 'concept_pitch',
  GATE_1: 'gate_1',
  SCRIPT: 'script',
  DONE: 'done',
}

const stageLabel = {
  [STAGE.CONCEPT_PITCH]: 'Proposta de Ângulos',
  [STAGE.GATE_1]:        'Aprovação do CEO',
  [STAGE.SCRIPT]:        'Roteiro',
  [STAGE.DONE]:          'Roteiro Completo',
}

const agents = [
  { id: 'writer',     name: 'Roteirista',  role: 'Head Writer' },
  { id: 'narrator',   name: 'Narrador',    role: 'Diretor de Voz' },
  { id: 'illustrator',name: 'Ilustrador',  role: 'Designer Visual' },
  { id: 'director',   name: 'Diretor',     role: 'Editor / Montagem' },
  { id: 'reviewer',   name: 'Revisor',     role: 'Controle de Qualidade' },
]

function agentStatus(stage, id) {
  if (id !== 'writer') return 'waiting'
  if (stage === STAGE.DONE) return 'done'
  if (stage === STAGE.GATE_1) return 'reviewing'
  return 'active'
}

const statusConfig = {
  active:    { label: 'Em andamento',   dot: 'bg-blue-400 animate-pulse', text: 'text-blue-400' },
  reviewing: { label: 'Aguardando CEO', dot: 'bg-amber-400',              text: 'text-amber-400' },
  waiting:   { label: 'Aguardando',     dot: 'bg-zinc-600',               text: 'text-zinc-500' },
  done:      { label: 'Concluído',      dot: 'bg-emerald-500',            text: 'text-emerald-400' },
}

export default function Studio({ production }) {
  const [stage, setStage]               = useState(STAGE.CONCEPT_PITCH)
  const [output, setOutput]             = useState('')
  const [streaming, setStreaming]       = useState(false)
  const [gateDecision, setGateDecision] = useState('')
  const [gateError, setGateError]       = useState('')
  const [approving, setApproving]       = useState(false)
  const [error, setError]               = useState(null)
  const outputRef  = useRef(null)
  const outputText = useRef('')

  useEffect(() => {
    if (!production) return
    runConceptPitch()
  }, [])

  async function runConceptPitch() {
    setStreaming(true)
    setOutput('')
    outputText.current = ''

    try {
      const res = await fetch(`${API_URL}/api/writer/concept-pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(production),
      })
      await readStream(res, () => setStage(STAGE.GATE_1))
    } catch (err) {
      setError(err.message)
      setStreaming(false)
    }
  }

  async function runScript() {
    if (!gateDecision.trim()) {
      setGateError('Registre a decisão antes de continuar.')
      return
    }
    setGateError('')
    setApproving(false)
    setStage(STAGE.SCRIPT)
    setStreaming(true)
    setOutput('')
    outputText.current = ''

    try {
      const res = await fetch(`${API_URL}/api/writer/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: production, gateDecision }),
      })
      await readStream(res, () => setStage(STAGE.DONE))
    } catch (err) {
      setError(err.message)
      setStreaming(false)
    }
  }

  async function readStream(res, onDone) {
    const reader  = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const lines = decoder.decode(value).split('\n')
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6))
          if (data.error) { setError(data.error); setStreaming(false); return }
          if (data.done)  { setStreaming(false); onDone(); return }
          if (data.text)  {
            outputText.current += data.text
            setOutput(outputText.current)
            if (outputRef.current)
              outputRef.current.scrollTop = outputRef.current.scrollHeight
          }
        } catch {}
      }
    }
  }

  const isStreaming = streaming
  const isDone      = stage === STAGE.DONE

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 shrink-0">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Stage badges */}
              {Object.values(STAGE).slice(0, -1).map((s, i) => {
                const isCurrent = stage === s
                const isPast    = Object.values(STAGE).indexOf(stage) > i
                return (
                  <span
                    key={s}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                      isPast
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : isCurrent
                        ? s === STAGE.GATE_1
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        : 'bg-zinc-800 text-zinc-600 border-zinc-700'
                    }`}
                  >
                    {isPast ? '✓ ' : isCurrent && s !== STAGE.GATE_1 ? '● ' : ''}{stageLabel[s]}
                  </span>
                )
              })}
              {isDone && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  ✓ {stageLabel[STAGE.DONE]}
                </span>
              )}
            </div>
            <h1 className="text-white font-bold text-lg mt-1.5 truncate">
              {production?.tema || 'Sem tema'}
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              {production?.duracao} min · YouTube · Piloto Roteirista
            </p>
          </div>
          {isStreaming && (
            <div className="flex items-center gap-2 shrink-0 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs text-blue-400 font-medium">Ao vivo</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Agent sidebar */}
        <div className="w-64 bg-zinc-900/50 border-r border-zinc-800 p-4 space-y-3 overflow-y-auto shrink-0">
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest px-1 mb-4">Equipe</p>
          {agents.map((agent) => {
            const status     = agentStatus(stage, agent.id)
            const cfg        = statusConfig[status]
            const active     = status === 'active' || status === 'reviewing'
            const isWriter   = agent.id === 'writer'
            const showGate   = isWriter && stage === STAGE.GATE_1

            return (
              <div
                key={agent.id}
                className={`bg-zinc-800 rounded-xl p-4 border transition-all ${
                  showGate
                    ? 'border-amber-500/60'
                    : active
                    ? 'border-blue-500/40'
                    : 'border-zinc-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className={`font-semibold text-sm ${active ? 'text-white' : 'text-zinc-400'}`}>
                    {agent.name}
                  </p>
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                </div>
                <p className="text-xs text-zinc-500">{agent.role}</p>
                <p className={`text-xs font-medium mt-2 ${cfg.text}`}>{cfg.label}</p>

                {/* CEO Gate #1 — botão e formulário inline */}
                {showGate && !approving && (
                  <button
                    onClick={() => setApproving(true)}
                    className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs py-2 rounded-lg transition-colors"
                  >
                    APROVAR
                  </button>
                )}

                {showGate && approving && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={gateDecision}
                      onChange={(e) => setGateDecision(e.target.value)}
                      rows={4}
                      placeholder="Ângulo aprovado e ajustes do CEO..."
                      className="w-full bg-zinc-900 border border-zinc-600 focus:border-amber-500 text-white rounded-lg px-3 py-2 text-xs resize-none placeholder:text-zinc-600 outline-none transition-colors"
                      autoFocus
                    />
                    {gateError && <p className="text-red-400 text-xs">{gateError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={runScript}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs py-2 rounded-lg transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => { setApproving(false); setGateError('') }}
                        className="px-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs py-2 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* CEO Gate #1 panel */}
          {stage === STAGE.GATE_1 && (
            <div className="shrink-0 bg-amber-950/30 border-b border-amber-800/40 px-6 py-5">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <p className="text-sm font-bold text-amber-400 uppercase tracking-widest">Aprovação do CEO — Gate #1</p>
                </div>
                <p className="text-white font-semibold text-base mb-1">
                  Concept Pitch entregue — decisão pendente
                </p>
                <p className="text-zinc-400 text-xs mb-4">
                  Revise os ângulos acima. Registre o ângulo aprovado e os ajustes antes de gerar o script.
                </p>
                <textarea
                  value={gateDecision}
                  onChange={(e) => setGateDecision(e.target.value)}
                  rows={5}
                  placeholder={`Ex:\nAngulo aprovado: Angle 1 — O Rastro\nNarrative Engine: INVESTIGATION\nAjustes: Duração 9–11 min. Hook mais forte. Integrar questão do Angle 2 organicamente no payoff.`}
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 text-white rounded-lg px-4 py-3 text-sm transition-colors resize-none placeholder:text-zinc-600 outline-none"
                />
                {gateError && (
                  <p className="text-red-400 text-xs mt-2">{gateError}</p>
                )}
                <button
                  onClick={runScript}
                  className="mt-3 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Confirmar Aprovação — Gerar Roteiro
                </button>
              </div>
            </div>
          )}

          {/* Output header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 shrink-0">
            <div>
              <h2 className="text-sm font-semibold text-white">
                {stage === STAGE.CONCEPT_PITCH && 'Proposta de Ângulos — Roteirista'}
                {stage === STAGE.GATE_1        && 'Proposta de Ângulos — Concluída'}
                {stage === STAGE.SCRIPT        && 'Roteiro — Roteirista'}
                {stage === STAGE.DONE          && 'Roteiro — Concluído'}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {stage === STAGE.CONCEPT_PITCH && 'Gerando Registro de Pesquisa + Ângulos + Registro de Claims Factuais'}
                {stage === STAGE.GATE_1        && 'Aguardando decisão do CEO para prosseguir'}
                {stage === STAGE.SCRIPT        && 'Gerando Estrutura Narrativa + Cenas + Passes de revisão'}
                {stage === STAGE.DONE          && 'Roteiro pronto para revisão do CEO'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-xl p-4 shrink-0">
              Erro: {error}
            </div>
          )}

          <div ref={outputRef} className="flex-1 overflow-auto p-6">
            <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-900 rounded-xl p-6 border border-zinc-800 min-h-full">
              {output || (isStreaming ? '▌ Conectando ao Roteirista...' : '')}
              {isStreaming && output && <span className="animate-pulse">▌</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
