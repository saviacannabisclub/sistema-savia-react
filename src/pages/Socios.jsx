import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useSocios } from '../Hooks/useSocios'
import { siguienteNumeroSocio } from '../lib/calculos'

const FORM_VACIO = {
  nombre: '',
  dni: '',
  reprocann: '',
  tel: '',
  direccion: '',
}

export default function Socios() {
  const { socios, loading, createSocio, updateSocio, toggleSocio, deleteSocio } = useSocios()
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)

  const abrirNuevo = () => {
    setEditando(null)
    setForm(FORM_VACIO)
    setModalOpen(true)
  }

  const abrirEditar = (s) => {
    setEditando(s)
    setForm({
      nombre: s.nombre || '',
      dni: s.dni || '',
      reprocann: s.reprocann || '',
      tel: s.tel || '',
      direccion: s.direccion || '',
    })
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
    setEditando(null)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.reprocann.trim()) return
    if (editando) {
      await updateSocio(editando.id, form)
    } else {
      await createSocio(form)
    }
    cerrarModal()
  }

  const eliminar = async (s) => {
    if (!window.confirm(`¿Eliminar al socio "${s.nombre}"?\nEsto NO se puede deshacer.`)) return
    await deleteSocio(s.id)
  }

  if (loading) return <p className="text-gray-500">Cargando socios...</p>

  const socios_filtrados = socios.filter((s) => !s.es_demo)
  const proximoNumero = siguienteNumeroSocio(socios)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-verde">Socios 👥</h2>
        <button
          onClick={abrirNuevo}
          className="bg-verde text-white font-semibold px-4 py-2 rounded-lg hover:bg-verde-oscuro transition flex items-center gap-1.5"
        >
          <Plus size={16} /> Agregar
        </button>
      </div>

      {socios_filtrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-crema-oscuro p-5">
          <p className="text-sm text-gray-500">No hay socios cargados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-crema-oscuro overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-crema-oscuro bg-crema/50">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">#</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Nombre</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Estado</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">DNI</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">REPROCANN</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Dirección</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans px-4 py-2.5">Teléfono</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crema-oscuro">
              {socios_filtrados.map((s) => (
                <tr key={s.id} className={`hover:bg-crema/30 transition ${!s.activo ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-2.5 text-xs text-gray-500 font-sans font-semibold">{s.numero || '—'}</td>
                  <td className="px-4 py-2.5 font-semibold text-verde whitespace-nowrap">{s.nombre}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-sans font-semibold border ${
                      s.activo
                        ? 'bg-verde/10 text-verde border-verde/40'
                        : 'bg-gray-200 text-gray-500 border-gray-300'
                    }`}>
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-600 font-sans">{s.dni || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-600 font-sans">{s.reprocann || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-600 font-sans">{s.direccion || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-600 font-sans">{s.tel || '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => abrirEditar(s)}
                        className="text-verde hover:bg-verde/10 p-1.5 rounded transition"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => toggleSocio(s.id)}
                        className={`text-[11px] px-2 py-1 rounded-lg border font-semibold font-sans transition ${
                          s.activo
                            ? 'border-red-400 text-red-600 hover:bg-red-50'
                            : 'border-verde text-verde hover:bg-verde/10'
                        }`}
                      >
                        {s.activo ? 'Pausar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => eliminar(s)}
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
                {editando ? 'Editar Socio' : 'Nuevo Socio'}
              </h3>
              <button onClick={cerrarModal} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            {!editando && (
              <div className="bg-verde-claro rounded-lg px-3 py-2 text-xs text-verde-oscuro font-sans mb-4">
                Se asignará el número <strong>#{proximoNumero}</strong> automáticamente.
              </div>
            )}

            <form onSubmit={guardar} className="space-y-3">
              <Field label="Nombre completo *">
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="form-input"
                  autoFocus
                />
              </Field>

              <Field label="DNI">
                <input
                  type="text"
                  value={form.dni}
                  onChange={(e) => setForm({ ...form, dni: e.target.value })}
                  className="form-input"
                />
              </Field>

              <Field label="REPROCANN (Código de vinculación) *">
                <input
                  type="text"
                  required
                  value={form.reprocann}
                  onChange={(e) => setForm({ ...form, reprocann: e.target.value })}
                  className="form-input"
                />
              </Field>

              <Field label="Teléfono WhatsApp">
                <input
                  type="text"
                  value={form.tel}
                  onChange={(e) => setForm({ ...form, tel: e.target.value })}
                  className="form-input"
                  placeholder="ej: 3434123456"
                />
              </Field>

              <Field label="Dirección de entrega">
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  className="form-input"
                />
              </Field>

              <button
                type="submit"
                className="w-full bg-verde text-white font-semibold py-2.5 rounded-lg hover:bg-verde-oscuro transition mt-2"
              >
                {editando ? 'Guardar cambios' : 'Agregar socio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
        {label}
      </label>
      {children}
    </div>
  )
}