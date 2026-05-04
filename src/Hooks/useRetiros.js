import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { calcularAporte, generarLote } from '../lib/calculos'
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

  const createRetiro = async ({ socio, genetica, gramos, valorGramo }) => {
    const aporte = calcularAporte(gramos, valorGramo, socio.costo_envio)

    const { data, error } = await supabase
      .from('retiros')
      .insert([{
        fecha: new Date().toISOString(),
        estado: 'pendiente',
        socio_id: socio.id,
        socio_nombre: socio.nombre,
        socio_numero: socio.numero,
        socio_tel: socio.tel,
        socio_direccion: socio.direccion,
        genetica_id: genetica.id,
        genetica_nombre: genetica.nombre,
        gramos: parseFloat(gramos),
        aporte_base: aporte.base,
        aporte_envio: aporte.envio,
        aporte_total: aporte.total,
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

  const confirmarRetiro = async (id) => {
    const { data, error } = await supabase
      .from('retiros')
      .update({
        estado: 'confirmado',
        fecha_confirmacion: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      toast.error('Error al confirmar retiro')
      return null
    }
    toast.success('Retiro confirmado')
    setRetiros((prev) => prev.map((r) => (r.id === id ? data : r)))
    return data
  }

  const cancelarRetiro = async (id) => {
    const { data, error } = await supabase
      .from('retiros')
      .update({ estado: 'cancelado' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      toast.error('Error al cancelar')
      return null
    }
    toast.success('Retiro cancelado')
    setRetiros((prev) => prev.map((r) => (r.id === id ? data : r)))
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
    confirmarRetiro,
    cancelarRetiro,
    deleteRetiro,
  }
}