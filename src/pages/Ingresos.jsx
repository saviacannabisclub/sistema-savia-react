import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useIngresos } from '../hooks/useIngresos'
import { useSocios } from '../hooks/useSocios'
import { fmt, fmtFecha, todayISO } from '../lib/format'

const TIPOS = [
  'Cuota social',
  'Donación en efectivo',
  'Donación en especie',
  'Abono especial',
  'Capacitación / Evento',
  'Otro',
]

const FORM_VACIO = {
  tipo: TIPOS[0],
  concepto: '',
  monto: '',
  socio_id: '',
  fecha: todayISO(),
  notas: '',
}

export default function Ingresos() {
  const { ingresos, loading, createIngreso, deleteIngreso } = useIngresos()
  const { socios } = useSocios()

  const [filtro, setFiltro] = useState('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)

  const abrirNuevo = () => {
    setForm({ ...FORM_VACIO, fecha: todayISO() })
    setModalOpen(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.concepto.trim() || !form.monto) return

    const socio = socios.find((s) => s.id === parseInt(form.socio_id))
    await createIngreso({
      ...form,
      socio_id: socio?.id || null,
      socio_nombre: socio?.nombre || null,
    })
    setModalOpen(false)
  }

  const eliminar = async (i) => {
    if (!window.confirm(`¿Eliminar este ingreso?\n${i.concepto} - ${fmt(i.monto)}`)) return
    await deleteIngreso(i.id)
  }

  const filtrados = filtro === 'todos' ? ingresos : ingresos.filter((i) => i.tipo === filtro)
  const total = ingresos.reduce((acc, i) => acc + Number(i.monto), 0)
  const sociosActivos = socios.filter((s) => s.activo && !s.es_demo)

  if (loading) return <p className="text-gray-500">Cargando ingresos...</p>

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold text-verde">Ingresos 💚</h2>
        <button
          onClick={abrirNuevo}
          className="bg-verde text-white font-semibold px-4 py-2 rounded-lg hover:bg-verde-oscuro transition flex items-center gap-1.5"
        >
          <Plus size={16} /> Registrar
        </button>
      </div>

      {/* Total */}
      <div className="bg-white rounded-xl border border-crema-oscuro border-l-4 border-l-verde p-4 mb-3">
        <div className="text-xs text-gray-500 font-sans">Total registrado</div>
        <div className="text-2xl font-bold text-verde">{fmt(total)}</div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['todos', ...TIPOS].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1 rounded-full border text-xs font-sans transition ${
              filtro === f
                ? 'bg-verde text-white border-verde font-bold'
                : 'bg-transparent text-gray-700 border-crema-oscuro hover:border-verde'
            }`}
          >
            {f === 'todos' ? 'Todos' : f}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-crema-oscuro p-5">
          <p className="text-sm text-gray-500">No hay ingresos en esta categoría.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtrados.map((i) => (
            <div
              key={i.id}
              className="bg-white rounded-xl border border-crema-oscuro border-l-4 border-l-verde-medio p-4"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base">{i.concepto}</div>
                  <div className="text-xs text-gray-500 mt-0.5 font-sans">
                    {i.tipo} · {fmtFecha(i.fecha)}
                  </div>
                  {i.socio_nombre && (
                    <div className="text-xs text-gray-600 mt-0.5 font-sans">👤 {i.socio_nombre}</div>
                  )}
                  {i.notas && (
                    <div className="text-xs text-gray-500 mt-0.5 italic font-sans">{i.notas}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="text-xl font-bold text-verde">{fmt(i.monto)}</div>
                  <button
                    onClick={() => eliminar(i)}
                    className="text-red-600 hover:bg-red-50 p-1.5 rounded transition"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
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
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-verde">Registrar Ingreso</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardar} className="space-y-3">
              <Field label="Tipo *">
                <select
                  required
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="form-input"
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>

              <Field label="Concepto / Descripción *">
                <input
                  type="text"
                  required
                  value={form.concepto}
                  onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                  className="form-input"
                  placeholder="ej: Cuota abril - Juan Pérez"
                />
              </Field>

              <Field label="Monto (ARS) *">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  className="form-input"
                  placeholder="ej: 5000"
                />
              </Field>

              <Field label="Socio (opcional)">
                <select
                  value={form.socio_id}
                  onChange={(e) => setForm({ ...form, socio_id: e.target.value })}
                  className="form-input"
                >
                  <option value="">Sin socio asociado</option>
                  {sociosActivos.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.numero} {s.nombre}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Fecha *">
                <input
                  type="date"
                  required
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="form-input"
                />
              </Field>

              <Field label="Notas">
                <input
                  type="text"
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  className="form-input"
                  placeholder="Detalles adicionales"
                />
              </Field>

              <button
                type="submit"
                className="w-full bg-verde text-white font-semibold py-2.5 rounded-lg hover:bg-verde-oscuro transition mt-2"
              >
                Registrar ingreso
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