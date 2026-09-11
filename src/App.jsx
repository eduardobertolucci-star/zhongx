import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import NewProduction from './pages/NewProduction'
import Studio from './pages/Studio'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [production, setProduction] = useState(null)

  const handleStartProduction = (data) => {
    setProduction(data)
    setPage('studio')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <Sidebar currentPage={page} onNavigate={setPage} />
      <main className="flex-1 overflow-auto">
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'new' && <NewProduction onStart={handleStartProduction} />}
        {page === 'studio' && <Studio production={production} />}
      </main>
    </div>
  )
}
