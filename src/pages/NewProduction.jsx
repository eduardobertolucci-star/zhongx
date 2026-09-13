import { useState } from 'react'

export default function NewProduction({ onStart }) {
  const [tema, setTema] = useState('')
  const [writerMode, setWriterMode] = useState('factual')
  const [audienceMode, setAudienceMode] = useState('general')
  const [targetAge, setTargetAge] = useState('')
  const [duracao, setDuracao] = useState('10')
  const [tom, setTom] = useState('')
  const [restricoes, setRestriccoes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!tema.trim()) return
    const brief = { tema, writerMode, audienceMode, duracao, tom, restricoes }
    if (audienceMode === 'children' && targetAge.trim()) brief.targetAge = targetAge.trim()
    onStart(brief)
  }

  const selectClass =
    'w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer'

  const labelClass = 'block text-sm font-semibold text-zinc-300 mb-1.5'

  return (
    <div className="p-8 flex items-start justify-center min-h-full">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Nova Produção</h1>
          <p className="text-zinc-500 mt-1">O Roteirista inicia com a Proposta de Ângulos. O CEO aprova o ângulo antes do roteiro.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Produção */}
          <div>
            <label className={labelClass}>Tipo de produção</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'factual', label: 'Factual', desc: 'Conteúdo baseado em fatos, pesquisa e conhecimento real.' },
                { value: 'fiction', label: 'Fiction', desc: 'Histórias originais com personagens, conflito e arco narrativo.' },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setWriterMode(value)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    writerMode === value
                      ? 'bg-blue-500/10 border-blue-500/60 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`w-2 h-2 rounded-full ${writerMode === value ? 'bg-blue-400' : 'bg-zinc-600'}`} />
                    <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Público */}
          <div>
            <label className={labelClass}>Público</label>
            <div className="relative">
              <select
                value={audienceMode}
                onChange={(e) => { setAudienceMode(e.target.value); if (e.target.value !== 'children') setTargetAge('') }}
                className={selectClass}
              >
                <option value="general">Geral</option>
                <option value="children">Infantil</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Faixa etária — only visible when audienceMode = children */}
          {audienceMode === 'children' && (
            <div>
              <label className={labelClass}>
                Faixa etária
                <span className="text-zinc-600 font-normal ml-1.5">(opcional)</span>
              </label>
              <input
                type="text"
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
                placeholder="Ex: 6–8"
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
              />
            </div>
          )}

          {/* Tema */}
          <div>
            <label className={labelClass}>
              {writerMode === 'fiction' ? 'Premissa ou ponto de partida' : 'Tema do vídeo'}
              <span className="text-blue-400 ml-1">*</span>
            </label>
            <textarea
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              rows={4}
              placeholder={
                writerMode === 'fiction'
                  ? 'Ex: Um pequeno robô acorda sozinho em uma cidade onde todos os humanos desapareceram.'
                  : 'Ex: A verdadeira história por trás do Teorema de Pitágoras'
              }
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-zinc-600"
            />
          </div>

          {/* Duração */}
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
                <option value="12">12 minutos</option>
                <option value="15">15 minutos</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Tom */}
          <div>
            <label className={labelClass}>
              Tom
              <span className="text-zinc-600 font-normal ml-1.5">(opcional)</span>
            </label>
            <input
              type="text"
              value={tom}
              onChange={(e) => setTom(e.target.value)}
              placeholder="Ex: Intrigante, inteligente e acessível, sem sensacionalismo"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
            />
          </div>

          {/* Restrições do CEO */}
          <div>
            <label className={labelClass}>
              Restrições do CEO
              <span className="text-zinc-600 font-normal ml-1.5">(opcional)</span>
            </label>
            <textarea
              value={restricoes}
              onChange={(e) => setRestriccoes(e.target.value)}
              rows={2}
              placeholder={
                writerMode === 'fiction'
                  ? 'Ex: Público infantil, tom leve. Personagem Mooonstri já existe — não redesenhar.'
                  : 'Ex: Não apresentar como fato que X. Preservar incerteza histórica onde existir.'
              }
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-zinc-600"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!tema.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-base transition-colors flex items-center justify-center gap-2.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Iniciar Produção — Proposta de Ângulos
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
