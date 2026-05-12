import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './components/Login'
import Dashboard from './Pages/Dashboard'
import Cosechas from './Pages/Cosechas'
import Retiros from './Pages/Retiros'
import Socios from './Pages/Socios'
import Geneticas from './Pages/Geneticas'
import Ingresos from './Pages/Ingresos'
import Egresos from './Pages/Egresos'
import Contable from './Pages/Contable'
import Ajustes from './Pages/Ajustes'

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