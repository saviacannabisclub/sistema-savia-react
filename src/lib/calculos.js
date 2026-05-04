// Constante: porcentaje de gestión sobre el material
export const GESTION_PCT = 0.02

/**
 * Calcula el aporte total de un retiro.
 * @param {number} gramos - Gramos a retirar
 * @param {number} valorGramo - Valor por gramo (ARS)
 * @param {number} envio - Costo de envío del socio (ARS)
 * @returns {object} { base, gestion, envio, total }
 */
export function calcularAporte(gramos, valorGramo, envio = 0) {
  const base = (gramos || 0) * (valorGramo || 0)
  const gestion = Math.round(base * GESTION_PCT)
  const envioNum = envio || 0
  return {
    base,
    gestion,
    envio: envioNum,
    total: base + gestion + envioNum,
  }
}

/**
 * Calcula el stock disponible por genética.
 * @param {Array} geneticas - Lista de genéticas
 * @param {Array} cosechas - Lista de cosechas
 * @param {Array} retiros - Lista de retiros
 * @returns {Object} Mapa { geneticaId: gramos }
 */
export function stockPorGenetica(geneticas, cosechas, retiros) {
  const stock = {}
  geneticas.forEach((g) => (stock[g.id] = 0))

  cosechas.forEach((c) => {
    if (stock[c.genetica_id] !== undefined) {
      stock[c.genetica_id] += Number(c.gramos) || 0
    }
  })

  retiros
    .filter((r) => r.estado !== 'cancelado')
    .forEach((r) => {
      if (stock[r.genetica_id] !== undefined) {
        stock[r.genetica_id] -= Number(r.gramos) || 0
      }
    })

  return stock
}

/**
 * Genera el siguiente número de socio (formato '001', '002'...).
 */
export function siguienteNumeroSocio(socios) {
  const nums = socios.map((s) => parseInt(s.numero) || 0)
  const max = nums.length ? Math.max(...nums) : 0
  return String(max + 1).padStart(3, '0')
}

/**
 * Genera un número de lote único basado en timestamp.
 */
export function generarLote(prefijo = 'L') {
  return `${prefijo}${Date.now().toString().slice(-6)}`
}