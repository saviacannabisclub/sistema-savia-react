import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useGeneticas() {
  const [geneticas, setGeneticas] = useState([])
  const [loading, setLoading] = useState(true)

  // Cargar genéticas desde Supabase
  const fetchGeneticas = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('geneticas')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) {
      toast.error('Error al cargar genéticas')
      console.error(error)
    } else {
      setGeneticas(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGeneticas()
  }, [fetchGeneticas])

  // Crear nueva genética
  const createGenetica = async (datos) => {
    const { data, error } = await supabase
      .from('geneticas')
      .insert([{ ...datos, activa: true }])
      .select()
      .single()

    if (error) {
      toast.error('Error al crear genética')
      return null
    }
    toast.success('Genética agregada')
    setGeneticas((prev) => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    return data
  }

  // Actualizar genética existente
  const updateGenetica = async (id, datos) => {
    const { data, error } = await supabase
      .from('geneticas')
      .update(datos)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      toast.error('Error al actualizar')
      return null
    }
    toast.success('Cambios guardados')
    setGeneticas((prev) =>
      prev.map((g) => (g.id === id ? data : g)).sort((a, b) => a.nombre.localeCompare(b.nombre))
    )
    return data
  }

  // Activar / pausar
  const toggleGenetica = async (id) => {
    const g = geneticas.find((x) => x.id === id)
    if (!g) return
    return updateGenetica(id, { activa: !g.activa })
  }

  // Eliminar genética
  const deleteGenetica = async (id) => {
    const { error } = await supabase.from('geneticas').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar')
      return false
    }
    toast.success('Genética eliminada')
    setGeneticas((prev) => prev.filter((g) => g.id !== id))
    return true
  }

  return {
    geneticas,
    loading,
    refetch: fetchGeneticas,
    createGenetica,
    updateGenetica,
    toggleGenetica,
    deleteGenetica,
  }
}