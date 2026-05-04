import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut } from 'lucide-react'

const TABS = [
  { path: '/', label: 'Inicio',     icon: '🌿' },
  { path: '/cosechas',  label: 'Cosechas',  icon: '🌾' },
  { path: '/retiros',   label: 'Retiros',   icon: '📦' },
  { path: '/socios',    label: 'Socios',    icon: '👥' },
  { path: '/geneticas', label: 'Genéticas', icon: '🧬' },
  { path: '/ingresos',  label: 'Ingresos',  icon: '💚' },
  { path: '/egresos',   label: 'Egresos',   icon: '💸' },
  { path: '/contable',  label: 'Contable',  icon: '📊' },
  { path: '/ajustes',   label: 'Ajustes',   icon: '⚙️' },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-crema-suave">
      {/* Header */}
      <header className="bg-verde sticky top-0 z-50 px-5 py-3 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-full bg-verde border-2 border-crema flex items-center justify-center flex-shrink-0">
          <span className="text-crema text-xl font-bold">S</span>
        </div>
        <div className="flex-1">
          <div className="text-crema text-xl font-bold leading-tight">Savia</div>
          <div className="text-crema/60 text-[10px] tracking-widest uppercase font-sans">
            Cannabis Club · Sistema de Gestión
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="text-crema/80 hover:text-crema flex items-center gap-1 text-xs font-sans"
          title={`Cerrar sesión (${user?.email})`}
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </header>

      {/* Navegación */}
      <nav className="bg-verde-oscuro flex overflow-x-auto sticky top-[64px] z-40">
        {TABS.map((t) => (
          <NavLink
            key={t.path}
            to={t.path}
            end={t.path === '/'}
            className={({ isActive }) =>
              `px-3 py-2.5 text-[11px] flex flex-col items-center gap-0.5 min-w-[65px] whitespace-nowrap font-sans transition ${
                isActive
                  ? 'bg-crema text-verde font-bold'
                  : 'text-crema/70 hover:text-crema'
              }`
            }
          >
            <span className="text-[15px]">{t.icon}</span>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Contenido de la página */}
      <main className="max-w-4xl mx-auto px-4 py-5 pb-20">
        <Outlet />
      </main>
    </div>
  )
}