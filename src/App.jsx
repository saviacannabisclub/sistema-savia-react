import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function TestSupabase({ user, signOut }) {
  const [geneticas, setGeneticas] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('geneticas').select('*').then(({ data, error }) => {
      if (error) setError(error.message)
      else setGeneticas(data || [])
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-crema-suave p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h1 className="text-xl font-bold text-verde mb-2">🌿 ¡Hola {user.email}!</h1>
        {error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : (
          <>
            <p className="text-gray-700 mb-3">
              ✅ Estás autenticado y veo <strong>{geneticas.length}</strong> genéticas:
            </p>
            <ul className="space-y-1 mb-4">
              {geneticas.map(g => (
                <li key={g.id} className="bg-verde-claro p-2 rounded text-verde-oscuro text-sm">
                  {g.nombre} <span className="text-xs text-gray-500">({g.tipo})</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <button
          onClick={signOut}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}


function AppContent() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-crema-suave">
        <p className="text-verde">Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }
// Usuario logueado — vista temporal de prueba
  return <TestSupabase user={user} signOut={signOut} />
  // Usuario logueado — vista temporal de prueba
 /* return (
    <div className="min-h-screen flex items-center justify-center bg-crema-suave p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-verde flex items-center justify-center border-2 border-crema mx-auto mb-4">
          <span className="text-crema text-3xl font-bold">S</span>
        </div>
        <h1 className="text-2xl font-bold text-verde mb-2">¡Bienvenido!</h1>
        <p className="text-gray-600 mb-1">{user.email}</p>
        <p className="text-sm text-green-600 mb-6">✅ Login funcionando correctamente</p>
        <button
          onClick={signOut}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )*/
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App