const stats = [
  { label: 'Produções Ativas', value: '0', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { label: 'Roteiros Gerados', value: '0', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )},
  { label: 'Vídeos Exportados', value: '0', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )},
]

const pipeline = [
  { label: 'Roteirista', icon: '✍', desc: 'Criação do roteiro' },
  { label: 'Diretor', icon: '🎬', desc: 'Direção criativa' },
  { label: 'Editor', icon: '✂', desc: 'Formatação e estrutura' },
  { label: 'Revisor', icon: '🔍', desc: 'Controle de qualidade' },
  { label: 'Imagens', icon: '🖼', desc: 'Geração visual' },
  { label: 'Exportação', icon: '📤', desc: 'Renderização final' },
]

export default function Dashboard({ onNavigate }) {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Olá, CEO</h1>
        <p className="text-zinc-500 mt-1 capitalize">{today}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-800 rounded-xl p-5 border border-zinc-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400">{stat.icon}</span>
              <span className="text-3xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-sm text-zinc-400 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Pipeline de Produção</h2>
        <div className="flex items-stretch gap-0">
          {pipeline.map((stage, index) => (
            <div key={stage.label} className="flex items-center flex-1">
              <div className="flex-1 bg-zinc-800 border border-zinc-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{stage.icon}</div>
                <p className="text-xs font-semibold text-white">{stage.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{stage.desc}</p>
              </div>
              {index < pipeline.length - 1 && (
                <div className="flex items-center px-1 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => onNavigate('new')}
          className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-8 py-3.5 rounded-xl text-base transition-colors flex items-center gap-2.5 shadow-lg shadow-amber-900/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Iniciar Nova Produção
        </button>
      </div>
    </div>
  )
}
