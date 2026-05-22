import { useState, useMemo } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useRetiros } from '../Hooks/useRetiros'
import { useSocios } from '../Hooks/useSocios'
import { useGeneticas } from '../Hooks/useGeneticas'
import { useCosechas } from '../Hooks/useCosechas'
import { stockPorGenetica } from '../lib/calculos'
import { fmtFecha } from '../lib/format'

const ITEM_VACIO = { genetica_id: '', gramos: '' }

// Color por nombre de genética (bg, text, border)
const COLORES_GENETICA = {
  'black valentine':  { bg: 'bg-gray-800',   text: 'text-white',     border: 'border-gray-900' },
  'cafe americano':   { bg: 'bg-red-600',     text: 'text-white',     border: 'border-red-700' },
  'flava flav':       { bg: 'bg-green-600',   text: 'text-white',     border: 'border-green-700' },
  'mintz':            { bg: 'bg-blue-500',    text: 'text-white',     border: 'border-blue-600' },
  'lemon cherry soap':{ bg: 'bg-yellow-400',  text: 'text-gray-800',  border: 'border-yellow-500' },
  'lit og':           { bg: 'bg-purple-600',  text: 'text-white',     border: 'border-purple-700' },
  'sticky rice':      { bg: 'bg-amber-100',   text: 'text-amber-900', border: 'border-amber-300' },
}

const DEFAULT_COLOR = { bg: 'bg-crema', text: 'text-gray-700', border: 'border-crema-oscuro' }

function colorPorNombre(nombre = '') {
  const key = nombre.toLowerCase().trim()
  return COLORES_GENETICA[key] || DEFAULT_COLOR
}

