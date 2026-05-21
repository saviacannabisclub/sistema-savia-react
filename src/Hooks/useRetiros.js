import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { generarLote } from '../lib/calculos'
import toast from 'react-hot-toast'

export function useRetiros() {
  const [retiros, setRetiros] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRetiros = useCallback(async () => {
    setLoading(true)
    // Traemos retiros + sus items en una sola query (JOIN)
    const { data, error } = await supabase
      .from('retiros')
      .select('*, items:retiros_items(*)')
      .order('fecha', { ascending: false })

    if (error) {
      toast.error('Error al cargar retiros')
      console.error(error)
    } else {
      setRetiros(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRetiros()
  }, [fetchRetiros])

  /**
   * Crea un retiro con múltiples genéticas.
   * @param {object} socio - El socio que retira
   * @param {Array} items - Array de { genetica, gramos }
   */
  const createRetiro = async ({ socio, items }) => {
    if (!items || items.length === 0) {
      toast.error('Agregá al menos una genética')
      return null
    }

    // 1. Crear el encabezado del retiro
    const { data: retiro, error: errRetiro } = await supabase
      .from('retiros')
      .insert([{
        fecha: new Date().toISOString(),
        socio_id: socio.id,
        socio_nombre: socio.nombre,
        socio_numero: socio.numero,
        lote: generarLote('R'),
      }])
      .select()
      .single()

    if (errRetiro) {
      toast.error('Error al crear retiro')
      console.error(errRetiro)
      return null
    }

    // 2. Crear los items relacionados
    const itemsRows = items.map((it) => ({
      retiro_id: retiro.id,
      genetica_id: it.genetica.id,
      genetica_nombre: it.genetica.nombre,
      gramos: parseFloat(it.gramos),
    }))

    const { data: itemsCreados, error: errItems } = await supabase
      .from('retiros_items')
      .insert(itemsRows)
      .select()

    if (errItems) {
      // Si falla la creación de items, borramos el retiro para no dejar registros huérfanos
      await supabase.from('retiros').delete().eq('id', retiro.id)
      toast.error('Error al crear items del retiro')
      console.error(errItems)
      return null
    }

    toast.success('Retiro registrado')
    const retiroCompleto = { ...retiro, items: itemsCreados }
    setRetiros((prev) => [retiroCompleto, ...prev])
    return retiroCompleto
  }

  const deleteRetiro = async (id) => {
    // Los items se borran automáticamente por el ON DELETE CASCADE
    const { error } = await supabase.from('retiros').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar')
      return false
    }
    toast.success('Retiro eliminado')
    setRetiros((prev) => prev.filter((r) => r.id !== id))
    return true
  }

  return {
    retiros,
    loading,
    refetch: fetchRetiros,
    createRetiro,
    deleteRetiro,
  }
}