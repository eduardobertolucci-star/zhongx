import { useState } from 'react'

const API_URL = ''

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  generated         : { label: 'Gerado',            color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  in_revision       : { label: 'Em revisão',         color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  ready_for_approval: { label: 'Pronto p/ aprovação',color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  approved          : { label: 'Aprovado',           color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
}

// ─── EDIT MODAL ────────────────────────────────────────────────────────────────

function EditModal({ scene, onSave, onCancel }) {
  const [narration,    setNarration]    = useState(scene.narration)
  const [visualIntent, setVisualIntent] = useState(scene.visualIntent || '')

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 pt-5 pb-4 border-b border-zinc-800 shrink-0">
          <p className="text-white font-semibold text-sm">{scene.fullTitle}</p>
          <p className="text-zinc-500 text-xs mt-0.5">Edição manual — 0 chamadas ao Writer</p>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Narração</label>
            <textarea
              value={narration}
              onChange={e => setNarration(e.target.value)}
              rows={10}
              className="w-full bg-zinc-950 border border-zinc-700 focus:border-blue-500 text-zinc-200 text-sm rounded-xl px-4 py-3 resize-none outline-none transition-colors leading-relaxed"
              autoFocus
            />
          </div>
          {(scene.visualIntent || visualIntent) && (
            <div>
              <label className="block text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1.5">Intenção Visual</label>
              <textarea
                value={visualIntent}
                onChange={e => setVisualIntent(e.target.value)}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-blue-500 text-zinc-200 text-sm rounded-xl px-4 py-3 resize-none outline-none transition-colors"
              />
            </div>
          )}
        </div>
        <div className="px-6 pb-5 flex gap-3 shrink-0">
          <button onClick={() => onSave({ narration, visualIntent })} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-2.5 rounded-xl transition-colors">
            Salvar edição
          </button>
          <button onClick={onCancel} className="px-5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm py-2.5 rounded-xl transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── BEFORE / AFTER PANEL ──────────────────────────────────────────────────────

function BeforeAfter({ scene, proposed, continuityImpact, onAccept, onDiscard, onAdjust }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-6 pt-5 pb-4 border-b border-zinc-800 shrink-0">
          <p className="text-white font-semibold text-sm">{scene.fullTitle}</p>
          <p className="text-zinc-500 text-xs mt-0.5">Revisão do Writer — escolha aceitar ou descartar</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Before */}
          <div>
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">Antes</p>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{scene.narration}</p>
              {scene.visualIntent && (
                <p className="text-zinc-600 text-xs mt-2 leading-relaxed whitespace-pre-wrap italic">{scene.visualIntent}</p>
              )}
            </div>
          </div>

          {/* After */}
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">Depois</p>
            <div className="bg-zinc-950 border border-emerald-800/40 rounded-xl p-4">
              <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{proposed.narration}</p>
              {proposed.visualIntent && (
                <p className="text-zinc-500 text-xs mt-2 leading-relaxed whitespace-pre-wrap italic">{proposed.visualIntent}</p>
              )}
            </div>
          </div>

          {/* Continuity impact warning */}
          {continuityImpact?.hasImpact && (
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Impacto na continuidade</p>
              <p className="text-amber-200/80 text-sm">{continuityImpact.reason}</p>
              {continuityImpact.affectedScenes?.length > 0 && (
                <p className="text-amber-400/60 text-xs mt-1">Cenas afetadas: {continuityImpact.affectedScenes.join(', ')}</p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-3 shrink-0 border-t border-zinc-800 pt-4">
          <button onClick={onAccept} className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors">
            Aceitar alteração
          </button>
          <button onClick={onAdjust} className="px-4 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm py-2.5 rounded-xl transition-colors">
            Pedir outro ajuste
          </button>
          <button onClick={onDiscard} className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 text-sm py-2.5 rounded-xl transition-colors">
            Descartar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── REVISE PANEL ──────────────────────────────────────────────────────────────

function RevisePanel({ scene, loading, onSubmit, onCancel }) {
  const [instruction, setInstruction] = useState('')
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-xl">
        <div className="px-6 pt-5 pb-4 border-b border-zinc-800">
          <p className="text-white font-semibold text-sm">{scene.fullTitle}</p>
          <p className="text-zinc-500 text-xs mt-0.5">Instrução ao Writer — 1 chamada</p>
        </div>
        <div className="p-6 space-y-4">
          <textarea
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            rows={4}
            placeholder="Ex: Deixe esta cena mais curta e direta. Mantenha o gancho mas corte a explicação do meio."
            className="w-full bg-zinc-950 border border-zinc-700 focus:border-blue-500 text-zinc-200 text-sm rounded-xl px-4 py-3 resize-none outline-none transition-colors placeholder:text-zinc-600"
            autoFocus
            disabled={loading}
          />
          <div className="flex gap-3">
            <button
              onClick={() => onSubmit(instruction)}
              disabled={!instruction.trim() || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />Gerando...</>
              ) : 'Enviar ao Writer'}
            </button>
            <button onClick={onCancel} disabled={loading} className="px-5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-zinc-300 text-sm py-2.5 rounded-xl transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── GLOBAL REVISION PANEL ─────────────────────────────────────────────────────

function GlobalRevisionPanel({ loading, onSubmit, onCancel }) {
  const [instruction, setInstruction] = useState('')
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-xl">
        <div className="px-6 pt-5 pb-4 border-b border-zinc-800">
          <p className="text-white font-semibold text-sm">Revisão Global do Roteiro</p>
          <p className="text-zinc-500 text-xs mt-0.5">O Writer pode modificar múltiplas cenas — 1 chamada</p>
        </div>
        <div className="p-6 space-y-4">
          <textarea
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            rows={4}
            placeholder="Ex: Deixe o roteiro 20% mais curto, o começo está lento. Preserve o payoff."
            className="w-full bg-zinc-950 border border-zinc-700 focus:border-blue-500 text-zinc-200 text-sm rounded-xl px-4 py-3 resize-none outline-none transition-colors placeholder:text-zinc-600"
            autoFocus
            disabled={loading}
          />
          <div className="flex gap-3">
            <button
              onClick={() => onSubmit(instruction)}
              disabled={!instruction.trim() || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />Revisando...</>
              ) : 'Enviar ao Writer'}
            </button>
            <button onClick={onCancel} disabled={loading} className="px-5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-zinc-300 text-sm py-2.5 rounded-xl transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── GLOBAL REVISION SUMMARY ───────────────────────────────────────────────────

function GlobalSummary({ summary, revisedScenes, originalScenes, onAccept, onDiscard }) {
  const [showDiff, setShowDiff] = useState(false)

  const changedMap = {}
  revisedScenes.forEach(s => { changedMap[s.id] = s })

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-6 pt-5 pb-4 border-b border-zinc-800 shrink-0">
          <p className="text-white font-semibold text-sm">Revisão Global — Proposta do Writer</p>
          <p className="text-zinc-500 text-xs mt-0.5">{revisedScenes.length} {revisedScenes.length === 1 ? 'cena alterada' : 'cenas alteradas'}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Summary */}
          <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Alterações propostas</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{summary}</p>
          </div>

          {/* Change notes */}
          <div className="space-y-2">
            {revisedScenes.map(rs => (
              <div key={rs.id} className="flex items-start gap-3 text-sm">
                <span className="text-emerald-500 shrink-0 mt-0.5">→</span>
                <div>
                  <span className="text-zinc-300 font-medium">
                    {originalScenes.find(s => s.id === rs.id)?.fullTitle || rs.id}
                  </span>
                  {rs.changeNote && (
                    <span className="text-zinc-500 ml-2 text-xs">{rs.changeNote}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Diff view */}
          <button onClick={() => setShowDiff(v => !v)} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            {showDiff ? '▲ Ocultar alterações detalhadas' : '▼ Ver alterações detalhadas'}
          </button>

          {showDiff && (
            <div className="space-y-4">
              {revisedScenes.map(rs => {
                const orig = originalScenes.find(s => s.id === rs.id)
                return (
                  <div key={rs.id} className="space-y-2">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{orig?.fullTitle || rs.id}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                        <p className="text-xs text-zinc-600 mb-1">Antes</p>
                        <p className="text-zinc-400 text-xs leading-relaxed">{orig?.narration}</p>
                      </div>
                      <div className="bg-zinc-950 border border-emerald-800/30 rounded-lg p-3">
                        <p className="text-xs text-emerald-600 mb-1">Depois</p>
                        <p className="text-zinc-200 text-xs leading-relaxed">{rs.narration}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-3 shrink-0 border-t border-zinc-800 pt-4">
          <button onClick={onAccept} className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors">
            Aceitar revisão
          </button>
          <button onClick={onDiscard} className="px-5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm py-2.5 rounded-xl transition-colors">
            Descartar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SCENE CARD ────────────────────────────────────────────────────────────────

function SceneCard({ scene, index, onEdit, onRevise, onRegenerate }) {
  const [showVisual, setShowVisual] = useState(false)

  return (
    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl overflow-hidden hover:border-zinc-600/60 transition-colors">
      <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-zinc-600 text-xs font-mono shrink-0 w-5">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest shrink-0">{scene.type}</span>
          {scene.title !== scene.type && (
            <span className="text-zinc-500 text-xs truncate">— {scene.title}</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => onEdit(scene)} className="text-xs text-zinc-600 hover:text-zinc-300 px-2 py-1 rounded hover:bg-zinc-700/60 transition-colors">
            Editar
          </button>
          <button onClick={() => onRevise(scene)} className="text-xs text-zinc-600 hover:text-zinc-300 px-2 py-1 rounded hover:bg-zinc-700/60 transition-colors">
            Pedir alteração
          </button>
          <button onClick={() => onRegenerate(scene)} className="text-xs text-zinc-600 hover:text-amber-400 px-2 py-1 rounded hover:bg-zinc-700/60 transition-colors">
            Regenerar
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="text-zinc-300 text-sm leading-relaxed">{scene.narration}</p>
        {scene.visualIntent && (
          <div className="mt-2">
            {showVisual ? (
              <div>
                <p className="text-zinc-600 text-xs font-semibold uppercase tracking-wider mb-1">Intenção Visual</p>
                <p className="text-zinc-500 text-xs leading-relaxed">{scene.visualIntent}</p>
                <button onClick={() => setShowVisual(false)} className="text-zinc-600 hover:text-zinc-400 text-xs mt-1.5 transition-colors">Ocultar</button>
              </div>
            ) : (
              <button onClick={() => setShowVisual(true)} className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
                + Intenção visual
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── VERSION HISTORY ───────────────────────────────────────────────────────────

function VersionHistory({ versions, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="px-6 pt-5 pb-4 border-b border-zinc-800 shrink-0 flex items-center justify-between">
          <p className="text-white font-semibold text-sm">Histórico de versões</p>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {versions.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-4">Nenhuma versão anterior</p>
          ) : (
            [...versions].reverse().map((v, i) => (
              <div key={i} className="bg-zinc-800/60 border border-zinc-700/40 rounded-xl px-4 py-3">
                <p className="text-zinc-300 text-sm font-medium">v{v.version}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{v.label}</p>
                <p className="text-zinc-600 text-xs mt-0.5">{new Date(v.timestamp).toLocaleString('pt-BR')}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function ScriptView({ scriptData, brief, onUpdate }) {
  const [scenes,        setScenes]        = useState(scriptData.scenes || [])
  const [status,        setStatus]        = useState(scriptData.status || 'generated')
  const [scriptVersion, setScriptVersion] = useState(scriptData.scriptVersion || 1)
  const [versions,      setVersions]      = useState(scriptData.versions || [])
  const [continuity]                      = useState(scriptData.continuity || '')

  const [showFullScript,  setShowFullScript]  = useState(false)
  const [showVersions,    setShowVersions]    = useState(false)

  // Scene-level revision state
  const [editingScene,      setEditingScene]      = useState(null)
  const [revisingScene,     setRevisingScene]     = useState(null) // { scene, mode: 'revise'|'regenerate' }
  const [revisionLoading,   setRevisionLoading]   = useState(false)
  const [pendingRevision,   setPendingRevision]   = useState(null) // { proposed, continuityImpact }
  const [revisionError,     setRevisionError]     = useState(null)

  // Global revision state
  const [globalOpen,    setGlobalOpen]    = useState(false)
  const [globalLoading, setGlobalLoading] = useState(false)
  const [pendingGlobal, setPendingGlobal] = useState(null) // { summary, revisedScenes }
  const [globalError,   setGlobalError]   = useState(null)

  // ─── HELPERS ──────────────────────────────────────────────────────────────────

  function createVersion(label) {
    const v = { version: scriptVersion, label, timestamp: new Date().toISOString(), scenes: [...scenes] }
    return v
  }

  function applyAndSave(newScenes, newStatus, versionLabel) {
    const newVersion  = scriptVersion + 1
    const newVersions = [...versions, createVersion(versionLabel || `Script v${scriptVersion}`)]
    const newData     = {
      ...scriptData,
      scriptVersion: newVersion,
      status       : newStatus || status,
      scenes       : newScenes,
      versions     : newVersions,
      artifactMarkdown: scriptData.artifactMarkdown,
    }
    setScenes(newScenes)
    setStatus(newStatus || status)
    setScriptVersion(newVersion)
    setVersions(newVersions)
    onUpdate(newData)
  }

  // ─── MANUAL EDIT ──────────────────────────────────────────────────────────────

  function handleEditSave({ narration, visualIntent }) {
    const newScenes = scenes.map(s =>
      s.id === editingScene.id ? { ...s, narration, visualIntent } : s
    )
    applyAndSave(newScenes, 'in_revision', `Script v${scriptVersion} — edição CEO: ${editingScene.fullTitle}`)
    setEditingScene(null)
  }

  // ─── AI SCENE REVISION ────────────────────────────────────────────────────────

  async function handleReviseSubmit(instruction) {
    if (!revisingScene) return
    setRevisionLoading(true)
    setRevisionError(null)

    const idx       = scenes.findIndex(s => s.id === revisingScene.scene.id)
    const prevScene = idx > 0 ? scenes[idx - 1] : null
    const nextScene = idx < scenes.length - 1 ? scenes[idx + 1] : null

    const endpoint = revisingScene.mode === 'regenerate'
      ? '/api/writer/regenerate-scene'
      : '/api/writer/revise-scene'

    const body = {
      brief,
      scene    : revisingScene.scene,
      prevScene,
      nextScene,
      continuity,
      ...(revisingScene.mode === 'revise' ? { instruction } : {}),
    }

    try {
      const r    = await fetch(`${API_URL}${endpoint}`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(body),
      })
      const data = await r.json()
      if (!data.ok) throw new Error(data.error || 'Erro do Writer')
      setPendingRevision({ proposed: data.revisedScene, continuityImpact: data.continuityImpact })
    } catch (err) {
      setRevisionError(err.message)
      setRevisingScene(null)
    } finally {
      setRevisionLoading(false)
    }
  }

  function handleReviseAccept() {
    if (!pendingRevision || !revisingScene) return
    const { proposed } = pendingRevision
    const newScenes = scenes.map(s =>
      s.id === revisingScene.scene.id
        ? { ...s, narration: proposed.narration, visualIntent: proposed.visualIntent || s.visualIntent }
        : s
    )
    const label = revisingScene.mode === 'regenerate'
      ? `Script v${scriptVersion} — regeneração: ${revisingScene.scene.fullTitle}`
      : `Script v${scriptVersion} — revisão Writer: ${revisingScene.scene.fullTitle}`
    applyAndSave(newScenes, 'in_revision', label)
    setPendingRevision(null)
    setRevisingScene(null)
  }

  function handleReviseDiscard() {
    setPendingRevision(null)
    setRevisingScene(null)
  }

  function handleReviseAdjust() {
    setPendingRevision(null)
    // Keep revisingScene open so user can type new instruction
  }

  // ─── GLOBAL REVISION ──────────────────────────────────────────────────────────

  async function handleGlobalSubmit(instruction) {
    setGlobalLoading(true)
    setGlobalError(null)

    try {
      const r    = await fetch(`${API_URL}/api/writer/revise-script`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ brief, scenes, instruction }),
      })
      const data = await r.json()
      if (!data.ok) throw new Error(data.error || 'Erro do Writer')
      setPendingGlobal({ summary: data.summary, revisedScenes: data.revisedScenes || [] })
    } catch (err) {
      setGlobalError(err.message)
      setGlobalOpen(false)
    } finally {
      setGlobalLoading(false)
    }
  }

  function handleGlobalAccept() {
    if (!pendingGlobal) return
    const changedMap = {}
    pendingGlobal.revisedScenes.forEach(rs => { changedMap[rs.id] = rs })
    const newScenes = scenes.map(s =>
      changedMap[s.id]
        ? { ...s, narration: changedMap[s.id].narration, visualIntent: changedMap[s.id].visualIntent || s.visualIntent }
        : s
    )
    applyAndSave(newScenes, 'in_revision', `Script v${scriptVersion} — revisão global`)
    setPendingGlobal(null)
    setGlobalOpen(false)
  }

  function handleGlobalDiscard() {
    setPendingGlobal(null)
    setGlobalOpen(false)
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────────

  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.generated

  return (
    <div className="space-y-4 pb-8">

      {/* Script header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
          <span className="text-zinc-600 text-xs">v{scriptVersion} · {scenes.length} cenas</span>
          {versions.length > 0 && (
            <button onClick={() => setShowVersions(true)} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              {versions.length} {versions.length === 1 ? 'versão anterior' : 'versões anteriores'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGlobalOpen(true)}
            className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
          >
            Solicitar revisão global
          </button>
          <button
            onClick={() => setShowFullScript(v => !v)}
            className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
          >
            {showFullScript ? 'Ocultar roteiro completo' : 'Ver roteiro completo'}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {(revisionError || globalError) && (
        <div className="bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">
          {revisionError || globalError}
        </div>
      )}

      {/* Full script view */}
      {showFullScript && (
        <pre className="font-mono text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed bg-zinc-900/60 rounded-xl p-5 border border-zinc-800 overflow-auto max-h-[50vh]">
          {scriptData.artifactMarkdown}
        </pre>
      )}

      {/* Scene cards */}
      <div className="space-y-3">
        {scenes.map((scene, i) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            index={i}
            onEdit={(s)       => setEditingScene(s)}
            onRevise={(s)     => { setRevisingScene({ scene: s, mode: 'revise' }); setPendingRevision(null) }}
            onRegenerate={(s) => { setRevisingScene({ scene: s, mode: 'regenerate' }); setPendingRevision(null); handleReviseSubmit(null) }}
          />
        ))}
      </div>

      {/* ── MODALS ── */}

      {editingScene && (
        <EditModal
          scene={editingScene}
          onSave={handleEditSave}
          onCancel={() => setEditingScene(null)}
        />
      )}

      {revisingScene && revisingScene.mode === 'revise' && !pendingRevision && (
        <RevisePanel
          scene={revisingScene.scene}
          loading={revisionLoading}
          onSubmit={handleReviseSubmit}
          onCancel={() => { setRevisingScene(null); setRevisionError(null) }}
        />
      )}

      {revisingScene && revisingScene.mode === 'regenerate' && revisionLoading && !pendingRevision && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl px-8 py-6 flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-zinc-300 text-sm">O Writer está gerando uma alternativa...</p>
          </div>
        </div>
      )}

      {pendingRevision && revisingScene && (
        <BeforeAfter
          scene={revisingScene.scene}
          proposed={pendingRevision.proposed}
          continuityImpact={pendingRevision.continuityImpact}
          onAccept={handleReviseAccept}
          onDiscard={handleReviseDiscard}
          onAdjust={handleReviseAdjust}
        />
      )}

      {globalOpen && !pendingGlobal && (
        <GlobalRevisionPanel
          loading={globalLoading}
          onSubmit={handleGlobalSubmit}
          onCancel={() => { setGlobalOpen(false); setGlobalError(null) }}
        />
      )}

      {pendingGlobal && (
        <GlobalSummary
          summary={pendingGlobal.summary}
          revisedScenes={pendingGlobal.revisedScenes}
          originalScenes={scenes}
          onAccept={handleGlobalAccept}
          onDiscard={handleGlobalDiscard}
        />
      )}

      {showVersions && (
        <VersionHistory versions={versions} onClose={() => setShowVersions(false)} />
      )}
    </div>
  )
}
