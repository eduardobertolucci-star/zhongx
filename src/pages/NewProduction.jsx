import { useState } from 'react'

export default function NewProduction({ onStart }) {
  const [tema, setTema] = useState('')
  const [duracao, setDuracao] = useState('10')
  const [estilo, setEstilo] = useState('Minimalista')
  const [voz, setVoz] = useState('Masculina Grave')
  const [observacoes, setObservacoes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!tema.trim()) return
    onStart({ tema, duracao, estilo, voz, observacoes })
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
          {/* Tema */}
          <div>
            <label className={labelClass}>
              Tema do vídeo
              <span className="text-amber-500 ml-1">*</span>
            </label>
            <textarea
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              rows={4}
              placeholder="Ex: Por que 0! = 1? A matemática por trás do fatorial zero"
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
              placeholder="Instruções adicionais, tom desejado, referências..."
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
