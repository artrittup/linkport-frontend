import { useCallback, useEffect, useState } from 'react'
import {
  getCircles,
  getMyCircles,
  getMyCircleInvitations,
  getMyCircleJoinRequests,
  getCircleErrorMessage,
} from '../api/circlesApi'

let circleCache = null
let pendingRequest = null

async function allPages(fetcher, params = {}) {
  const first = await fetcher({ ...params, per_page: 100 })
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, (first.last_page ?? 1) - 1) }, (_, index) =>
      fetcher({ ...params, per_page: 100, page: index + 2 }),
    ),
  )
  return [first, ...rest].flatMap((response) => response.data ?? [])
}

async function loadCircleData() {
  const [publicCircles, mine, invitations, requests] = await Promise.all([
    allPages(getCircles),
    allPages(getMyCircles),
    allPages(getMyCircleInvitations, { status: 'pending' }),
    allPages(getMyCircleJoinRequests, { status: 'pending' }),
  ])
  const joined = new Set(mine.map((circle) => circle.id))
  const pending = new Set(requests.map((request) => request.circle_id))
  const invited = new Set(invitations.map((invitation) => invitation.circle_id))
  const circles = [
    ...new Map([...publicCircles, ...mine].map((circle) => [circle.id, circle])).values(),
  ].map((circle) => ({
    ...circle,
    category: circle.category || 'General',
    description: circle.description || '',
    tags: circle.skills,
    tagline: `Hosted by ${circle.ownerName}`,
    location: '',
    discussionCount: Number(circle.posts_count ?? 0),
    createdAt: circle.created_at,
    activityLevel: circle.visibility === 'private' ? 'Private Circle' : 'Public Circle',
    isJoined: joined.has(circle.id),
    isPending: pending.has(circle.id),
    isInvited: invited.has(circle.id),
  }))

  return { circles, invitations }
}

export default function useCommunityCircles({ enabled = true } = {}) {
  const [data, setData] = useState(() => circleCache?.data ?? { circles: [], invitations: [] })
  const [isLoading, setIsLoading] = useState(() => Boolean(enabled && !circleCache))
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const retry = useCallback(() => setVersion((value) => value + 1), [])

  useEffect(() => {
    if (!enabled) return undefined
    let active = true

    async function loadCircles() {
      await Promise.resolve()
      if (!active) return

      if (version === 0 && circleCache) {
        setData(circleCache.data)
        setError('')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const request = version === 0 && pendingRequest
        ? pendingRequest
        : loadCircleData()
      if (version === 0) pendingRequest = request

      try {
        const nextData = await request
        circleCache = { data: nextData }
        if (active) {
          setData(nextData)
          setError('')
        }
      } catch (requestError) {
        if (active) setError(getCircleErrorMessage(requestError, 'Unable to load Circles.'))
      } finally {
        if (pendingRequest === request) pendingRequest = null
        if (active) setIsLoading(false)
      }
    }

    loadCircles()
    return () => {
      active = false
    }
  }, [enabled, version])

  return { ...data, isLoading: enabled ? isLoading : false, error, retry }
}
