import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { siguienteNumeroSocio } from '../lib/calculos'
import toast from 'react-hot-toast'

export function useSocios() {
  const [socios, setSocios] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSocios = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('socios')
      .select('*')
      .order('numero', { ascending: true })

    if (error) {
      toast.error('Error al cargar socios')
      console.error(error)
    } else {
      setSocios(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSocios()
  }, [fetchSocios])

  const createSocio = async (datos) => {
    const numero = siguienteNumeroSocio(socios)
    const { data, error } = await supabase
      .from('socios')
      .insert([{
        numero,
        nombre: datos.nombre,
        dni: datos.dni || '',
        reprocann: datos.reprocann || '',
        tel: datos.tel || '',
        direccion: datos.direccion || '',
        costo_envio: parseFloat(datos.costo_envio) || 0,
        activo: true,
        es_demo: false,
      }])
      .select()
      .single()

    if (error) {
      toast.error('Error al crear socio')
      console.error(error)
      return null
    }
    toast.success('Socio agregado')
    setSocios((prev) => [...prev, data])
    return data
  }

  const updateSocio = async (id, datos) => {
    const { data, error } = await supabase
      .from('socios')
      .update({
        nombre: datos.nombre,
        dni: datos.dni || '',
        reprocann: datos.reprocann || '',
        tel: datos.tel || '',
        direccion: datos.direccion || '',
        costo_envio: parseFloat(datos.costo_envio) || 0,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      toast.error('Error al actualizar')
      return null
    }
    toast.success('Cambios guardados')
    setSocios((prev) => prev.map((s) => (s.id === id ? data : s)))
    return data
  }

  const toggleSocio = async (id) => {
    const s = socios.find((x) => x.id === id)
    if (!s) return
    const { data, error } = await supabase
      .from('socios')
      .update({ activo: !s.activo })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      toast.error('Error al actualizar estado')
      return null
    }
    toast.success(s.activo ? 'Socio pausado' : 'Socio activado')
    setSocios((prev) => prev.map((x) => (x.id === id ? data : x)))
    return data
  }

  const deleteSocio = async (id) => {
    const { error } = await supabase.from('socios').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar')
      return false
    }
    toast.success('Socio eliminado')
    setSocios((prev) => prev.filter((s) => s.id !== id))
    return true
  }

  return {
    socios,
    loading,
    refetch: fetchSocios,
    createSocio,
    updateSocio,
    toggleSocio,
    deleteSocio,
  }
}