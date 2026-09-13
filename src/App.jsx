import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore'
import { auth, db } from './firebase'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import NewProduction from './pages/NewProduction'
import Productions from './pages/Productions'
import Studio from './pages/Studio'

export default function App() {
  const [user, setUser]               = useState(undefined) // undefined = carregando
  const [page, setPage]               = useState('dashboard')
  const [production, setProduction]   = useState(null)
  const [productions, setProductions] = useState([])
  const [loading, setLoading]         = useState(true)

  // Escuta estado de autenticação
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u ?? null))
    return unsub
  }, [])

  // Carrega produções quando usuário loga
  useEffect(() => {
    if (!user) { setProductions([]); setLoading(false); return }
    setLoading(true)
    getDocs(query(collection(db, 'productions'), orderBy('createdAt', 'desc')))
      .then(snap => setProductions(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  async function handleStartProduction(data) {
    const record = {
      createdAt : new Date().toISOString(),
      stage     : 'concept_pitch',
      uid       : user.uid,
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

  // Carregando auth
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <span className="text-zinc-600 text-sm">Carregando...</span>
      </div>
    )
  }

  // Não autenticado
  if (!user) return <Login />

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <Sidebar currentPage={page} onNavigate={setPage} user={user} onSignOut={() => signOut(auth)} />
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
        {page === 'studio' && <Studio production={production} />}
      </main>
    </div>
  )
}
