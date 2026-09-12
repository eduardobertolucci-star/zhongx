import { useState } from 'react'

export default function NewProduction({ onStart }) {
  const [tema, setTema] = useState('')
  const [duracao, setDuracao] = useState('10')
  const [tom, setTom] = useState('')
  const [restricoes, setRestriccoes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!tema.trim()) return
    onStart({ tema, duracao, tom, restricoes })
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
          {/* Tema */}
          <div>
            <label className={labelClass}>
              Tema do vídeo
              <span className="text-blue-400 ml-1">*</span>
            </label>
            <textarea
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              rows={4}
              placeholder="Ex: A verdadeira história por trás do Teorema de Pitágoras"
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
              placeholder="Ex: Não apresentar como fato que X. Preservar incerteza histórica onde existir."
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
