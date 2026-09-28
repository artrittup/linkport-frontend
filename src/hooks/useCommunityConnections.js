import { useCallback, useEffect, useState } from 'react'
import {
  getConnections,
  getIncomingConnectionRequests,
  getSentConnectionRequests,
} from '../api/connectionsApi'
import { useAuth } from '../context/AuthContext'

const cache = new Map()
const pendingRequests = new Map()

function memberIdFor(connection, currentUserId) {
  return Number(connection.requester_id) === Number(currentUserId)
    ? connection.receiver_id
    : connection.requester_id
}

function buildStatuses(currentUserId, accepted, incoming, sent) {
  const statuses = new Map()
  accepted.forEach((connection) => statuses.set(String(memberIdFor(connection, currentUserId)), {
    status: 'connected',
    connection_id: connection.id,
  }))
  incoming.forEach((connection) => statuses.set(String(connection.requester_id), {
    status: 'pending_received',
    connection_id: connection.id,
  }))
  sent.forEach((connection) => statuses.set(String(connection.receiver_id), {
    status: 'pending_sent',
    connection_id: connection.id,
  }))
  return statuses
}

export default function useCommunityConnections({ enabled = true } = {}) {
  const { user } = useAuth()
  const userId = user?.id
  const cached = cache.get(String(userId))
  const [statuses, setStatuses] = useState(() => cached?.statuses ?? new Map())
  const [isLoading, setIsLoading] = useState(() => Boolean(enabled && userId && !cached))
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const retry = useCallback(() => setVersion((current) => current + 1), [])

  useEffect(() => {
    if (!enabled || !userId) return undefined
    let active = true

    async function loadStatuses() {
      await Promise.resolve()
      if (!active) return

      const cacheKey = String(userId)
      const fresh = cache.get(cacheKey)
      if (version === 0 && fresh) {
        setStatuses(fresh.statuses)
        setIsLoading(false)
        setError('')
        return
      }

      setIsLoading(true)
      setError('')
      const request = pendingRequests.get(cacheKey) ?? Promise.all([
        getConnections({ per_page: 50 }),
        getIncomingConnectionRequests({ per_page: 50 }),
        getSentConnectionRequests({ per_page: 50 }),
      ])
      pendingRequests.set(cacheKey, request)

      try {
        const [accepted, incoming, sent] = await request
        if (!active) return
        const nextStatuses = buildStatuses(
          userId,
          accepted.data ?? [],
          incoming.data ?? [],
          sent.data ?? [],
        )
        cache.set(cacheKey, { statuses: nextStatuses })
        setStatuses(nextStatuses)
      } catch {
        if (active) setError('Connection actions are temporarily unavailable.')
      } finally {
        if (pendingRequests.get(cacheKey) === request) pendingRequests.delete(cacheKey)
        if (active) setIsLoading(false)
      }
    }

    loadStatuses()
    return () => {
      active = false
    }
  }, [enabled, userId, version])

  return { statuses, isLoading: enabled ? isLoading : false, error, retry }
}
