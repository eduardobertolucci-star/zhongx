import { useState } from 'react'

export default function NewProduction({ onStart }) {
  const [tema, setTema] = useState('')
  const [writerMode, setWriterMode] = useState('factual')
  const [duracao, setDuracao] = useState('10')
  const [estilo, setEstilo] = useState('Minimalista')
  const [voz, setVoz] = useState('Masculina Grave')
  const [observacoes, setObservacoes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!tema.trim()) return
    onStart({ tema, writerMode, duracao, estilo, voz, observacoes })
  }

  const selectClass =
    'w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors appearance-none cursor-pointer'

  const labelClass = 'block text-sm font-semibold text-zinc-300 mb-1.5'

  return (
    <div className="p-8 flex items-start justify-center min-h-full">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Nova Produção</h1>
          <p className="text-zinc-500 mt-1">Defina o briefing e os agentes entrarão em ação</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Produção */}
          <div>
            <label className={labelClass}>
              Tipo de produção
              <span className="text-amber-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWriterMode('factual')}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  writerMode === 'factual'
                    ? 'bg-amber-500/10 border-amber-500/60 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-2 h-2 rounded-full ${writerMode === 'factual' ? 'bg-amber-400' : 'bg-zinc-600'}`} />
                  <span className="text-sm font-bold uppercase tracking-wide">Factual</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Conteúdo baseado em fatos, pesquisa e conhecimento real.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setWriterMode('fiction')}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  writerMode === 'fiction'
                    ? 'bg-amber-500/10 border-amber-500/60 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-2 h-2 rounded-full ${writerMode === 'fiction' ? 'bg-amber-400' : 'bg-zinc-600'}`} />
                  <span className="text-sm font-bold uppercase tracking-wide">Fiction</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Histórias originais com personagens, conflito e arco narrativo.
                </p>
              </button>
            </div>
          </div>

          {/* Tema */}
          <div>
            <label className={labelClass}>
              {writerMode === 'fiction' ? 'Premissa ou ponto de partida' : 'Tema do vídeo'}
              <span className="text-amber-500 ml-1">*</span>
            </label>
            <textarea
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              rows={4}
              placeholder={
                writerMode === 'fiction'
                  ? 'Ex: Um pequeno robô acorda sozinho em uma cidade onde todos os humanos desapareceram.'
                  : 'Ex: Por que 0! = 1? A matemática por trás do fatorial zero'
              }
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none placeholder:text-zinc-600"
            />
          </div>

          {/* Row: Duração + Estilo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Duração alvo</label>
              <div className="relative">
                <select
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  className={selectClass}
                >
                  <option value="5">5 minutos</option>
                  <option value="8">8 minutos</option>
                  <option value="10">10 minutos</option>
                  <option value="15">15 minutos</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div>
              <label className={labelClass}>Estilo visual</label>
              <div className="relative">
                <select
                  value={estilo}
                  onChange={(e) => setEstilo(e.target.value)}
                  className={selectClass}
                >
                  <option>Minimalista</option>
                  <option>Ilustrativo</option>
                  <option>Científico</option>
                  <option>Dramático</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Voz */}
          <div>
            <label className={labelClass}>Voz do narrador</label>
            <div className="relative">
              <select
                value={voz}
                onChange={(e) => setVoz(e.target.value)}
                className={selectClass}
              >
                <option>Masculina Grave</option>
                <option>Masculina Jovem</option>
                <option>Feminina Profissional</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className={labelClass}>
              Observações do CEO
              <span className="text-zinc-600 font-normal ml-1.5">(opcional)</span>
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              placeholder={
                writerMode === 'fiction'
                  ? 'Público-alvo, tom, personagens existentes, referências de universo...'
                  : 'Instruções adicionais, tom desejado, referências...'
              }
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none placeholder:text-zinc-600"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!tema.trim()}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-950 font-bold py-3.5 rounded-xl text-base transition-colors flex items-center justify-center gap-2.5 shadow-lg shadow-amber-900/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Iniciar Produção
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
