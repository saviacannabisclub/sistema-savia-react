import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useEgresos() {
  const [egresos, setEgresos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEgresos = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('egresos')
      .select('*')
      .order('fecha', { ascending: false })

    if (error) {
      toast.error('Error al cargar egresos')
      console.error(error)
    } else {
      setEgresos(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEgresos()
  }, [fetchEgresos])

  const createEgreso = async (datos) => {
    const { data, error } = await supabase
      .from('egresos')
      .insert([{
        tipo: datos.tipo,
        concepto: datos.concepto.trim(),
        monto: parseFloat(datos.monto),
        responsable: datos.responsable?.trim() || null,
        comprobante: datos.comprobante?.trim() || null,
        fecha: datos.fecha,
        notas: datos.notas?.trim() || null,
      }])
      .select()
      .single()

    if (error) {
      toast.error('Error al crear egreso')
      console.error(error)
      return null
    }
    toast.success('Egreso registrado')
    setEgresos((prev) => [data, ...prev])
    return data
  }

  const deleteEgreso = async (id) => {
    const { error } = await supabase.from('egresos').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar')
      return false
    }
    toast.success('Egreso eliminado')
    setEgresos((prev) => prev.filter((e) => e.id !== id))
    return true
  }

  return {
    egresos,
    loading,
    refetch: fetchEgresos,
    createEgreso,
    deleteEgreso,
  }
}