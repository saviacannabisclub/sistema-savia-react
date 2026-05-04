import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { generarLote } from '../lib/calculos'
import toast from 'react-hot-toast'

export function useCosechas() {
  const [cosechas, setCosechas] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCosechas = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('cosechas')
      .select('*')
      .order('fecha', { ascending: false })

    if (error) {
      toast.error('Error al cargar cosechas')
      console.error(error)
    } else {
      setCosechas(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCosechas()
  }, [fetchCosechas])

  const createCosecha = async ({ genetica_id, genetica_nombre, gramos, lote, fecha, notas }) => {
    const { data, error } = await supabase
      .from('cosechas')
      .insert([{
        genetica_id,
        genetica_nombre,
        gramos: parseFloat(gramos),
        lote: lote?.trim() || generarLote('L'),
        fecha,
        notas: notas?.trim() || null,
      }])
      .select()
      .single()

    if (error) {
      toast.error('Error al crear cosecha')
      console.error(error)
      return null
    }
    toast.success('Cosecha registrada')
    setCosechas((prev) => [data, ...prev])
    return data
  }

  const updateCosecha = async (id, datos) => {
    const { data, error } = await supabase
      .from('cosechas')
      .update({
        genetica_id: datos.genetica_id,
        genetica_nombre: datos.genetica_nombre,
        gramos: parseFloat(datos.gramos),
        lote: datos.lote?.trim() || generarLote('L'),
        fecha: datos.fecha,
        notas: datos.notas?.trim() || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      toast.error('Error al actualizar')
      return null
    }
    toast.success('Cambios guardados')
    setCosechas((prev) => prev.map((c) => (c.id === id ? data : c)))
    return data
  }

  const deleteCosecha = async (id) => {
    const { error } = await supabase.from('cosechas').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar')
      return false
    }
    toast.success('Cosecha eliminada')
    setCosechas((prev) => prev.filter((c) => c.id !== id))
    return true
  }

  return {
    cosechas,
    loading,
    refetch: fetchCosechas,
    createCosecha,
    updateCosecha,
    deleteCosecha,
  }
}