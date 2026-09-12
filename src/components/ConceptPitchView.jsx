import { useState, useMemo } from 'react'

// ─── PARSER ──────────────────────────────────────────────────────────────────
//
// Parses the structured Markdown output from the Writer (Production Mode).
// All parsing is deterministic — no additional AI calls are made.

function extractField(text, label) {
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Capture content from LABEL: until the next ALL-CAPS field, ## section, or end
  const rx = new RegExp(`${esc}:\\s*([\\s\\S]*?)(?=\\n[A-Z][A-Z /→×]+:|\\n##|$)`, 'i')
  const m  = text.match(rx)
  return m ? m[1].trim() : ''
}

function parseViewerTransformation(body) {
  const vtm = body.match(/VIEWER TRANSFORMATION:\s*([\s\S]*?)(?=\n[A-Z][A-Z ]+:|$)/i)
  if (!vtm) return { before: '', after: '' }
  const vc     = vtm[1]
  const before = vc.match(/BEFORE:\s*([\s\S]*?)(?=\nAFTER:|$)/i)
  const after  = vc.match(/AFTER:\s*([\s\S]*?)$/i)
  return {
    before: before ? before[1].trim() : '',
    after : after  ? after[1].trim()  : '',
  }
}

function parseConceptPitch(text) {
  if (!text || text.length < 100) return null

  // ── Snapshots ──
  const snapshots = {}
  const snRx = /<!-- SNAPSHOT:(\d+) -->([\s\S]*?)<!-- \/SNAPSHOT:\1 -->/g
  let sm
  while ((sm = snRx.exec(text)) !== null) snapshots[+sm[1]] = sm[2].trim()

  // ── Angles ──
  const angles  = []
  const sections = text.split(/(?=^## )/m)

  for (const sec of sections) {
    const am = sec.match(/^## ANGLE\s+(\d+)\s*[—–\-]+\s*(.+)/im)
    if (!am) continue
    const n    = +am[1]
    const body = sec.slice(am.index + am[0].length)
    angles.push({
      number          : n,
      title           : am[2].trim(),
      hook            : extractField(body, 'HOOK'),
      narrativeEngine : extractField(body, 'NARRATIVE ENGINE'),
      centralTension  : extractField(body, 'CENTRAL TENSION'),
      viewerTransform : parseViewerTransformation(body),
      corePromise     : extractField(body, 'CORE PROMISE'),
      mainRisk        : extractField(body, 'MAIN RISK'),
      snapshot        : snapshots[n] || '',
    })
  }

  // ── Recommendation ──
  let rec = null
  const recSec = sections.find(s => /^## WRITER RECOMMENDATION/im.test(s))
  if (recSec) {
    const rb  = recSec.replace(/^## WRITER RECOMMENDATION\s*/im, '')
    const rn  = rb.match(/RECOMMENDED ANGLE:\s*(\d+)/i)
    const why = rb.match(/^WHY:\s*([\s\S]*?)(?=\nRUNNER-UP:|$)/im)
    const rup = rb.match(/RUNNER-UP:\s*(\d+)/i)
    const wno = rb.match(/^WHY NOT:\s*([\s\S]*?)(?=\n##|$)/im)
    rec = {
      recommendedNumber : rn  ? +rn[1]        : null,
      why               : why ? why[1].trim()  : '',
      runnerUpNumber    : rup ? +rup[1]        : null,
      whyNot            : wno ? wno[1].trim()  : '',
    }
  }

  // ── Factual Claims ──
  const claims = []
  const ldSec = sections.find(s => /^## FACTUAL CLAIM LEDGER/im.test(s))
  if (ldSec) {
    const ldBody = ldSec.replace(/^## FACTUAL CLAIM LEDGER[^\n]*\n/im, '')
    const rx = /\[([^\]]+)\]\s*Claim:\s*([^|]+)\|\s*Confidence:\s*(HIGH|MEDIUM|LOW)\s*\|\s*Source:\s*([^|]+)(?:\|\s*Nuance:\s*(.+))?/gi
    let cm
    while ((cm = rx.exec(ldBody)) !== null) {
      claims.push({
        id         : cm[1].trim(),
        claim      : cm[2].trim(),
        confidence : cm[3].toUpperCase(),
        source     : cm[4].trim(),
        nuance     : cm[5] ? cm[5].trim() : '',
      })
    }
  }

  if (angles.length === 0) return null

  // Sort: recommended first
  const recNum = rec?.recommendedNumber
  const sorted = recNum
    ? [...angles.filter(a => a.number === recNum), ...angles.filter(a => a.number !== recNum)]
    : angles

  return { angles: sorted, recommendation: rec, claims, rawText: text }
}

// ─── CONFIDENCE BADGE ─────────────────────────────────────────────────────────

function ConfidenceBadge({ level }) {
  const style = {
    HIGH   : 'bg-zinc-700/60 text-zinc-400 border-zinc-600',
    MEDIUM : 'bg-amber-950/60 text-amber-400 border-amber-700/50',
    LOW    : 'bg-red-950/60 text-red-400 border-red-700/50',
  }[level] || 'bg-zinc-700/60 text-zinc-400 border-zinc-600'

  return (
    <span className={`inline text-xs font-bold px-1.5 py-0.5 rounded border ${style}`}>
      {level}
    </span>
  )
}

// ─── FACTUAL AUDIT SECTION ───────────────────────────────────────────────────

function FactualAudit({ claims }) {
  const [open, setOpen] = useState(false)
  if (claims.length === 0) return null

  const flagged = claims.filter(c => c.confidence !== 'HIGH').length

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
                c.confidence === 'LOW'
                  ? 'bg-red-950/20 border-red-800/30'
                  : c.confidence === 'MEDIUM'
                  ? 'bg-amber-950/20 border-amber-800/30'
                  : 'bg-zinc-800/40 border-zinc-700/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-zinc-600 font-mono">[{c.id}]</span>
                <ConfidenceBadge level={c.confidence} />
              </div>
              <p className="text-zinc-200 leading-relaxed mb-1">{c.claim}</p>
              <p className="text-zinc-500">
                <span className="text-zinc-600">Fonte: </span>{c.source}
              </p>
              {c.nuance && c.nuance.toLowerCase() !== 'none' && c.nuance !== '' && (
                <p className="text-zinc-500 mt-0.5">
                  <span className="text-zinc-600">Nuance: </span>{c.nuance}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── ANGLE DETAILS (expandable) ──────────────────────────────────────────────

function AngleDetails({ angle }) {
  return (
    <div className="mt-3 pt-3 border-t border-zinc-700/40 space-y-3">
      {angle.narrativeEngine && (
        <div>
          <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-0.5">Narrative Engine</p>
          <p className="text-zinc-300 text-sm">{angle.narrativeEngine}</p>
        </div>
      )}
      {angle.centralTension && (
        <div>
          <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-0.5">Tensão Central</p>
          <p className="text-zinc-300 text-sm">{angle.centralTension}</p>
        </div>
      )}
      {(angle.viewerTransform.before || angle.viewerTransform.after) && (
        <div>
          <p className="text-zinc-600 text-xs uppercase tracking-wider font-semibold mb-1">Transformação</p>
          {angle.viewerTransform.before && (
            <p className="text-zinc-400 text-sm">
              <span className="text-zinc-600 text-xs">Antes: </span>
              {angle.viewerTransform.before}
            </p>
          )}
          {angle.viewerTransform.after && (
            <p className="text-zinc-300 text-sm mt-0.5">
              <span className="text-zinc-500 text-xs">Depois: </span>
              {angle.viewerTransform.after}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── CONFIRM PANEL ────────────────────────────────────────────────────────────

function ConfirmPanel({ angle, onConfirm, onCancel, compact = false }) {
  const [notes, setNotes] = useState('')

  function submit() {
    const decision = [
      `Ângulo aprovado: ${angle.number} — ${angle.title}`,
      notes.trim() ? `\n\nAjustes do CEO:\n${notes.trim()}` : '',
    ].join('')
    onConfirm(decision, angle.snapshot)
  }

  return (
    <div className={`${compact ? 'mt-3 p-3' : 'mt-4 p-4'} bg-zinc-900/70 rounded-xl border border-zinc-700 space-y-3`}>
      <p className="text-zinc-500 text-xs">Ajustes opcionais para o Writer</p>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={compact ? 2 : 3}
        placeholder="Ex: Reforçar urgência no hook, ampliar o payoff com consequências concretas..."
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

function RecommendedCard({ angle, recommendation, onApprove }) {
  const [showDetails, setShowDetails] = useState(false)
  const [confirming,  setConfirming]  = useState(false)

  return (
    <div className="rounded-2xl bg-zinc-800 border border-amber-500/40 overflow-hidden">
      <div className="px-5 pt-4">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          ⭐ Recomendado
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

        {angle.hook && (
          <div className="mt-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Hook</p>
            <p className="text-zinc-100 text-sm leading-relaxed italic border-l-2 border-amber-500/40 pl-3">
              "{angle.hook}"
            </p>
          </div>
        )}

        {recommendation?.why && (
          <div className="mt-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Por que o Writer escolheu este</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{recommendation.why}</p>
          </div>
        )}

        {angle.mainRisk && (
          <div className="mt-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Risco principal</p>
            <p className="text-zinc-400 text-sm">{angle.mainRisk}</p>
          </div>
        )}

        {showDetails && <AngleDetails angle={angle} />}

        {confirming ? (
          <ConfirmPanel
            angle={angle}
            onConfirm={onApprove}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setConfirming(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              Aprovar este ângulo
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

function OtherAngleCard({ angle, onApprove }) {
  const [showDetails, setShowDetails] = useState(false)
  const [confirming,  setConfirming]  = useState(false)

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

        {showDetails && <AngleDetails angle={angle} />}

        {confirming ? (
          <ConfirmPanel
            angle={angle}
            onConfirm={onApprove}
            onCancel={() => setConfirming(false)}
            compact
          />
        ) : (
          <div className="mt-3 flex gap-2 items-center">
            <button
              onClick={() => setConfirming(true)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-semibold py-2 rounded-lg transition-colors"
            >
              Escolher este
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

export default function ConceptPitchView({ rawOutput, onApprove, onRequestNewAngles }) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false)

  const pitch = useMemo(() => parseConceptPitch(rawOutput), [rawOutput])

  // Fallback: if parser fails, show raw text (no approve buttons)
  if (!pitch) {
    return (
      <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-900 rounded-xl p-6 border border-zinc-800 min-h-full">
        {rawOutput}
      </pre>
    )
  }

  const { angles, recommendation, claims, rawText } = pitch
  const recommended = angles[0]
  const others      = angles.slice(1)

  return (
    <div className="space-y-5 pb-6">

      {/* ── Recommended angle ── */}
      <RecommendedCard
        angle={recommended}
        recommendation={recommendation}
        onApprove={onApprove}
      />

      {/* ── Other angles ── */}
      {others.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3 px-1">
            Outras direções
          </p>
          <div className={`grid gap-3 ${others.length >= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            {others.map(angle => (
              <OtherAngleCard
                key={angle.number}
                angle={angle}
                onApprove={onApprove}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Footer actions ── */}
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
            ↺ Pedir novos ângulos
          </button>
        )}
      </div>

      {/* ── Full analysis (raw markdown) ── */}
      {showFullAnalysis && (
        <pre className="font-mono text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 overflow-auto max-h-[60vh]">
          {rawText}
        </pre>
      )}

      {/* ── Factual audit ── */}
      <FactualAudit claims={claims} />

    </div>
  )
}
