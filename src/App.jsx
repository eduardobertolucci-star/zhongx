import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from './firebase'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import NewProduction from './pages/NewProduction'
import Productions from './pages/Productions'
import Studio from './pages/Studio'

export default function App() {
  const [page, setPage]               = useState('dashboard')
  const [production, setProduction]   = useState(null)
  const [productions, setProductions] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    getDocs(query(collection(db, 'productions'), orderBy('createdAt', 'desc')))
      .then(snap => {
        setProductions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleStartProduction(data) {
    const record = {
      createdAt : new Date().toISOString(),
      stage     : 'concept_pitch',
      ...data,
    }
    const docRef = await addDoc(collection(db, 'productions'), record)
    const full   = { ...record, id: docRef.id }
    setProductions(prev => [full, ...prev])
    setProduction({ ...full, _autoStart: true })
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
        {page === 'productions' && (
          <Productions
            productions={productions}
            loading={loading}
            onOpen={handleOpenProduction}
            onNavigate={setPage}
          />
        )}
        {page === 'studio'      && <Studio production={production} />}
      </main>
    </div>
  )
}
