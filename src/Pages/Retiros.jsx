import { useState, useMemo } from 'react'
import { Plus, Check, X, Trash2 } from 'lucide-react'
import { useRetiros } from '../hooks/useRetiros'
import { useSocios } from '../hooks/useSocios'
import { useGeneticas } from '../hooks/useGeneticas'
import { useCosechas } from '../hooks/useCosechas'
import { useConfig } from '../hooks/useConfig'
import { calcularAporte, stockPorGenetica } from '../lib/calculos'
import { fmt, fmtFecha } from '../lib/format'

const FILTROS = ['todos', 'pendiente', 'confirmado', 'cancelado']

export default function Retiros() {
  const { retiros, loading, createRetiro, confirmarRetiro, cancelarRetiro, deleteRetiro } = useRetiros()
  const { socios } = useSocios()
  const { geneticas } = useGeneticas()
  const { cosechas } = useCosechas()
  const { valorGramo } = useConfig()

  const [filtro, setFiltro] = useState('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ socio_id: '', genetica_id: '', gramos: '' })

  // Calcular stock por genética en vivo
  const stock = useMemo(
    () => stockPorGenetica(geneticas, cosechas, retiros),
    [geneticas, cosechas, retiros]
  )

  const sociosActivos = socios.filter((s) => s.activo && !s.es_demo)
  const geneticasActivas = geneticas.filter((g) => g.activa)

  const socioSeleccionado = socios.find((s) => s.id === parseInt(form.socio_id))
  const geneticaSeleccionada = geneticas.find((g) => g.id === parseInt(form.genetica_id))
  const stockGenetica = geneticaSeleccionada ? (stock[geneticaSeleccionada.id] || 0) : 0
  const gramosNum = parseFloat(form.gramos) || 0

  const aporte = useMemo(() => {
    if (!gramosNum || !socioSeleccionado) return null
    return calcularAporte(gramosNum, valorGramo, socioSeleccionado.costo_envio)
  }, [gramosNum, socioSeleccionado, valorGramo])

  const filtrados = filtro === 'todos' ? retiros : retiros.filter((r) => r.estado === filtro)

  const abrirNuevo = () => {
    setForm({ socio_id: '', genetica_id: '', gramos: '' })
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
  }

  const crear = async (e) => {
    e.preventDefault()
    if (!form.socio_id || !form.genetica_id || !gramosNum) return

    if (gramosNum > stockGenetica) {
      alert(`Stock insuficiente. Disponible: ${stockGenetica}g`)
      return
    }

    await createRetiro({
      socio: socioSeleccionado,
      genetica: geneticaSeleccionada,
      gramos: gramosNum,
      valorGramo,
    })
    cerrarModal()
  }

  const eliminar = async (r) => {
    if (!window.confirm(`¿Eliminar este retiro de ${r.socio_nombre}?\nEsto NO se puede deshacer.`)) return
    await deleteRetiro(r.id)
  }

  const cancelar = async (r) => {
    if (!window.confirm(`¿Cancelar este retiro de ${r.socio_nombre}?`)) return
    await cancelarRetiro(r.id)
  }

  if (loading) {
    return <p className="text-gray-500">Cargando retiros...</p>
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-verde">Retiros 📦</h2>
        <button
          onClick={abrirNuevo}
          className="bg-verde text-white font-semibold px-4 py-2 rounded-lg hover:bg-verde-oscuro transition flex items-center gap-1.5"
        >
          <Plus size={16} /> Nuevo retiro
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3.5 py-1 rounded-full border text-xs font-sans transition ${
              filtro === f
                ? 'bg-verde text-white border-verde font-bold'
                : 'bg-transparent text-gray-700 border-crema-oscuro hover:border-verde'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-crema-oscuro p-5">
          <p className="text-sm text-gray-500">No hay retiros en esta categoría.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtrados.map((r) => {
            const colorBorde =
              r.estado === 'confirmado' ? 'border-l-verde' :
              r.estado === 'pendiente'  ? 'border-l-ambar' : 'border-l-gray-400'
            const colorBadge =
              r.estado === 'confirmado' ? 'bg-verde/10 text-verde border-verde/40' :
              r.estado === 'pendiente'  ? 'bg-ambar/10 text-ambar border-ambar/40' :
                                         'bg-gray-200 text-gray-500 border-gray-300'
            const labelEstado =
              r.estado === 'confirmado' ? '✓ Confirmado' :
              r.estado === 'pendiente'  ? '⏳ Pendiente' : '✗ Cancelado'

            return (
              <div
                key={r.id}
                className={`bg-white rounded-xl border border-crema-oscuro border-l-4 ${colorBorde} p-4`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-base">{r.socio_nombre}</span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-sans font-semibold border ${colorBadge}`}
                      >
                        {labelEstado}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 font-sans">
                      {r.genetica_nombre} · <strong>{r.gramos}g</strong> · Lote {r.lote}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 font-sans">
                      {fmtFecha(r.fecha)} · <strong>{fmt(r.aporte_total)}</strong>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
                    {r.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={() => confirmarRetiro(r.id)}
                          className="bg-verde text-white px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-verde-oscuro flex items-center gap-1 font-sans"
                          title="Confirmar pago"
                        >
                          <Check size={13} /> Confirmar
                        </button>
                        <button
                          onClick={() => cancelar(r)}
                          className="border border-red-500 text-red-600 px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-red-50 flex items-center gap-1 font-sans"
                          title="Cancelar retiro"
                        >
                          <X size={13} /> Cancelar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => eliminar(r)}
                      className="text-red-600 hover:bg-red-50 p-1.5 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4"
          onClick={cerrarModal}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-verde">Nuevo Retiro</h3>
              <button onClick={cerrarModal} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={crear} className="space-y-3">
              {/* Socio */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
                  Socio *
                </label>
                <select
                  required
                  value={form.socio_id}
                  onChange={(e) => setForm({ ...form, socio_id: e.target.value })}
                  className="form-input"
                >
                  <option value="">Seleccionar socio...</option>
                  {sociosActivos.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.numero} {s.nombre}
                    </option>
                  ))}
                </select>
                {socioSeleccionado && (
                  <div className="bg-verde-claro rounded-lg p-2 text-xs text-verde-oscuro mt-1 font-sans">
                    📍 {socioSeleccionado.direccion || '—'} · Envío:{' '}
                    {fmt(socioSeleccionado.costo_envio)}
                  </div>
                )}
              </div>

              {/* Genética */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
                  Genética *
                </label>
                <select
                  required
                  value={form.genetica_id}
                  onChange={(e) => setForm({ ...form, genetica_id: e.target.value })}
                  className="form-input"
                >
                  <option value="">Seleccionar genética...</option>
                  {geneticasActivas.map((g) => {
                    const s = stock[g.id] || 0
                    return (
                      <option key={g.id} value={g.id} disabled={s <= 0}>
                        {g.nombre}{s <= 0 ? ' — sin stock' : ` · ${s}g disponibles`}
                      </option>
                    )
                  })}
                </select>
                {geneticaSeleccionada && (
                  <div
                    className={`rounded-lg p-2 text-xs mt-1 font-sans font-semibold ${
                      stockGenetica <= 0
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : stockGenetica < 10
                        ? 'bg-ambar-claro text-ambar border border-ambar/40'
                        : 'bg-verde-claro text-verde border border-verde/40'
                    }`}
                  >
                    📦 Disponible: {stockGenetica}g
                  </div>
                )}
              </div>

              {/* Gramos */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
                  Gramos a retirar *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={form.gramos}
                  onChange={(e) => setForm({ ...form, gramos: e.target.value })}
                  className="form-input"
                  placeholder="ej: 10"
                />
              </div>

              {/* Detalle del aporte (en vivo) */}
              {aporte && (
                <div className="bg-verde-claro border border-verde/30 rounded-lg p-3 space-y-1.5 mt-2">
                  <div className="font-bold text-verde text-xs mb-1 font-sans">Detalle del aporte</div>
                  <Linea label={`Material (${gramosNum}g × ${fmt(valorGramo)})`} valor={aporte.base} />
                  <Linea label="Costo de envío" valor={aporte.envio} />
                  <hr className="border-crema-oscuro my-1" />
                  <div className="flex justify-between font-bold text-verde">
                    <span>TOTAL</span>
                    <span>{fmt(aporte.total)}</span>
                  </div>
                </div>
              )}

              {gramosNum > 0 && stockGenetica > 0 && gramosNum > stockGenetica && (
                <div className="bg-red-100 border border-red-300 text-red-700 text-xs p-2.5 rounded-lg font-sans">
                  ⚠️ Querés retirar {gramosNum}g pero solo hay {stockGenetica}g disponibles.
                </div>
              )}

              <button
                type="submit"
                disabled={!form.socio_id || !form.genetica_id || !gramosNum || gramosNum > stockGenetica}
                className="w-full bg-verde text-white font-semibold py-2.5 rounded-lg hover:bg-verde-oscuro transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Generar retiro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Linea({ label, valor }) {
  return (
    <div className="flex justify-between text-xs font-sans text-gray-700">
      <span>{label}</span>
      <span className="font-semibold">{fmt(valor)}</span>
    </div>
  )
}