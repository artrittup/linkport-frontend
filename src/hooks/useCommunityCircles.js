import { useCallback, useEffect, useState } from 'react'
import {
  getCircles,
  getMyCircles,
  getMyCircleInvitations,
  getMyCircleJoinRequests,
  getCircleErrorMessage,
} from '../api/circlesApi'

async function allPages(fetcher, params = {}) {
  const first = await fetcher({ ...params, per_page: 100 })
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, (first.last_page ?? 1) - 1) }, (_, index) =>
      fetcher({ ...params, per_page: 100, page: index + 2 }),
    ),
  )
  return [first, ...rest].flatMap((response) => response.data ?? [])
}

export default function useCommunityCircles() {
  const [data, setData] = useState({ circles: [], invitations: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const retry = useCallback(() => setVersion((value) => value + 1), [])
  useEffect(() => {
    let active = true
    Promise.all([
      allPages(getCircles),
      allPages(getMyCircles),
      allPages(getMyCircleInvitations, { status: 'pending' }),
      allPages(getMyCircleJoinRequests, { status: 'pending' }),
    ])
      .then(([publicCircles, mine, invitations, requests]) => {
        if (!active) return
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
        setData({ circles, invitations })
        setError('')
      })
      .catch((error) => {
        if (active) setError(getCircleErrorMessage(error, 'Unable to load Circles.'))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [version])
  return { ...data, isLoading, error, retry }
}