export default function Retiros() {
  const { retiros, loading, createRetiro, deleteRetiro } = useRetiros()
  const { socios } = useSocios()
  const { geneticas } = useGeneticas()
  const { cosechas } = useCosechas()

  const [modalOpen, setModalOpen] = useState(false)
  const [socioId, setSocioId] = useState('')
  const [fecha, setFecha] = useState('')
  const [items, setItems] = useState([{ ...ITEM_VACIO }])

  const stock = useMemo(
    () => stockPorGenetica(geneticas, cosechas, retiros),
    [geneticas, cosechas, retiros]
  )

  const stockDisponiblePara = (idx, genId) => {
    if (!genId) return 0
    const base = stock[genId] || 0
    const usadoEnOtros = items.reduce((acc, it, i) => {
      if (i !== idx && parseInt(it.genetica_id) === parseInt(genId)) {
        return acc + (parseFloat(it.gramos) || 0)
      }
      return acc
    }, 0)
    return base - usadoEnOtros
  }

  const sociosActivos = socios.filter((s) => s.activo && !s.es_demo)
  const geneticasActivas = geneticas.filter((g) => g.activa)

  const abrirNuevo = () => {
    setSocioId('')
    setFecha(new Date().toISOString().split('T')[0])
    setItems([{ ...ITEM_VACIO }])
    setModalOpen(true)
  }

  const agregarItem = () => {
    setItems([...items, { genetica_id: '', gramos: '' }])
  }

  const quitarItem = (idx) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== idx))
  }

  const cambiarItem = (idx, campo, valor) => {
    setItems(items.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it)))
  }

  const itemsValidos = items.every((it) => it.genetica_id && parseFloat(it.gramos) > 0)
  const hayItemsRepetidos = (() => {
    const ids = items.map((it) => it.genetica_id).filter(Boolean)
    return new Set(ids).size !== ids.length
  })()
  const stockSuficiente = items.every((it) => {
    const gen = parseInt(it.genetica_id)
    const gr = parseFloat(it.gramos) || 0
    return gr <= (stock[gen] || 0)
  })
  const totalGramos = items.reduce((a, it) => a + (parseFloat(it.gramos) || 0), 0)
  const puedeCrear = socioId && itemsValidos && !hayItemsRepetidos && stockSuficiente

  const crear = async (e) => {
    e.preventDefault()
    if (!puedeCrear) return
    const socio = socios.find((s) => s.id === parseInt(socioId))
    const itemsParaCrear = items.map((it) => ({
      genetica: geneticas.find((g) => g.id === parseInt(it.genetica_id)),
      gramos: parseFloat(it.gramos),
    }))
    await createRetiro({
      socio,
      items: itemsParaCrear,
      fecha: fecha ? new Date(fecha).toISOString() : null,
    })
    setModalOpen(false)
  }

  const eliminar = async (r) => {
    if (!window.confirm(`¿Eliminar este retiro de ${r.socio_nombre}?\nEsto NO se puede deshacer.`)) return
    await deleteRetiro(r.id)
  }

  if (loading) return <p className="text-gray-500">Cargando retiros...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-verde">Retiros 📦</h2>
        <button
          onClick={abrirNuevo}
          className="bg-verde text-white font-semibold px-4 py-2 rounded-lg hover:bg-verde-oscuro transition flex items-center gap-1.5"
        >
          <Plus size={16} /> Nuevo retiro
        </button>
      </div>

      {retiros.length === 0 ? (
        <div className="bg-white rounded-xl border border-crema-oscuro p-5">
          <p className="text-sm text-gray-500">No hay retiros registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-crema-oscuro overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-crema-oscuro bg-crema/50">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Socio</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Fecha</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Lote</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Genéticas</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Total</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crema-oscuro">
              {retiros.map((r) => {
                const totalGr = (r.items || []).reduce((a, it) => a + Number(it.gramos), 0)
                return (
                  <tr key={r.id} className="hover:bg-crema/30 transition">
                    <td className="px-4 py-2.5 font-semibold text-verde">{r.socio_nombre}</td>
                    <td className="px-4 py-2.5 font-sans text-gray-600 text-xs">{fmtFecha(r.fecha)}</td>
                    <td className="px-4 py-2.5 font-sans text-gray-600 text-xs">{r.lote}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {(r.items || []).map((it) => {
                          const { bg, text, border } = colorPorNombre(it.genetica_nombre)
                          return (
                            <span
                              key={it.id}
                              className={`inline-flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-0.5 rounded-full border ${bg} ${text} ${border}`}
                            >
                              {it.genetica_nombre} · <strong>{it.gramos}g</strong>
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-verde font-sans">{totalGr}g</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end">
                        <button
                          onClick={() => eliminar(r)}
                          className="text-red-600 hover:bg-red-50 p-1.5 rounded transition"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-verde">Nuevo Retiro</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={crear} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
                  Socio *
                </label>
                <select
                  required
                  value={socioId}
                  onChange={(e) => setSocioId(e.target.value)}
                  className="form-input"
                >
                  <option value="">Seleccionar socio...</option>
                  {sociosActivos.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.numero} {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
                  Fecha del retiro *
                </label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="border-t border-crema-oscuro pt-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2 font-sans">
                  Genéticas a retirar
                </label>

                <div className="space-y-2">
                  {items.map((it, idx) => {
                    const dispo = stockDisponiblePara(idx, parseInt(it.genetica_id))
                    const gr = parseFloat(it.gramos) || 0
                    const sePasa = gr > 0 && gr > dispo
                    return (
                      <div
                        key={idx}
                        className="bg-crema-suave rounded-lg p-2.5 space-y-2 border border-crema-oscuro"
                      >
                        <div className="flex items-center gap-2">
                          <select
                            value={it.genetica_id}
                            onChange={(e) => cambiarItem(idx, 'genetica_id', e.target.value)}
                            className="form-input flex-1"
                          >
                            <option value="">Seleccionar genética...</option>
                            {geneticasActivas.map((g) => {
                              const s = stockDisponiblePara(idx, g.id)
                              return (
                                <option key={g.id} value={g.id} disabled={s <= 0}>
                                  {g.nombre}{s <= 0 ? ' — sin stock' : ` · ${s}g`}
                                </option>
                              )
                            })}
                          </select>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => quitarItem(idx)}
                              className="text-red-600 hover:bg-red-50 p-1.5 rounded transition flex-shrink-0"
                              title="Quitar"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        <input
                          type="number"
                          step="0.1"
                          value={it.gramos}
                          onChange={(e) => cambiarItem(idx, 'gramos', e.target.value)}
                          className="form-input"
                          placeholder="Gramos"
                        />

                        {it.genetica_id && (
                          <div
                            className={`text-[11px] font-sans font-semibold ${
                              sePasa ? 'text-red-600' : 'text-verde'
                            }`}
                          >
                            {sePasa
                              ? `⚠️ Solo hay ${dispo}g disponibles`
                              : `📦 Disponible: ${dispo}g`}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={agregarItem}
                  className="w-full mt-2 border-2 border-dashed border-verde text-verde font-semibold py-2 rounded-lg hover:bg-verde/5 transition flex items-center justify-center gap-1.5 text-sm"
                >
                  <Plus size={14} /> Agregar otra genética
                </button>
              </div>

              {hayItemsRepetidos && (
                <div className="bg-red-100 border border-red-300 text-red-700 text-xs p-2.5 rounded-lg font-sans">
                  ⚠️ No podés agregar la misma genética dos veces. Sumá los gramos en una sola fila.
                </div>
              )}

              {totalGramos > 0 && (
                <div className="bg-verde-claro border border-verde/30 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-verde">Total a retirar:</span>
                  <span className="text-lg font-bold text-verde">{totalGramos}g</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!puedeCrear}
                className="w-full bg-verde text-white font-semibold py-2.5 rounded-lg hover:bg-verde-oscuro transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Registrar retiro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}