import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const CONFIG_DEFAULT = {
  alias: '',
  cvu: '',
  whatsapp: '',
  banco: 'Mercado Pago',
  valor_gramo: 10000,
}

export function useConfig() {
  const [config, setConfig] = useState(CONFIG_DEFAULT)
  const [loading, setLoading] = useState(true)

  const fetchConfig = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error al cargar config:', error)
    } else if (data) {
      setConfig(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const updateConfig = async (datos) => {
    if (!config.id) {
      // Si no existe, crearla
      const { data, error } = await supabase
        .from('config')
        .insert([{
          alias: datos.alias || '',
          cvu: datos.cvu || '',
          whatsapp: datos.whatsapp || '',
          banco: datos.banco || 'Mercado Pago',
          valor_gramo: parseFloat(datos.valor_gramo) || 10000,
        }])
        .select()
        .single()

      if (error) {
        toast.error('Error al guardar configuración')
        return null
      }
      toast.success('Configuración guardada')
      setConfig(data)
      return data
    }

    // Actualizar la existente
    const { data, error } = await supabase
      .from('config')
      .update({
        alias: datos.alias || '',
        cvu: datos.cvu || '',
        whatsapp: datos.whatsapp || '',
        banco: datos.banco || 'Mercado Pago',
        valor_gramo: parseFloat(datos.valor_gramo) || 10000,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id)
      .select()
      .single()

    if (error) {
      toast.error('Error al actualizar')
      return null
    }
    toast.success('Configuración actualizada')
    setConfig(data)
    return data
  }

  return {
    config,
    loading,
    refetch: fetchConfig,
    updateConfig,
    valorGramo: parseFloat(config.valor_gramo) || 10000,
  }
}