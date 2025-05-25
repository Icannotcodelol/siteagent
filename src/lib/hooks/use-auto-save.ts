import { useState, useEffect, useMemo, useCallback } from 'react'
import { debounce } from 'lodash'

export interface AutoSaveOptions {
  delay?: number
  enabled?: boolean
}

export interface AutoSaveReturn {
  isSaving: boolean
  lastSaved: Date | null
  error: string | null
  forceSave: () => Promise<void>
}

export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  options: AutoSaveOptions = {}
): AutoSaveReturn {
  const { delay = 2000, enabled = true } = options
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback(async (dataToSave: T) => {
    if (!enabled) return
    
    setIsSaving(true)
    setError(null)
    
    try {
      await saveFunction(dataToSave)
      setLastSaved(new Date())
    } catch (err: any) {
      console.error('Auto-save failed:', err)
      setError(err.message || 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }, [saveFunction, enabled])

  const debouncedSave = useMemo(
    () => debounce(save, delay),
    [save, delay]
  )

  const forceSave = useCallback(async () => {
    debouncedSave.cancel()
    await save(data)
  }, [save, data, debouncedSave])

  useEffect(() => {
    if (enabled && data) {
      debouncedSave(data)
    }
    
    return () => {
      debouncedSave.cancel()
    }
  }, [data, debouncedSave, enabled])

  return { isSaving, lastSaved, error, forceSave }
} 