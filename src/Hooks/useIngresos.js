import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useIngresos() {
  const [ingresos, setIngresos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchIngresos = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('ingresos')
      .select('*')
      .order('fecha', { ascending: false })

    if (error) {
      toast.error('Error al cargar ingresos')
      console.error(error)
    } else {
      setIngresos(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchIngresos()
  }, [fetchIngresos])

  const createIngreso = async (datos) => {
    const { data, error } = await supabase
      .from('ingresos')
      .insert([{
        tipo: datos.tipo,
        concepto: datos.concepto.trim(),
        monto: parseFloat(datos.monto),
        socio_id: datos.socio_id || null,
        socio_nombre: datos.socio_nombre || null,
        fecha: datos.fecha,
        notas: datos.notas?.trim() || null,
      }])
      .select()
      .single()

    if (error) {
      toast.error('Error al crear ingreso')
      console.error(error)
      return null
    }
    toast.success('Ingreso registrado')
    setIngresos((prev) => [data, ...prev])
    return data
  }

  const deleteIngreso = async (id) => {
    const { error } = await supabase.from('ingresos').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar')
      return false
    }
    toast.success('Ingreso eliminado')
    setIngresos((prev) => prev.filter((i) => i.id !== id))
    return true
  }

  return {
    ingresos,
    loading,
    refetch: fetchIngresos,
    createIngreso,
    deleteIngreso,
  }
}