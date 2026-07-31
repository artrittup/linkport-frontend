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
  const [members, setMembers] = useState([])
  const [meta, setMeta] = useState(initialMeta)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined
    let isActive = true

    async function loadMembers() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getCommunityMembers({
          search: search || undefined,
          skill: skill || undefined,
          interest: interest || undefined,
          university: university || undefined,
          collaboration_status: collaborationStatus || undefined,
          page,
          per_page: perPage,
        })
        if (!isActive) return
        setMembers(response.data)
        setMeta(response.meta)
      } catch (requestError) {
        if (!isActive) return
        setMembers([])
        setMeta(initialMeta)
        setError(getCommunityMemberErrorMessage(requestError))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadMembers()
    return () => {
      isActive = false
    }
  }, [collaborationStatus, enabled, interest, page, perPage, refreshKey, search, skill, university])

  const retry = useCallback(() => setRefreshKey((current) => current + 1), [])

  return {
    members,
    meta,
    isLoading: enabled ? isLoading : false,
    error,
    retry,
  }
}
