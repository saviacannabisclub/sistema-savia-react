import { useState, useMemo } from 'react'
import { useRetiros } from '../hooks/useRetiros'
import { useIngresos } from '../hooks/useIngresos'
import { useEgresos } from '../hooks/useEgresos'
import { useSocios } from '../hooks/useSocios'
import { fmt, fmtFecha } from '../lib/format'

const PERIODOS = [
  { value: 'todos', label: 'Todo el período' },
  { value: 'mes',   label: 'Este mes' },
  { value: 'año',   label: 'Este año' },
]

function filtrarPorPeriodo(items, periodo, getFecha) {
  if (periodo === 'todos') return items
  const ahora = new Date()
  return items.filter((item) => {
    const f = new Date(getFecha(item))
    if (periodo === 'año') return f.getFullYear() === ahora.getFullYear()
    if (periodo === 'mes')
      return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear()
    return true
  })
}

export default function Contable() {
  const { retiros, loading: lr } = useRetiros()
  const { ingresos, loading: li } = useIngresos()
  const { egresos, loading: le } = useEgresos()
  const { socios } = useSocios()

  const [periodo, setPeriodo] = useState('todos')

  const loading = lr || li || le

  // Filtrado por período
  const { retConfirmados, ingF, egrF } = useMemo(() => {
    const retConf = retiros.filter((r) => r.estado === 'confirmado')
    return {
      retConfirmados: filtrarPorPeriodo(retConf, periodo, (r) => r.fecha),
      ingF: filtrarPorPeriodo(ingresos, periodo, (i) => i.fecha),
      egrF: filtrarPorPeriodo(egresos, periodo, (e) => e.fecha),
    }
  }, [retiros, ingresos, egresos, periodo])

  // Totales
  const totalRetiros  = retConfirmados.reduce((a, r) => a + Number(r.aporte_total), 0)
  const totalIngresos = ingF.reduce((a, i) => a + Number(i.monto), 0)
  const totalEgresos  = egrF.reduce((a, e) => a + Number(e.monto), 0)
  const totalGramos   = retConfirmados.reduce((a, r) => a + Number(r.gramos), 0)
  const ingresosTotal = totalRetiros + totalIngresos
  const saldo         = ingresosTotal - totalEgresos

  // Movimientos consolidados ordenados por fecha desc
  const movimientos = useMemo(() => {
    const m = [
      ...retConfirmados.map((r) => ({
        id: `r-${r.id}`,
        fecha: r.fecha,
        desc: `Aporte retiro · ${r.socio_nombre} · ${r.genetica_nombre} ${r.gramos}g`,
        monto: Number(r.aporte_total),
        tipo: 'ingreso',
        sub: 'Aporte por retiro',
      })),
      ...ingF.map((i) => ({
        id: `i-${i.id}`,
        fecha: i.fecha,
        desc: i.concepto,
        monto: Number(i.monto),
        tipo: 'ingreso',
        sub: i.tipo,
      })),
      ...egrF.map((e) => ({
        id: `e-${e.id}`,
        fecha: e.fecha,
        desc: e.concepto,
        monto: Number(e.monto),
        tipo: 'egreso',
        sub: e.tipo,
      })),
    ]
    return m.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [retConfirmados, ingF, egrF])

  // Aportes por socio
  const aportesPorSocio = useMemo(() => {
    return socios
      .filter((s) => !s.es_demo)
      .map((s) => {
        const rs = retConfirmados.filter((r) => r.socio_id === s.id)
        if (!rs.length) return null
        return {
          ...s,
          retiros_count: rs.length,
          gramos_total: rs.reduce((a, r) => a + Number(r.gramos), 0),
          aporte_total: rs.reduce((a, r) => a + Number(r.aporte_total), 0),
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.aporte_total - a.aporte_total)
  }, [socios, retConfirmados])

  if (loading) {
    return <p className="text-gray-500">Cargando información contable...</p>
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-verde">Contable 📊</h2>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="form-input w-auto"
        >
          {PERIODOS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <KPI label="Total ingresos"    valor={fmt(ingresosTotal)} color="verde" />
        <KPI label="Total egresos"     valor={`-${fmt(totalEgresos)}`} color="rojo" />
        <KPI label="Saldo neto"        valor={fmt(saldo)} color={saldo >= 0 ? 'verde' : 'rojo'} />
        <KPI label="Gramos entregados" valor={`${totalGramos}g`} color="verde-medio" />
      </div>

      {/* Movimientos */}
      <div className="bg-white rounded-xl border border-crema-oscuro p-5 mb-3">
        <h3 className="text-base font-bold text-verde mb-3">Todos los movimientos</h3>
        {movimientos.length === 0 ? (
          <p className="text-sm text-gray-500">Sin movimientos en este período.</p>
        ) : (
          <div className="divide-y divide-crema-oscuro">
            {movimientos.map((m) => (
              <div key={m.id} className="grid grid-cols-[1fr_auto] gap-3 py-2.5 items-center">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{m.desc}</div>
                  <div className="text-[11px] text-gray-500 font-sans">
                    {fmtFecha(m.fecha)} · {m.sub}
                  </div>
                </div>
                <div
                  className={`font-bold text-sm font-sans ${
                    m.tipo === 'egreso' ? 'text-red-600' : 'text-verde'
                  }`}
                >
                  {m.tipo === 'egreso' ? '-' : ''}{fmt(m.monto)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aportes por socio */}
      <div className="bg-white rounded-xl border border-crema-oscuro p-5">
        <h3 className="text-base font-bold text-verde mb-3">Aportes por socio</h3>
        {aportesPorSocio.length === 0 ? (
          <p className="text-sm text-gray-500">Sin datos en este período.</p>
        ) : (
          <div className="divide-y divide-crema-oscuro">
            {aportesPorSocio.map((s) => (
              <div key={s.id} className="flex justify-between items-center py-2.5">
                <div>
                  <div className="text-sm font-semibold">
                    {s.nombre}{' '}
                    <span className="text-xs text-gray-500 font-sans font-normal">#{s.numero}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-sans">
                    {s.retiros_count} retiros · {s.gramos_total}g
                  </div>
                </div>
                <span className="font-bold text-verde">{fmt(s.aporte_total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function KPI({ label, valor, color }) {
  const colores = {
    verde:        'border-l-verde text-verde',
    'verde-medio':'border-l-verde-medio text-verde',
    rojo:         'border-l-red-500 text-red-600',
  }
  const cls = colores[color] || colores.verde
  return (
    <div className={`bg-white rounded-xl border border-crema-oscuro border-l-4 p-3 ${cls.split(' ')[0]}`}>
      <div className={`text-base font-bold ${cls.split(' ')[1]}`}>{valor}</div>
      <div className="text-[11px] text-gray-500 font-sans mt-0.5">{label}</div>
    </div>
  )
}