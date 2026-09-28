import { useCallback, useEffect, useState } from 'react'
import {
  getCommunityMemberErrorMessage,
  getCommunityMembers,
} from '../api/communityMembersApi'

const initialMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
}

const responseCache = new Map()
const requestCache = new Map()

function keyFor(params) {
  return JSON.stringify(params)
}

export default function useCommunityMembers({
  search,
  skill,
  interest,
  university,
  collaborationStatus,
  page = 1,
  perPage = 12,
  enabled = true,
} = {}) {
  const params = {
    search: search || undefined,
    skill: skill || undefined,
    interest: interest || undefined,
    university: university || undefined,
    collaboration_status: collaborationStatus || undefined,
    page,
    per_page: perPage,
  }
  const cacheKey = keyFor(params)
  const initialCached = responseCache.get(cacheKey)
  const [members, setMembers] = useState(() => initialCached?.response.data ?? [])
  const [meta, setMeta] = useState(() => initialCached?.response.meta ?? initialMeta)
  const [isLoading, setIsLoading] = useState(() => Boolean(enabled && !initialCached))
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined
    let isActive = true

    async function loadMembers() {
      await Promise.resolve()
      if (!isActive) return

      const cached = responseCache.get(cacheKey)
      if (refreshKey === 0 && cached) {
        setMembers(cached.response.data)
        setMeta(cached.response.meta)
        setError('')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')
      const requestKey = `${cacheKey}:${refreshKey}`
      const request = requestCache.get(requestKey) ?? getCommunityMembers(JSON.parse(cacheKey))
      requestCache.set(requestKey, request)

      try {
        const response = await request
        responseCache.set(cacheKey, { response })
        if (!isActive) return
        setMembers(response.data)
        setMeta(response.meta)
      } catch (requestError) {
        if (!isActive) return
        setMembers([])
        setMeta(initialMeta)
        setError(getCommunityMemberErrorMessage(requestError))
      } finally {
        requestCache.delete(requestKey)
        if (isActive) setIsLoading(false)
      }
    }

    loadMembers()
    return () => {
      isActive = false
    }
  }, [cacheKey, enabled, refreshKey])

  const retry = useCallback(() => setRefreshKey((current) => current + 1), [])

  return {
    members,
    meta,
    isLoading: enabled ? isLoading : false,
    error,
    retry,
  }
}
