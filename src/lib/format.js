// Formato de moneda en pesos argentinos
export const fmt = (n) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n || 0)

// Formato de fecha "DD/MM/YYYY"
export const fmtFecha = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Fecha actual en formato YYYY-MM-DD (para inputs type="date")
export const todayISO = () => new Date().toISOString().split('T')[0]