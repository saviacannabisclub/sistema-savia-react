import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useSocios } from '../hooks/useSocios'
import { siguienteNumeroSocio } from '../lib/calculos'
import { fmt } from '../lib/format'

const FORM_VACIO = {
  nombre: '',
  dni: '',
  reprocann: '',
  tel: '',
  direccion: '',
  costo_envio: '',
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
      costo_envio: s.costo_envio || '',
    })
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
    setEditando(null)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.reprocann.trim()) {
      return
    }
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

  if (loading) {
    return <p className="text-gray-500">Cargando socios...</p>
  }

  // Ocultar el socio demo si existe
  const socios_filtrados = socios.filter((s) => !s.es_demo)
  const proximoNumero = siguienteNumeroSocio(socios)

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-verde">Socios 👥</h2>
        <button
          onClick={abrirNuevo}
          className="bg-verde text-white font-semibold px-4 py-2 rounded-lg hover:bg-verde-oscuro transition flex items-center gap-1.5"
        >
          <Plus size={16} /> Agregar
        </button>
      </div>

      {/* Lista */}
      {socios_filtrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-crema-oscuro p-5">
          <p className="text-sm text-gray-500">No hay socios cargados.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {socios_filtrados.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-xl border border-crema-oscuro p-4 transition ${
                !s.activo ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-verde">{s.nombre}</span>
                    <span className="text-xs text-gray-500 font-sans">#{s.numero || '000'}</span>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-sans font-semibold ${
                        s.activo
                          ? 'bg-verde/10 text-verde border border-verde/40'
                          : 'bg-gray-200 text-gray-500 border border-gray-300'
                      }`}
                    >
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-0.5 font-sans">
                    {s.dni && <div>DNI: <span className="font-semibold">{s.dni}</span></div>}
                    {s.reprocann && (
                      <div>REPROCANN: <span className="font-semibold">{s.reprocann}</span></div>
                    )}
                    {s.direccion && <div>📍 {s.direccion}</div>}
                    {s.tel && <div>📱 {s.tel}</div>}
                    <div>
                      Envío: <span className="font-semibold">{fmt(s.costo_envio)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => abrirEditar(s)}
                    className="text-verde hover:bg-verde/10 px-2 py-1 rounded transition flex items-center gap-1 text-xs font-sans"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    onClick={() => toggleSocio(s.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold font-sans transition ${
                      s.activo
                        ? 'border-red-500 text-red-600 hover:bg-red-50'
                        : 'border-verde text-verde hover:bg-verde/10'
                    }`}
                  >
                    {s.activo ? 'Pausar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => eliminar(s)}
                    className="text-red-600 hover:bg-red-50 px-2 py-1 rounded transition flex items-center gap-1 text-xs font-sans"
                  >
                    <Trash2 size={13} /> Eliminar
                  </button>
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
                {editando ? 'Editar Socio' : 'Nuevo Socio'}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-500 hover:text-gray-800 text-xl leading-none"
              >
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

              <Field label="Costo de envío (ARS)">
                <input
                  type="number"
                  value={form.costo_envio}
                  onChange={(e) => setForm({ ...form, costo_envio: e.target.value })}
                  className="form-input"
                  placeholder="ej: 3000"
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

// Componente helper para el formulario
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