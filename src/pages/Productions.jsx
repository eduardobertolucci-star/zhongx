const statusLabel = {
  concept_pitch : 'Concept Pitch',
  gate_1        : 'Aguardando CEO',
  script        : 'Roteiro',
  done          : 'Concluído',
}

const statusStyle = {
  concept_pitch : 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  gate_1        : 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  script        : 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  done          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Productions({ productions, loading, onOpen, onNavigate }) {
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <p className="text-zinc-500 text-sm">Carregando produções...</p>
      </div>
    )
  }

  if (productions.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-full text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </div>
        <p className="text-white font-semibold text-lg">Nenhuma produção ainda</p>
        <p className="text-zinc-500 text-sm max-w-xs">Crie sua primeira produção e ela aparecerá aqui.</p>
        <button
          onClick={() => onNavigate('new')}
          className="mt-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Iniciar Nova Produção
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Produções</h1>
          <p className="text-zinc-500 mt-1">{productions.length} {productions.length === 1 ? 'produção registrada' : 'produções registradas'}</p>
        </div>
        <button
          onClick={() => onNavigate('new')}
          className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Produção
        </button>
      </div>

      <div className="space-y-3">
        {productions.map((p) => (
          <button
            key={p.id}
            onClick={() => onOpen(p)}
            className="w-full text-left bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-base leading-snug group-hover:text-amber-100 transition-colors line-clamp-2">
                  {p.tema}
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusStyle[p.stage] || statusStyle.concept_pitch}`}>
                    {statusLabel[p.stage] || 'Iniciado'}
                  </span>
                  <span className="text-zinc-500 text-xs">{p.duracao} min</span>
                  <span className="text-zinc-600 text-xs">{formatDate(p.createdAt)}</span>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
