import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useEgresos } from '../hooks/useEgresos'
import { fmt, fmtFecha, todayISO } from '../lib/format'

const TIPOS = [
  'Insumos de cultivo',
  'Insumos de elaboración',
  'Alquiler / Sede',
  'Servicios',
  'Personal / Honorarios',
  'Gastos administrativos',
  'Retiro de fondos',
  'Otro',
]

const FORM_VACIO = {
  tipo: TIPOS[0],
  concepto: '',
  monto: '',
  responsable: '',
  comprobante: '',
  fecha: todayISO(),
  notas: '',
}

export default function Egresos() {
  const { egresos, loading, createEgreso, deleteEgreso } = useEgresos()

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
    await createEgreso(form)
    setModalOpen(false)
  }

  const eliminar = async (eg) => {
    if (!window.confirm(`¿Eliminar este egreso?\n${eg.concepto} - ${fmt(eg.monto)}`)) return
    await deleteEgreso(eg.id)
  }

  const filtrados = filtro === 'todos' ? egresos : egresos.filter((e) => e.tipo === filtro)
  const total = egresos.reduce((acc, e) => acc + Number(e.monto), 0)

  if (loading) return <p className="text-gray-500">Cargando egresos...</p>

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold text-verde">Egresos 💸</h2>
        <button
          onClick={abrirNuevo}
          className="bg-verde text-white font-semibold px-4 py-2 rounded-lg hover:bg-verde-oscuro transition flex items-center gap-1.5"
        >
          <Plus size={16} /> Registrar
        </button>
      </div>

      {/* Total */}
      <div className="bg-white rounded-xl border border-crema-oscuro border-l-4 border-l-red-500 p-4 mb-3">
        <div className="text-xs text-gray-500 font-sans">Total registrado</div>
        <div className="text-2xl font-bold text-red-600">-{fmt(total)}</div>
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
          <p className="text-sm text-gray-500">No hay egresos en esta categoría.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtrados.map((eg) => (
            <div
              key={eg.id}
              className="bg-white rounded-xl border border-crema-oscuro border-l-4 border-l-red-500 p-4"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base">{eg.concepto}</div>
                  <div className="text-xs text-gray-500 mt-0.5 font-sans">
                    {eg.tipo} · {fmtFecha(eg.fecha)}
                  </div>
                  {eg.responsable && (
                    <div className="text-xs text-gray-600 mt-0.5 font-sans">👤 {eg.responsable}</div>
                  )}
                  {eg.comprobante && (
                    <div className="text-xs text-verde mt-0.5 font-sans">📄 N°: {eg.comprobante}</div>
                  )}
                  {eg.notas && (
                    <div className="text-xs text-gray-500 mt-0.5 italic font-sans">{eg.notas}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="text-xl font-bold text-red-600">-{fmt(eg.monto)}</div>
                  <button
                    onClick={() => eliminar(eg)}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-verde">Registrar Egreso</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-xs font-sans">
              <div className="text-red-700 font-semibold">📋 Para mayor trazabilidad</div>
              <div className="text-gray-600 mt-1">
                Completá responsable y N° de comprobante siempre que tengas la info.
              </div>
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

              <Field label="Concepto / Descripción detallada *">
                <input
                  type="text"
                  required
                  value={form.concepto}
                  onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                  className="form-input"
                  placeholder="ej: Compra nutrientes marzo - Growshop X"
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
                  placeholder="ej: 15000"
                />
              </Field>

              <Field label="Responsable">
                <input
                  type="text"
                  value={form.responsable}
                  onChange={(e) => setForm({ ...form, responsable: e.target.value })}
                  className="form-input"
                  placeholder="Quien pagó o retiró"
                />
              </Field>

              <Field label="N° comprobante">
                <input
                  type="text"
                  value={form.comprobante}
                  onChange={(e) => setForm({ ...form, comprobante: e.target.value })}
                  className="form-input"
                  placeholder="Factura, ticket, recibo"
                />
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

              <Field label="Notas adicionales">
                <input
                  type="text"
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  className="form-input"
                  placeholder="Proveedor, destino, detalle"
                />
              </Field>

              <button
                type="submit"
                className="w-full bg-verde text-white font-semibold py-2.5 rounded-lg hover:bg-verde-oscuro transition mt-2"
              >
                Registrar egreso
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