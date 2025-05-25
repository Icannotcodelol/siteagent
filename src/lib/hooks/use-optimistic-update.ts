import { useState, useCallback } from 'react'

export interface OptimisticUpdateOptions<T> {
  onError?: (error: Error, item: T) => void
  onSuccess?: (result: T, originalItem: T) => void
}

export interface OptimisticUpdateReturn<T> {
  data: T[]
  pendingUpdates: Set<string>
  optimisticUpdate: (id: string, updates: Partial<T>, updateFn: (item: T) => Promise<T>) => Promise<void>
  optimisticAdd: (tempItem: T, addFn: () => Promise<T>) => Promise<void>
  optimisticRemove: (id: string, removeFn: (id: string) => Promise<void>) => Promise<void>
  setData: (data: T[]) => void
}

export function useOptimisticUpdate<T extends { id: string }>(
  initialData: T[],
  options: OptimisticUpdateOptions<T> = {}
): OptimisticUpdateReturn<T> {
  const [data, setData] = useState<T[]>(initialData)
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set())
  const [originalData, setOriginalData] = useState<T[]>(initialData)

  const optimisticUpdate = useCallback(async (
    id: string,
    updates: Partial<T>,
    updateFn: (item: T) => Promise<T>
  ) => {
    const originalItem = data.find(item => item.id === id)
    if (!originalItem) return

    // Add to pending
    setPendingUpdates(prev => new Set(prev).add(id))

    // Optimistic update
    setData(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))

    try {
      const result = await updateFn({ ...originalItem, ...updates })
      
      // Update with server response
      setData(prev => prev.map(item =>
        item.id === id ? result : item
      ))
      
      // Update original data for future rollbacks
      setOriginalData(prev => prev.map(item =>
        item.id === id ? result : item
      ))

      options.onSuccess?.(result, originalItem)
    } catch (error) {
      // Rollback on error
      setData(prev => prev.map(item =>
        item.id === id ? originalItem : item
      ))
      
      options.onError?.(error as Error, originalItem)
      throw error
    } finally {
      setPendingUpdates(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }, [data, options])

  const optimisticAdd = useCallback(async (
    tempItem: T,
    addFn: () => Promise<T>
  ) => {
    const tempId = tempItem.id

    // Add to pending
    setPendingUpdates(prev => new Set(prev).add(tempId))

    // Optimistic add
    setData(prev => [...prev, tempItem])

    try {
      const result = await addFn()
      
      // Replace temp item with real one
      setData(prev => prev.map(item =>
        item.id === tempId ? result : item
      ))
      
      // Update original data
      setOriginalData(prev => [...prev, result])

      options.onSuccess?.(result, tempItem)
    } catch (error) {
      // Remove temp item on error
      setData(prev => prev.filter(item => item.id !== tempId))
      
      options.onError?.(error as Error, tempItem)
      throw error
    } finally {
      setPendingUpdates(prev => {
        const newSet = new Set(prev)
        newSet.delete(tempId)
        return newSet
      })
    }
  }, [options])

  const optimisticRemove = useCallback(async (
    id: string,
    removeFn: (id: string) => Promise<void>
  ) => {
    const originalItem = data.find(item => item.id === id)
    if (!originalItem) return

    // Add to pending
    setPendingUpdates(prev => new Set(prev).add(id))

    // Optimistic remove
    setData(prev => prev.filter(item => item.id !== id))

    try {
      await removeFn(id)
      
      // Remove from original data
      setOriginalData(prev => prev.filter(item => item.id !== id))

      options.onSuccess?.(originalItem, originalItem)
    } catch (error) {
      // Restore item on error
      setData(prev => [...prev, originalItem])
      
      options.onError?.(error as Error, originalItem)
      throw error
    } finally {
      setPendingUpdates(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }, [data, options])

  const updateData = useCallback((newData: T[]) => {
    setData(newData)
    setOriginalData(newData)
  }, [])

  return {
    data,
    pendingUpdates,
    optimisticUpdate,
    optimisticAdd,
    optimisticRemove,
    setData: updateData
  }
} 