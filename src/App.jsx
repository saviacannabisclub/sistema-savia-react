import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './components/Login'
import Dashboard from './pages/Dashboard'
import Cosechas from './pages/Cosechas'
import Retiros from './pages/Retiros'
import Socios from './pages/Socios'
import Geneticas from './pages/Geneticas'
import Ingresos from './pages/Ingresos'
import Egresos from './pages/Egresos'
import Contable from './pages/Contable'
import Ajustes from './pages/Ajustes'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="cosechas"  element={<Cosechas />} />
            <Route path="retiros"   element={<Retiros />} />
            <Route path="socios"    element={<Socios />} />
            <Route path="geneticas" element={<Geneticas />} />
            <Route path="ingresos"  element={<Ingresos />} />
            <Route path="egresos"   element={<Egresos />} />
            <Route path="contable"  element={<Contable />} />
            <Route path="ajustes"   element={<Ajustes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App