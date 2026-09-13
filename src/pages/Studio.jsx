import { useState, useEffect, useRef } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import ConceptPitchView from '../components/ConceptPitchView.jsx'

const API_URL = ''

async function saveOutput(productionId, type, data) {
  try {
    const ref     = doc(db, 'outputs', productionId)
    const snap    = await getDoc(ref)
    const current = snap.exists() ? snap.data() : {}
    await setDoc(ref, { ...current, [type]: data }, { merge: true })
  } catch (err) {
    console.error('Erro ao salvar output:', err)
  }
}

async function loadOutputs(productionId) {
  try {
    const snap = await getDoc(doc(db, 'outputs', productionId))
    return snap.exists() ? snap.data() : null
  } catch {
    return null
  }
}

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

function BriefingScreen({ production, onStart }) {
  const fields = [
    { label: 'Tema',       value: production?.tema },
    { label: 'Duração',    value: production?.duracao ? `${production.duracao} min` : null },
    { label: 'Tom',        value: production?.tom },
    { label: 'Restrições', value: production?.restricoes },
  ].filter(f => f.value)

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
        <div>
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3">Brief da produção</p>
          <div className="space-y-3">
            {fields.map(f => (
              <div key={f.label}>
                <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-0.5">{f.label}</p>
                <p className="text-zinc-200 text-sm leading-relaxed">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-5">
          <p className="text-zinc-500 text-xs mb-4">
            Nenhum Concept Pitch gerado ainda. Clique abaixo para iniciar.
          </p>
          <button
            onClick={onStart}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Iniciar Concept Pitch
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Studio({ production }) {
  const [stage, setStage]             = useState(STAGE.CONCEPT_PITCH)
  const [output, setOutput]           = useState('')
  const [streaming, setStreaming]     = useState(false)
  const [conceptPitchData, setConceptPitchData] = useState(null)
  const [error, setError]             = useState(null)
  const outputRef  = useRef(null)
  const outputText = useRef('')

  useEffect(() => {
    if (!production) return
    if (production._autoStart) {
      runConceptPitch()
      return
    }
    // Reabrir produção existente: restaurar estado salvo do Firestore
    loadOutputs(production.id).then(saved => {
      if (saved?.script) {
        outputText.current = saved.script.rawText
        setOutput(saved.script.rawText)
        setConceptPitchData(saved.conceptPitch?.structured ?? null)
        setStage(STAGE.DONE)
      } else if (saved?.conceptPitch) {
        outputText.current = saved.conceptPitch.rawText
        setOutput(saved.conceptPitch.rawText)
        setConceptPitchData(saved.conceptPitch.structured ?? null)
        setStage(STAGE.GATE_1)
      }
    })
  }, [])

  async function runConceptPitch() {
    setStreaming(true)
    setOutput('')
    setConceptPitchData(null)
    outputText.current = ''

    try {
      const res = await fetch(`${API_URL}/api/writer/concept-pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(production),
      })
      await readStream(res, async (structured) => {
        const rawText = outputText.current
        await saveOutput(production.id, 'conceptPitch', { rawText, structured: structured ?? null })
        setConceptPitchData(structured ?? null)
        setStage(STAGE.GATE_1)
      })
    } catch (err) {
      setError(err.message)
      setStreaming(false)
    }
  }

  async function runScript(decision, snapshot) {
    setStage(STAGE.SCRIPT)
    setStreaming(true)
    setOutput('')
    outputText.current = ''

    try {
      const res = await fetch(`${API_URL}/api/writer/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: production, gateDecision: decision, approvedAngleSnapshot: snapshot || '' }),
      })
      await readStream(res, async () => {
        await saveOutput(production.id, 'script', { rawText: outputText.current })
        setStage(STAGE.DONE)
      })
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
          if (data.done)  { setStreaming(false); onDone(data.structured ?? null); return }
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
              {production?.duracao} min · YouTube
              {production?.writerMode && (
                <span className={`ml-2 font-semibold uppercase ${production.writerMode === 'fiction' ? 'text-violet-400' : 'text-sky-400'}`}>
                  · {production.writerMode}
                </span>
              )}
              {production?.audienceMode && production.audienceMode !== 'general' && (
                <span className="ml-2 font-semibold text-emerald-400">
                  · Infantil{production.targetAge ? ` · ${production.targetAge}` : ''}
                </span>
              )}
              {(!production?.audienceMode || production.audienceMode === 'general') && (
                <span className="ml-2 font-semibold text-zinc-500">· Geral</span>
              )}
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
              </div>
            )
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">

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
                {stage === STAGE.CONCEPT_PITCH && (production?.writerMode === 'fiction'
                  ? 'Gerando Story Discovery + Histórias + Approved Story Snapshot'
                  : 'Gerando Registro de Pesquisa + Ângulos + Registro de Claims Factuais')}
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
            {stage === STAGE.GATE_1 ? (
              <ConceptPitchView
                structured={conceptPitchData}
                rawOutput={output}
                onApprove={runScript}
                onRequestNewAngles={runConceptPitch}
              />
            ) : stage === STAGE.CONCEPT_PITCH && !isStreaming && !output ? (
              <BriefingScreen production={production} onStart={runConceptPitch} />
            ) : (
              <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-900 rounded-xl p-6 border border-zinc-800 min-h-full">
                {output || (isStreaming ? '▌ Conectando ao Roteirista...' : '')}
                {isStreaming && output && <span className="animate-pulse">▌</span>}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
