import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useConfig } from '../Hooks/useConfig'

export default function Ajustes() {
  const { config, loading, updateConfig } = useConfig()

  const [form, setForm] = useState({
    valor_gramo: '',
    banco: '',
    alias: '',
    cvu: '',
    whatsapp: '',
  })
  const [guardando, setGuardando] = useState(false)

  // Sincronizar el form cuando se carga la config
  useEffect(() => {
    if (!loading && config) {
      setForm({
        valor_gramo: config.valor_gramo ?? 10000,
        banco: config.banco ?? 'Mercado Pago',
        alias: config.alias ?? '',
        cvu: config.cvu ?? '',
        whatsapp: config.whatsapp ?? '',
      })
    }
  }, [loading, config])

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    await updateConfig(form)
    setGuardando(false)
  }

  if (loading) {
    return <p className="text-gray-500">Cargando configuración...</p>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-verde mb-4">Configuración ⚙️</h2>

      <form onSubmit={guardar} className="space-y-3">
        {/* Parámetros de cálculo */}
        <div className="bg-white rounded-xl border border-crema-oscuro p-5">
          <h3 className="text-base font-bold text-verde mb-3">Parámetros de cálculo</h3>

          <Field label="Valor por gramo (ARS)">
            <input
              type="number"
              step="0.01"
              required
              value={form.valor_gramo}
              onChange={(e) => setForm({ ...form, valor_gramo: e.target.value })}
              className="form-input"
            />
          </Field>

          <p className="text-xs text-gray-500 mt-2 font-sans">
            Este valor se usa para calcular el aporte de cada retiro.
          </p>
        </div>

        {/* Datos de transferencia */}
        <div className="bg-white rounded-xl border border-crema-oscuro p-5">
          <h3 className="text-base font-bold text-verde mb-3">Datos de transferencia</h3>

          <Field label="Banco / Billetera">
            <input
              type="text"
              value={form.banco}
              onChange={(e) => setForm({ ...form, banco: e.target.value })}
              className="form-input"
              placeholder="ej: Mercado Pago"
            />
          </Field>

          <Field label="Alias">
            <input
              type="text"
              value={form.alias}
              onChange={(e) => setForm({ ...form, alias: e.target.value })}
              className="form-input"
              placeholder="ej: savia.cannabis"
            />
          </Field>

          <Field label="CVU">
            <input
              type="text"
              value={form.cvu}
              onChange={(e) => setForm({ ...form, cvu: e.target.value })}
              className="form-input"
              placeholder="22 dígitos"
            />
          </Field>
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-xl border border-crema-oscuro p-5">
          <h3 className="text-base font-bold text-verde mb-3">WhatsApp de la asociación</h3>

          <Field label="Número (con código de país)">
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="form-input"
              placeholder="ej: 543434000000"
            />
          </Field>

          <p className="text-xs text-gray-500 mt-2 font-sans">
            Formato: 54 + código de área (sin 0) + número, sin espacios ni guiones.
          </p>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-verde text-white font-semibold py-3 rounded-lg hover:bg-verde-oscuro transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {guardando ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 font-sans">
        {label}
      </label>
      {children}
    </div>
  )
}