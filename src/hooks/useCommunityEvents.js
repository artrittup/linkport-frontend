import { useCallback, useEffect, useState } from 'react'
import {
  getCommunityEventErrorMessage,
  getCommunityEvents,
  getMyCommunityEvents,
} from '../api/communityEventsApi'

const initialMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
}

function useEventsRequest(loader, {
  search,
  category,
  format,
  page = 1,
  perPage = 15,
  enabled = true,
} = {}, supportsBackendFilters = true) {
  const [events, setEvents] = useState([])
  const [meta, setMeta] = useState(initialMeta)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined

    let isActive = true

    async function loadEvents() {
      setIsLoading(true)
      setError('')

      try {
        const response = await loader({
          search: supportsBackendFilters ? search || undefined : undefined,
          category: supportsBackendFilters ? category || undefined : undefined,
          format: supportsBackendFilters ? format || undefined : undefined,
          page,
          per_page: perPage,
        })
        if (!isActive) return
        const query = search?.trim().toLowerCase()
        const visibleEvents = supportsBackendFilters
          ? response.data
          : response.data.filter((event) => {
            const matchesCategory = !category || event.category === category
            const matchesFormat = !format || event.format === format
            const matchesSearch = !query || [
              event.title,
              event.shortDescription,
              event.fullDescription,
              event.location,
              event.organizer,
              ...event.topics,
            ].some((value) => String(value ?? '').toLowerCase().includes(query))
            return matchesCategory && matchesFormat && matchesSearch
          })
        setEvents(visibleEvents)
        setMeta(
          supportsBackendFilters || (!query && !category && !format)
            ? response.meta
            : { ...response.meta, total: visibleEvents.length },
        )
      } catch (requestError) {
        if (!isActive) return
        setEvents([])
        setMeta(initialMeta)
        setError(getCommunityEventErrorMessage(requestError))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadEvents()
    return () => {
      isActive = false
    }
  }, [category, enabled, format, loader, page, perPage, refreshKey, search, supportsBackendFilters])

  const retry = useCallback(() => setRefreshKey((current) => current + 1), [])

  return { events, meta, isLoading: enabled ? isLoading : false, error, retry }
}

export default function useCommunityEvents(options) {
  return useEventsRequest(getCommunityEvents, options)
}

export function useMyCommunityEvents(options) {
  return useEventsRequest(getMyCommunityEvents, options, false)
}
