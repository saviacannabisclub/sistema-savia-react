/**
 * Calcula el stock disponible por genética.
 * Convertimos los IDs a Number para evitar problemas de tipo string/number.
 */
export function stockPorGenetica(geneticas, cosechas, retiros) {
  const stock = {}
  geneticas.forEach((g) => {
    stock[Number(g.id)] = 0
  })

  cosechas.forEach((c) => {
    const id = Number(c.genetica_id)
    if (stock[id] !== undefined) {
      stock[id] += Number(c.gramos) || 0
    }
  })

  retiros.forEach((r) => {
    const items = r.items || []
    items.forEach((item) => {
      const id = Number(item.genetica_id)
      if (stock[id] !== undefined) {
        stock[id] -= Number(item.gramos) || 0
      }
    })
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