import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useGeneticas } from '../Hooks/useGeneticas'
import { useCosechas } from '../Hooks/useCosechas'
import { useRetiros } from '../Hooks/useRetiros'
import { stockPorGenetica } from '../lib/calculos'

const TIPOS = ['Indica', 'Sativa', 'Mixta', 'CBD']

export default function Geneticas() {
  const { geneticas, loading, createGenetica, updateGenetica, toggleGenetica, deleteGenetica } = useGeneticas()
  const { cosechas } = useCosechas()
  const { retiros } = useRetiros()

  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', tipo: 'Mixta' })

  const stock = useMemo(
    () => stockPorGenetica(geneticas, cosechas, retiros),
    [geneticas, cosechas, retiros]
  )

  const abrirNueva = () => {
    setEditando(null)
    setForm({ nombre: '', tipo: 'Mixta' })
    setModalOpen(true)
  }

  const abrirEditar = (g) => {
    setEditando(g)
    setForm({ nombre: g.nombre, tipo: g.tipo })
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
    setEditando(null)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    if (editando) {
      await updateGenetica(editando.id, form)
    } else {
      await createGenetica(form)
    }
    cerrarModal()
  }

  const eliminar = async (g) => {
    if (!window.confirm(`¿Eliminar "${g.nombre}"?\nEsto NO se puede deshacer.`)) return
    await deleteGenetica(g.id)
  }

  if (loading) {
    return <p className="text-gray-500">Cargando genéticas...</p>
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-verde">Genéticas 🧬</h2>
        <button
          onClick={abrirNueva}
          className="bg-verde text-white font-semibold px-4 py-2 rounded-lg hover:bg-verde-oscuro transition flex items-center gap-1.5"
        >
          <Plus size={16} /> Agregar
        </button>
      </div>

      {/* Lista */}
      {geneticas.length === 0 ? (
        <div className="bg-white rounded-xl border border-crema-oscuro p-5">
          <p className="text-sm text-gray-500">No hay genéticas cargadas.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {geneticas.map((g) => {
            const stockGr = stock[g.id] || 0
            const colorStock =
              stockGr <= 0   ? 'bg-red-50 text-red-700 border-red-200' :
              stockGr < 10   ? 'bg-ambar/10 text-ambar border-ambar/40' :
                               'bg-verde/10 text-verde border-verde/40'

            return (
              <div
                key={g.id}
                className={`bg-white rounded-xl border border-crema-oscuro p-4 transition ${
                  !g.activa ? 'opacity-60' : ''
                }`}
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-verde">{g.nombre}</div>
                    <div className="text-xs text-gray-500 mt-0.5 font-sans flex items-center gap-2 flex-wrap">
                      <span>{g.tipo}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${colorStock}`}>
                        {stockGr}g disponibles
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-sans font-semibold ${
                        g.activa
                          ? 'bg-verde/10 text-verde border border-verde/40'
                          : 'bg-gray-200 text-gray-500 border border-gray-300'
                      }`}
                    >
                      {g.activa ? 'Activa' : 'Inactiva'}
                    </span>
                    <button
                      onClick={() => abrirEditar(g)}
                      className="text-verde hover:bg-verde/10 p-1.5 rounded transition"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => toggleGenetica(g.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold font-sans transition ${
                        g.activa
                          ? 'border-red-500 text-red-600 hover:bg-red-50'
                          : 'border-verde text-verde hover:bg-verde/10'
                      }`}
                    >
                      {g.activa ? 'Pausar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => eliminar(g)}
                      className="text-red-600 hover:bg-red-50 p-1.5 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
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
              <h3 className="text-lg font-bold text-verde">
                {editando ? 'Editar Genética' : 'Nueva Genética'}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-500 hover:text-gray-800 text-xl leading-none"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="form-input"
                  placeholder="ej: Blue Dream"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
                  Tipo
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="form-input"
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-verde text-white font-semibold py-2.5 rounded-lg hover:bg-verde-oscuro transition"
              >
                {editando ? 'Guardar cambios' : 'Agregar genética'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}