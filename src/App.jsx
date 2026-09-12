import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import NewProduction from './pages/NewProduction'
import Productions from './pages/Productions'
import Studio from './pages/Studio'

const STORAGE_KEY = 'zhongx_productions'

function loadProductions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveProductions(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function App() {
  const [page, setPage]             = useState('dashboard')
  const [production, setProduction] = useState(null)
  const [productions, setProductions] = useState(loadProductions)

  function handleStartProduction(data) {
    const record = {
      id        : Date.now().toString(),
      createdAt : new Date().toISOString(),
      stage     : 'concept_pitch',
      ...data,
    }

    const updated = [record, ...productions]
    setProductions(updated)
    saveProductions(updated)

    setProduction({ ...record, _autoStart: true })
    setPage('studio')
  }

  function handleOpenProduction(record) {
    setProduction({ ...record, _autoStart: false })
    setPage('studio')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <Sidebar currentPage={page} onNavigate={setPage} />
      <main className="flex-1 overflow-auto">
        {page === 'dashboard'   && <Dashboard onNavigate={setPage} />}
        {page === 'new'         && <NewProduction onStart={handleStartProduction} />}
        {page === 'productions' && <Productions productions={productions} onOpen={handleOpenProduction} onNavigate={setPage} />}
        {page === 'studio'      && <Studio production={production} />}
      </main>
    </div>
  )
}
