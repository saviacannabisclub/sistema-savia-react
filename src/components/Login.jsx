import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Si ya está logueado, redirigir al dashboard
  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error } = await signIn(email, password)
    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-crema-suave p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-verde flex items-center justify-center border-2 border-crema mb-3">
            <span className="text-crema text-3xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-verde">Savia</h1>
          <p className="text-xs tracking-widest uppercase text-gray-500 font-sans">
            Cannabis Club · Sistema de Gestión
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-crema-oscuro rounded-lg bg-crema-suave focus:outline-none focus:border-verde"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-crema-oscuro rounded-lg bg-crema-suave focus:outline-none focus:border-verde"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-verde text-white font-semibold py-2.5 rounded-lg hover:bg-verde-oscuro transition disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}