import { useCallback, useEffect, useState } from 'react'
import {
  getCommunityProjectErrorMessage,
  getCommunityProjects,
} from '../api/communityProjectsApi'

const initialMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
}

export default function useCommunityProjects({
  search,
  status,
  lookingForTeammates,
  userId,
  page = 1,
  perPage = 12,
  enabled = true,
} = {}) {
  const [projects, setProjects] = useState([])
  const [meta, setMeta] = useState(initialMeta)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined

    let isActive = true

    async function loadProjects() {
      setIsLoading(true)
      setError('')

      try {
        const response = await getCommunityProjects({
          search: search || undefined,
          status: status || undefined,
          looking_for_teammates: lookingForTeammates,
          user_id: userId || undefined,
          page,
          per_page: perPage,
        })
        if (!isActive) return
        setProjects(response.data)
        setMeta(response.meta)
      } catch (requestError) {
        if (!isActive) return
        setProjects([])
        setMeta(initialMeta)
        setError(getCommunityProjectErrorMessage(requestError))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadProjects()
    return () => {
      isActive = false
    }
  }, [
    enabled,
    lookingForTeammates,
    page,
    perPage,
    refreshKey,
    search,
    status,
    userId,
  ])

  const retry = useCallback(() => setRefreshKey((current) => current + 1), [])

  return {
    projects,
    meta,
    isLoading,
    error,
    retry,
  }
}
