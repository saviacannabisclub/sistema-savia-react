import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { generarLote } from '../lib/calculos'
import toast from 'react-hot-toast'

export function useRetiros() {
  const [retiros, setRetiros] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRetiros = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('retiros')
      .select('*')
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

  const createRetiro = async ({ socio, genetica, gramos }) => {
    const { data, error } = await supabase
      .from('retiros')
      .insert([{
        fecha: new Date().toISOString(),
        socio_id: socio.id,
        socio_nombre: socio.nombre,
        socio_numero: socio.numero,
        genetica_id: genetica.id,
        genetica_nombre: genetica.nombre,
        gramos: parseFloat(gramos),
        lote: generarLote('R'),
      }])
      .select()
      .single()

    if (error) {
      toast.error('Error al crear retiro')
      console.error(error)
      return null
    }
    toast.success('Retiro registrado')
    setRetiros((prev) => [data, ...prev])
    return data
  }

  const deleteRetiro = async (id) => {
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