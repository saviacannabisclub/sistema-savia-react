/**
 * Calcula el stock disponible por genética.
 */
export function stockPorGenetica(geneticas, cosechas, retiros) {
  const stock = {}
  geneticas.forEach((g) => (stock[g.id] = 0))

  cosechas.forEach((c) => {
    if (stock[c.genetica_id] !== undefined) {
      stock[c.genetica_id] += Number(c.gramos) || 0
    }
  })

  retiros.forEach((r) => {
    if (stock[r.genetica_id] !== undefined) {
      stock[r.genetica_id] -= Number(r.gramos) || 0
    }
  })

  return stock
}

/**
 * Genera el siguiente número de socio.
 */
export function siguienteNumeroSocio(socios) {
  const nums = socios.map((s) => parseInt(s.numero) || 0)
  const max = nums.length ? Math.max(...nums) : 0
  return String(max + 1).padStart(3, '0')
}

/**
 * Genera un número de lote único.
 */
export function generarLote(prefijo = 'L') {
  return `${prefijo}${Date.now().toString().slice(-6)}`
}