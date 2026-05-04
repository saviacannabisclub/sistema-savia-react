import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useCosechas } from '../hooks/useCosechas'
import { useGeneticas } from '../hooks/useGeneticas'
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

      {/* Lista */}
      {cosechas.length === 0 ? (
        <div className="bg-white rounded-xl border border-crema-oscuro p-5">
          <p className="text-sm text-gray-500">No hay cosechas registradas.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {cosechas.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-crema-oscuro border-l-4 border-l-verde-medio p-4"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-verde text-base">{c.genetica_nombre}</div>
                  <div className="text-xs text-gray-600 mt-1 font-sans">
                    Lote: <strong>{c.lote}</strong> · {fmtFecha(c.fecha)}
                  </div>
                  {c.notas && (
                    <div className="text-xs text-gray-500 mt-1 italic font-sans">{c.notas}</div>
                  )}
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <div className="text-2xl font-bold text-verde leading-none">{c.gramos}g</div>
                  <div className="text-[10px] text-gray-500 mb-2 font-sans">cosechados</div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => abrirEditar(c)}
                      className="text-verde hover:bg-verde/10 p-1.5 rounded transition"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => eliminar(c)}
                      className="text-red-600 hover:bg-red-50 p-1.5 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
              <button
                onClick={cerrarModal}
                className="text-gray-500 hover:text-gray-800"
              >
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