import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useCosechas } from '../Hooks/useCosechas'
import { useGeneticas } from '../Hooks/useGeneticas'
import { fmtFecha, todayISO } from '../lib/format'

const FORM_VACIO = {
  genetica_id: '',
  gramos: '',
  lote: '',
  fecha: todayISO(),
  notas: '',
}

export default function Cosechas() {
  const { cosechas, loading, createCosecha, updateCosecha, deleteCosecha } = useCosechas()
  const { geneticas, loading: loadingGen } = useGeneticas()
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)

  const abrirNueva = () => {
    setEditando(null)
    setForm({ ...FORM_VACIO, fecha: todayISO() })
    setModalOpen(true)
  }

  const abrirEditar = (c) => {
    setEditando(c)
    setForm({
      genetica_id: c.genetica_id || '',
      gramos: c.gramos || '',
      lote: c.lote || '',
      fecha: c.fecha || todayISO(),
      notas: c.notas || '',
    })
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
    setEditando(null)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.genetica_id || !form.gramos) return

    const genetica = geneticas.find((g) => g.id === parseInt(form.genetica_id))
    if (!genetica) return

    const datos = {
      ...form,
      genetica_id: parseInt(form.genetica_id),
      genetica_nombre: genetica.nombre,
    }

    if (editando) {
      await updateCosecha(editando.id, datos)
    } else {
      await createCosecha(datos)
    }
    cerrarModal()
  }

  const eliminar = async (c) => {
    if (!window.confirm(`¿Eliminar esta cosecha de ${c.genetica_nombre} (${c.gramos}g)?\nEsto NO se puede deshacer.`)) return
    await deleteCosecha(c.id)
  }

  if (loading || loadingGen) {
    return <p className="text-gray-500">Cargando cosechas...</p>
  }

  const geneticasActivas = geneticas.filter((g) => g.activa)

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-verde">Cosechas 🌾</h2>
        <button
          onClick={abrirNueva}
          className="bg-verde text-white font-semibold px-4 py-2 rounded-lg hover:bg-verde-oscuro transition flex items-center gap-1.5"
        >
          <Plus size={16} /> Nueva cosecha
        </button>
      </div>

      {/* Tabla */}
      {cosechas.length === 0 ? (
        <div className="bg-white rounded-xl border border-crema-oscuro p-5">
          <p className="text-sm text-gray-500">No hay cosechas registradas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-crema-oscuro overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-crema-oscuro bg-crema/50">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Genética</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Lote</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Fecha</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Notas</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Gramos</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crema-oscuro">
              {cosechas.map((c) => (
                <tr key={c.id} className="hover:bg-crema/30 transition">
                  <td className="px-4 py-2.5 font-semibold text-verde">{c.genetica_nombre}</td>
                  <td className="px-4 py-2.5 font-sans text-gray-600 text-xs">{c.lote}</td>
                  <td className="px-4 py-2.5 font-sans text-gray-600 text-xs">{fmtFecha(c.fecha)}</td>
                  <td className="px-4 py-2.5 font-sans text-gray-400 text-xs italic">{c.notas || '—'}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-verde font-sans">{c.gramos}g</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => abrirEditar(c)}
                        className="text-verde hover:bg-verde/10 p-1.5 rounded transition"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => eliminar(c)}
                        className="text-red-600 hover:bg-red-50 p-1.5 rounded transition"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <h3 className="text-lg font-bold text-verde">
                {editando ? 'Editar Cosecha' : 'Registrar Cosecha'}
              </h3>
              <button onClick={cerrarModal} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardar} className="space-y-3">
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
                  <option value="">Seleccionar...</option>
                  {geneticasActivas.map((g) => (
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </select>
                {geneticasActivas.length === 0 && (
                  <p className="text-xs text-amber-700 mt-1 font-sans">
                    ⚠️ No hay genéticas activas. Agregá una primero.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
                  Gramos cosechados *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={form.gramos}
                  onChange={(e) => setForm({ ...form, gramos: e.target.value })}
                  className="form-input"
                  placeholder="ej: 150"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
                  Número de lote (opcional)
                </label>
                <input
                  type="text"
                  value={form.lote}
                  onChange={(e) => setForm({ ...form, lote: e.target.value })}
                  className="form-input"
                  placeholder="Se genera automáticamente"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
                  Fecha *
                </label>
                <input
                  type="date"
                  required
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
                  Notas
                </label>
                <input
                  type="text"
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  className="form-input"
                  placeholder="Opcional"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-verde text-white font-semibold py-2.5 rounded-lg hover:bg-verde-oscuro transition mt-2"
              >
                {editando ? 'Guardar cambios' : 'Registrar cosecha'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}