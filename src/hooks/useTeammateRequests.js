import { useCallback, useEffect, useState } from 'react'
import {
  getTeammateRequestErrorMessage,
  getTeammateRequests,
} from '../api/teammateRequestsApi'

const initialMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
}

export default function useTeammateRequests({
  search,
  status,
  workStyle,
  commitment,
  skill,
  role,
  userId,
  page = 1,
  perPage = 12,
  enabled = true,
} = {}) {
  const [requests, setRequests] = useState([])
  const [meta, setMeta] = useState(initialMeta)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined

    let isActive = true

    async function loadRequests() {
      setIsLoading(true)
      setError('')

      try {
        const response = await getTeammateRequests({
          search: search || undefined,
          status: status || undefined,
          work_style: workStyle || undefined,
          commitment: commitment || undefined,
          skill: skill || undefined,
          role: role || undefined,
          user_id: userId || undefined,
          page,
          per_page: perPage,
        })
        if (!isActive) return
        setRequests(response.data)
        setMeta(response.meta)
      } catch (requestError) {
        if (!isActive) return
        setRequests([])
        setMeta(initialMeta)
        setError(getTeammateRequestErrorMessage(requestError))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadRequests()
    return () => {
      isActive = false
    }
  }, [
    commitment,
    enabled,
    page,
    perPage,
    refreshKey,
    role,
    search,
    skill,
    status,
    userId,
    workStyle,
  ])

  const retry = useCallback(() => setRefreshKey((current) => current + 1), [])

  return {
    requests,
    meta,
    isLoading,
    error,
    retry,
  }
}
