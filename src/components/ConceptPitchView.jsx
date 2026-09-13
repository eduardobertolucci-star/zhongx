import { useState } from 'react'

// ─── CONFIDENCE BADGE ─────────────────────────────────────────────────────────

function ConfidenceBadge({ level }) {
  const style = {
    ALTA  : 'bg-zinc-700/60 text-zinc-400 border-zinc-600',
    MÉDIA : 'bg-amber-950/60 text-amber-400 border-amber-700/50',
    BAIXA : 'bg-red-950/60 text-red-400 border-red-700/50',
  }[level] || 'bg-zinc-700/60 text-zinc-400 border-zinc-600'
  return (
    <span className={`inline text-xs font-bold px-1.5 py-0.5 rounded border ${style}`}>
      {level}
    </span>
  )
}

// ─── FACTUAL AUDIT ────────────────────────────────────────────────────────────

function FactualAudit({ claims }) {
  const [open, setOpen] = useState(false)
  if (!claims || claims.length === 0) return null
  const flagged = claims.filter(c => c.confidence !== 'ALTA').length
  return (
    <div className="border-t border-zinc-800 pt-4 mt-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-full text-left"
      >
        <span className="uppercase tracking-widest font-semibold text-zinc-600">Auditoria factual</span>
        <span className="text-zinc-700">—</span>
        <span className="text-zinc-500">{claims.length} {claims.length === 1 ? 'claim' : 'claims'}</span>
        {flagged > 0 && (
          <span className="bg-amber-950/60 text-amber-400 border border-amber-700/40 text-xs px-1.5 py-0.5 rounded">
            {flagged} {flagged === 1 ? 'requer atenção' : 'requerem atenção'}
          </span>
        )}
        <span className="ml-auto text-zinc-600">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {claims.map(c => (
            <div
              key={c.id}
              className={`rounded-lg p-3 border text-xs ${
                c.confidence === 'BAIXA'
                  ? 'bg-red-950/20 border-red-800/30'
                  : c.confidence === 'MÉDIA'
                  ? 'bg-amber-950/20 border-amber-800/30'
                  : 'bg-zinc-800/40 border-zinc-700/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-zinc-600 font-mono">[{c.id}]</span>
                <ConfidenceBadge level={c.confidence} />
              </div>
              <p className="text-zinc-200 leading-relaxed mb-1">{c.claim}</p>
              <p className="text-zinc-500"><span className="text-zinc-600">Fonte: </span>{c.source}</p>
              {c.nuance && !/^(none|\s*)$/i.test(c.nuance) && (
                <p className="text-zinc-500 mt-0.5"><span className="text-zinc-600">Nuance: </span>{c.nuance}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── ANGLE DETAILS ────────────────────────────────────────────────────────────
// Shown when CEO clicks "Ver detalhes". Uses pre-parsed structured fields —
// no Markdown present here.

function AngleDetails({ angle, linkedClaims, isFiction = false }) {
  if (isFiction) {
    return (
      <div className="mt-3 pt-3 border-t border-zinc-700/40 space-y-3 text-sm">
        {angle.emotionalArc && (
          <div>
            <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-0.5">Jornada Emocional</p>
            <p className="text-zinc-300">{angle.emotionalArc}</p>
          </div>
        )}
        {angle.mainRisk && (
          <div>
            <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-0.5">Risco</p>
            <p className="text-zinc-400">{angle.mainRisk}</p>
          </div>
        )}
        {angle.hook && (
          <div>
            <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-0.5">Abertura</p>
            <p className="text-zinc-300 italic border-l-2 border-violet-500/40 pl-3">"{angle.hook}"</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-3 pt-3 border-t border-zinc-700/40 space-y-3 text-sm">
      {angle.narrativeEngine && (
        <div>
          <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-0.5">Motor Narrativo</p>
          <p className="text-zinc-300">{angle.narrativeEngine}</p>
        </div>
      )}
      {angle.centralTension && (
        <div>
          <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-0.5">Tensão Central</p>
          <p className="text-zinc-300">{angle.centralTension}</p>
        </div>
      )}
      {(angle.viewerTransformation?.before || angle.viewerTransformation?.after) && (
        <div>
          <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-1">Transformação</p>
          {angle.viewerTransformation.before && (
            <p className="text-zinc-400">
              <span className="text-zinc-600 text-xs">Antes: </span>
              {angle.viewerTransformation.before}
            </p>
          )}
          {angle.viewerTransformation.after && (
            <p className="text-zinc-300 mt-0.5">
              <span className="text-zinc-500 text-xs">Depois: </span>
              {angle.viewerTransformation.after}
            </p>
          )}
        </div>
      )}
      {angle.corePromise && (
        <div>
          <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-0.5">Promessa Central</p>
          <p className="text-zinc-300">{angle.corePromise}</p>
        </div>
      )}
      {angle.mainRisk && (
        <div>
          <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-0.5">Risco Principal</p>
          <p className="text-zinc-400">{angle.mainRisk}</p>
        </div>
      )}
      {angle.hook && (
        <div>
          <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-0.5">Gancho</p>
          <p className="text-zinc-300 italic border-l-2 border-zinc-600 pl-3">"{angle.hook}"</p>
        </div>
      )}
      {linkedClaims && linkedClaims.length > 0 && (
        <div>
          <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-2">Claims vinculados</p>
          <div className="space-y-1.5">
            {linkedClaims.map(c => (
              <div key={c.id} className="flex items-start gap-2 text-xs">
                <span className="text-zinc-600 font-mono shrink-0">[{c.id}]</span>
                <ConfidenceBadge level={c.confidence} />
                <span className="text-zinc-400">{c.claim}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CONFIRM PANEL ────────────────────────────────────────────────────────────

function ConfirmPanel({ angle, onConfirm, onCancel, compact = false, isFiction = false }) {
  const [notes, setNotes] = useState('')

  function submit() {
    const prefix   = isFiction ? 'História aprovada' : 'Ângulo aprovado'
    const decision = [
      `${prefix}: ${angle.id} — ${angle.title}`,
      notes.trim() ? `\n\nAjustes do CEO:\n${notes.trim()}` : '',
    ].join('')
    onConfirm(decision, angle.snapshot?.raw || '')
  }

  return (
    <div className={`${compact ? 'mt-3 p-3' : 'mt-4 p-4'} bg-zinc-900/70 rounded-xl border border-zinc-700 space-y-3`}>
      <p className="text-zinc-500 text-xs">Ajustes opcionais para o Writer</p>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={compact ? 2 : 3}
        placeholder="Ex: Reforçar urgência no gancho, ampliar o payoff com consequências concretas..."
        className="w-full bg-zinc-950 border border-zinc-600 focus:border-blue-500 text-white rounded-lg px-3 py-2 text-sm resize-none placeholder:text-zinc-600 outline-none transition-colors"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-2.5 rounded-lg transition-colors"
        >
          Confirmar — Gerar Roteiro
        </button>
        <button
          onClick={onCancel}
          className="px-4 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm py-2.5 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ─── RECOMMENDED ANGLE CARD ───────────────────────────────────────────────────

function RecommendedCard({ angle, recommendation, factualClaims, onApprove, isFiction = false }) {
  const [showDetails, setShowDetails] = useState(false)
  const [confirming,  setConfirming]  = useState(false)

  const linkedClaims = (factualClaims || []).filter(c =>
    angle.snapshot?.claims?.includes(c.id)
  )

  const hookLabel = isFiction ? 'Abertura' : 'Gancho'
  const approveLabel = isFiction ? 'Aprovar esta história' : 'Aprovar este ângulo'

  return (
    <div className={`rounded-2xl bg-zinc-800 border overflow-hidden ${isFiction ? 'border-violet-500/40' : 'border-amber-500/40'}`}>
      <div className="px-5 pt-4">
        <span className={`text-xs font-bold uppercase tracking-widest ${isFiction ? 'text-violet-400' : 'text-amber-400'}`}>
          {isFiction ? '✦ Recomendada' : '⭐ Recomendado'}
        </span>
      </div>

      <div className="px-5 pt-2 pb-5">
        <h2 className="text-white font-bold text-xl leading-tight">{angle.title}</h2>

        {angle.corePromise && (
          <div className="mt-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Ideia</p>
            <p className="text-zinc-200 text-sm leading-relaxed">{angle.corePromise}</p>
          </div>
        )}

        {isFiction && angle.emotionalArc && (
          <div className="mt-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Jornada Emocional</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{angle.emotionalArc}</p>
          </div>
        )}

        {angle.hook && (
          <div className="mt-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">{hookLabel}</p>
            <p className={`text-zinc-100 text-sm leading-relaxed italic border-l-2 pl-3 ${isFiction ? 'border-violet-500/40' : 'border-amber-500/40'}`}>
              "{angle.hook}"
            </p>
          </div>
        )}

        {recommendation?.why && (
          <div className="mt-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">
              {isFiction ? 'Por que esta história' : 'Por que o Roteirista escolheu este'}
            </p>
            <p className="text-zinc-300 text-sm leading-relaxed">{recommendation.why}</p>
          </div>
        )}

        {angle.mainRisk && (
          <div className="mt-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Risco {isFiction ? '' : 'principal'}</p>
            <p className="text-zinc-400 text-sm">{angle.mainRisk}</p>
          </div>
        )}

        {showDetails && <AngleDetails angle={angle} linkedClaims={linkedClaims} isFiction={isFiction} />}

        {confirming ? (
          <ConfirmPanel
            angle={angle}
            onConfirm={onApprove}
            onCancel={() => setConfirming(false)}
            isFiction={isFiction}
          />
        ) : (
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setConfirming(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              {approveLabel}
            </button>
            <button
              onClick={() => setShowDetails(v => !v)}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── OTHER ANGLE CARD ─────────────────────────────────────────────────────────

function OtherAngleCard({ angle, factualClaims, onApprove, isFiction = false }) {
  const [showDetails, setShowDetails] = useState(false)
  const [confirming,  setConfirming]  = useState(false)

  const linkedClaims = (factualClaims || []).filter(c =>
    angle.snapshot?.claims?.includes(c.id)
  )

  const chooseLabel = isFiction ? 'Escolher esta' : 'Escolher este'

  return (
    <div className="rounded-2xl bg-zinc-800/50 border border-zinc-700/50 overflow-hidden">
      <div className="p-4">
        <h3 className="text-white font-semibold text-base leading-tight">{angle.title}</h3>

        {angle.corePromise && (
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed line-clamp-3">
            {angle.corePromise}
          </p>
        )}

        {angle.hook && !showDetails && (
          <p className="text-zinc-500 text-xs mt-2 italic line-clamp-2">"{angle.hook}"</p>
        )}

        {showDetails && <AngleDetails angle={angle} linkedClaims={linkedClaims} isFiction={isFiction} />}

        {confirming ? (
          <ConfirmPanel
            angle={angle}
            onConfirm={onApprove}
            onCancel={() => setConfirming(false)}
            compact
            isFiction={isFiction}
          />
        ) : (
          <div className="mt-3 flex gap-2 items-center">
            <button
              onClick={() => setConfirming(true)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-semibold py-2 rounded-lg transition-colors"
            >
              {chooseLabel}
            </button>
            <button
              onClick={() => setShowDetails(v => !v)}
              className="px-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2"
            >
              {showDetails ? 'Ocultar' : 'Detalhes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
//
// Props:
//   structured      — parsed data from backend (null while streaming or if parsing failed)
//   rawOutput       — accumulated Markdown text (shown live during streaming, used as artifact)
//   onApprove       — called with (decision: string, snapshotRaw: string) when CEO confirms
//   onRequestNewAngles — called when CEO clicks "Pedir novos ângulos"

export default function ConceptPitchView({ structured, rawOutput, onApprove, onRequestNewAngles }) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false)

  // No structured data yet: streaming still in progress or parsing failed.
  // Show raw Markdown text (live preview or fallback).
  if (!structured) {
    return (
      <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-900 rounded-xl p-6 border border-zinc-800 min-h-full">
        {rawOutput}
      </pre>
    )
  }

  const { angles, recommendation, factualClaims, artifactMarkdown, writerMode } = structured
  const isFiction   = writerMode === 'fiction'
  const recommended = angles[0]
  const others      = angles.slice(1)

  return (
    <div className="space-y-5 pb-6">

      {/* Recommended angle/story */}
      <RecommendedCard
        angle={recommended}
        recommendation={recommendation}
        factualClaims={factualClaims}
        onApprove={onApprove}
        isFiction={isFiction}
      />

      {/* Other angles/stories */}
      {others.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3 px-1">
            {isFiction ? 'Outras histórias' : 'Outras direções'}
          </p>
          <div className={`grid gap-3 ${others.length >= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            {others.map(angle => (
              <OtherAngleCard
                key={angle.id}
                angle={angle}
                factualClaims={factualClaims}
                onApprove={onApprove}
                isFiction={isFiction}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-4 flex-wrap pt-1 border-t border-zinc-800/60">
        <button
          onClick={() => setShowFullAnalysis(v => !v)}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          {showFullAnalysis ? '▲ Ocultar análise completa' : '▼ Ver análise completa'}
        </button>
        {onRequestNewAngles && (
          <button
            onClick={onRequestNewAngles}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors ml-auto"
          >
            {isFiction ? '↺ Pedir novas histórias' : '↺ Pedir novos ângulos'}
          </button>
        )}
      </div>

      {/* Full analysis — original Markdown artifact, unmodified */}
      {showFullAnalysis && (
        <pre className="font-mono text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 overflow-auto max-h-[60vh]">
          {artifactMarkdown}
        </pre>
      )}

      {/* Factual audit */}
      <FactualAudit claims={factualClaims} />

    </div>
  )
}
