import { useEffect, useState } from 'react'
import { getMemberConversations } from '../api/memberMessagesApi'

export default function useMemberConversations() {
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [backendAvailable, setBackendAvailable] = useState(false)

  useEffect(() => {
    let active = true

    getMemberConversations()
      .then((response) => {
        if (!active) return
        setConversations(response.data ?? [])
        setBackendAvailable(Boolean(response.backendAvailable))
      })
      .catch(() => {
        if (active) setError('Messages are unavailable right now.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return {
    conversations,
    isLoading,
    error,
    backendAvailable,
  }
}
