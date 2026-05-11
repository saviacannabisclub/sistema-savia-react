import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, Package, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { useGeneticas } from '../hooks/useGeneticas'
import { useSocios } from '../hooks/useSocios'
import { useCosechas } from '../hooks/useCosechas'
import { useRetiros } from '../hooks/useRetiros'
import { useIngresos } from '../hooks/useIngresos'
import { useEgresos } from '../hooks/useEgresos'
import { stockPorGenetica } from '../lib/calculos'
import { fmt } from '../lib/format'

export default function Dashboard() {
  const { geneticas, loading: lg } = useGeneticas()
  const { socios,    loading: ls } = useSocios()
  const { cosechas,  loading: lc } = useCosechas()
  const { retiros,   loading: lr } = useRetiros()
  const { ingresos,  loading: li } = useIngresos()
  const { egresos,   loading: le } = useEgresos()

  const loading = lg || ls || lc || lr || li || le

  const stock = useMemo(
    () => stockPorGenetica(geneticas, cosechas, retiros),
    [geneticas, cosechas, retiros]
  )

  // KPIs
  const sociosActivos = socios.filter((s) => s.activo && !s.es_demo).length
  const totalStock    = Object.values(stock).reduce((a, b) => a + b, 0)
  const retConf       = retiros.filter((r) => r.estado === 'confirmado')
  const pendientes    = retiros.filter((r) => r.estado === 'pendiente')
  const totalRetiros  = retConf.reduce((a, r) => a + Number(r.aporte_total), 0)
  const totalIngresos = ingresos.reduce((a, i) => a + Number(i.monto), 0)
  const totalEgresos  = egresos.reduce((a, e) => a + Number(e.monto), 0)
  const ingresosTotal = totalRetiros + totalIngresos
  const saldo         = ingresosTotal - totalEgresos

  // Stock por genética (solo activas)
  const stockRows = geneticas
    .filter((g) => g.activa)
    .map((g) => ({ ...g, gramos: stock[g.id] || 0 }))

  if (loading) {
    return <p className="text-gray-500">Cargando...</p>
  }

  return (
    <div>
      {/* Bienvenida */}
      <h2 className="text-2xl font-bold text-verde mb-1">Bienvenidos 🌿</h2>
      <p className="text-sm text-gray-600 mb-4 font-sans">Panel de gestión · Savia Cannabis Club</p>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <KPI
          to="/socios"
          icon={<Users size={18} />}
          valor={sociosActivos}
          label="Socios activos"
          color="verde"
        />
        <KPI
          to="/geneticas"
          icon={<Package size={18} />}
          valor={`${totalStock}g`}
          label="Stock total disponible"
          color="verde"
        />
        <KPI
          to="/contable"
          icon={<TrendingUp size={18} />}
          valor={fmt(ingresosTotal)}
          label="Total ingresos"
          color="verde"
          small
        />
        <KPI
          to="/contable"
          icon={saldo >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          valor={fmt(saldo)}
          label="Saldo neto"
          color={saldo >= 0 ? 'verde' : 'rojo'}
          small
        />
      </div>

      {/* Alerta de retiros pendientes */}
      {pendientes.length > 0 && (
        <Link
          to="/retiros"
          className="block bg-ambar-claro border border-ambar/40 border-l-4 border-l-ambar rounded-xl p-4 mb-3 hover:shadow transition"
        >
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <AlertCircle className="text-ambar mt-0.5 flex-shrink-0" size={20} />
              <div>
                <div className="font-bold text-ambar text-sm">
                  {pendientes.length} retiro{pendientes.length > 1 ? 's' : ''} pendiente{pendientes.length > 1 ? 's' : ''}
                </div>
                <div className="text-xs text-gray-600 font-sans mt-0.5">
                  Esperando confirmación de pago
                </div>
              </div>
            </div>
            <span className="text-ambar font-semibold text-sm font-sans">Ver →</span>
          </div>
        </Link>
      )}

      {/* Stock por genética */}
      <div className="bg-white rounded-xl border border-crema-oscuro p-5">
        <h3 className="text-base font-bold text-verde mb-3">Stock por Genética</h3>
        {stockRows.length === 0 ? (
          <p className="text-sm text-gray-500">Sin genéticas activas.</p>
        ) : (
          <div className="divide-y divide-crema-oscuro">
            {stockRows.map((g) => (
              <div key={g.id} className="flex justify-between items-center py-2">
                <span className="text-sm">{g.nombre}</span>
                <BadgeStock gramos={g.gramos} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function KPI({ to, icon, valor, label, color = 'verde', small = false }) {
  const colores = {
    verde: 'border-l-verde text-verde',
    rojo:  'border-l-red-500 text-red-600',
  }
  const c = colores[color] || colores.verde
  return (
    <Link
      to={to}
      className={`bg-white rounded-xl border border-crema-oscuro border-l-4 p-3.5 hover:shadow transition block ${c.split(' ')[0]}`}
    >
      <div className={`${c.split(' ')[1]} flex items-center gap-1.5`}>
        {icon}
      </div>
      <div className={`font-bold mt-1 ${c.split(' ')[1]} ${small ? 'text-base' : 'text-xl'}`}>
        {valor}
      </div>
      <div className="text-[11px] text-gray-500 font-sans mt-0.5">{label}</div>
    </Link>
  )
}

function BadgeStock({ gramos }) {
  let cls = 'bg-verde/10 text-verde border-verde/40'
  if (gramos <= 0)      cls = 'bg-red-50 text-red-700 border-red-200'
  else if (gramos < 10) cls = 'bg-ambar/10 text-ambar border-ambar/40'

  return (
    <span className={`text-[11px] font-semibold font-sans px-2.5 py-0.5 rounded-full border ${cls}`}>
      {gramos}g disponibles
    </span>
  )
}