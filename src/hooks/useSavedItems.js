import { useCallback, useEffect, useState } from 'react'
import { getSavedItemErrorMessage, getSavedItems } from '../api/savedItemsApi'
import { getSavedItemKey } from '../data/savedItemMapper'

export default function useSavedItems({ perPage = 100, enabled = true } = {}) {
  const [items, setItems] = useState([])
  const [savedKeys, setSavedKeys] = useState(() => new Set())
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined
    let isActive = true

    async function loadItems() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getSavedItems({ per_page: perPage })
        if (!isActive) return
        setItems(response.data)
        setSavedKeys(new Set(response.data.map((item) => getSavedItemKey(item.type, item.itemId))))
      } catch (requestError) {
        if (!isActive) return
        setItems([])
        setSavedKeys(new Set())
        setError(getSavedItemErrorMessage(requestError, 'Saved items are temporarily unavailable.'))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadItems()
    return () => { isActive = false }
  }, [enabled, perPage, refreshKey])

  const updateSavedState = useCallback((type, itemId, isSaved) => {
    const key = getSavedItemKey(type, itemId)
    setSavedKeys((current) => {
      const next = new Set(current)
      if (isSaved) next.add(key)
      else next.delete(key)
      return next
    })
    if (!isSaved) {
      setItems((current) => current.filter((item) => getSavedItemKey(item.type, item.itemId) !== key))
    }
  }, [])

  return {
    items,
    savedKeys,
    isLoading,
    error,
    retry: useCallback(() => setRefreshKey((current) => current + 1), []),
    updateSavedState,
  }
}
