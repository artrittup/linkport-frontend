import { useCallback, useEffect, useState } from 'react'
import { getMemberConversations, getMemberMessageError } from '../api/memberMessagesApi'

export default function useMemberConversations() {
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getMemberConversations({ per_page: 50 })
      .then((response) => {
        if (active) setConversations(response.data ?? [])
      })
      .catch((requestError) => {
        if (active) setError(getMemberMessageError(requestError, 'Messages are unavailable right now.'))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  const upsertConversation = useCallback((conversation) => {
    if (!conversation) return
    setConversations((current) => [
      conversation,
      ...current.filter((item) => item.id !== conversation.id),
    ])
  }, [])

  return {
    conversations,
    isLoading,
    error,
    retry: useCallback(() => {
      setIsLoading(true)
      setError('')
      setRefreshKey((current) => current + 1)
    }, []),
    upsertConversation,
  }
}
