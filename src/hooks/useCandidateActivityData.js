import { useCallback, useEffect, useState } from 'react'
import { getMyApplications } from '../api/applicationsApi'
import { getMyBids } from '../api/bidsApi'

const initialPagination = {
  current_page: 1,
  total: 0,
  per_page: 15,
}

function getLatestItem(items) {
  return items.reduce((latest, item) => {
    if (!latest) return item
    const latestDate = Date.parse(latest.created_at)
    const itemDate = Date.parse(item.created_at)
    if (!Number.isFinite(itemDate)) return latest
    return !Number.isFinite(latestDate) || itemDate > latestDate ? item : latest
  }, null)
}

function usePaginatedActivity(fetchItems, errorMessage) {
  const [items, setItems] = useState([])
  const [status, setStatusState] = useState('All statuses')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(initialPagination)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [summary, setSummary] = useState({
    total: null,
    latest: null,
    isLoading: true,
    error: false,
  })

  useEffect(() => {
    let isActive = true
    const isSummaryRequest = status === 'All statuses' && page === 1

    async function loadItems() {
      setIsLoading(true)
      setError('')
      if (isSummaryRequest) {
        setSummary((current) => ({ ...current, isLoading: true, error: false }))
      }

      try {
        const response = await fetchItems({
          status: status === 'All statuses' ? undefined : status.toLowerCase(),
          per_page: 15,
          page,
        })

        if (!isActive) return
        setItems(response.data)
        setPagination({
          current_page: response.current_page,
          total: response.total,
          per_page: response.per_page,
        })
        if (isSummaryRequest) {
          setSummary({
            total: response.total,
            latest: getLatestItem(response.data),
            isLoading: false,
            error: false,
          })
        }
      } catch {
        if (!isActive) return
        setItems([])
        setError(errorMessage)
        if (isSummaryRequest) {
          setSummary({
            total: null,
            latest: null,
            isLoading: false,
            error: true,
          })
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadItems()
    return () => {
      isActive = false
    }
  }, [errorMessage, fetchItems, page, refreshKey, status])

  const setStatus = useCallback((nextStatus) => {
    setStatusState(nextStatus)
    setPage(1)
  }, [])

  const retry = useCallback(() => {
    setRefreshKey((current) => current + 1)
  }, [])

  return {
    items,
    status,
    setStatus,
    page,
    setPage,
    pagination,
    isLoading,
    error,
    retry,
    summary,
  }
}

export function useCandidateApplications() {
  return usePaginatedActivity(
    getMyApplications,
    'Applications are temporarily unavailable. Please try again.',
  )
}

export function useCandidateProposals() {
  return usePaginatedActivity(
    getMyBids,
    'Proposals are temporarily unavailable. Please try again.',
  )
}
