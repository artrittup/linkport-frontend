import { useCallback, useEffect, useRef, useState } from 'react'
import { getUnreadNotificationCount, NOTIFICATIONS_CHANGED_EVENT } from '../api/notificationsApi'
import { useAuth } from '../context/AuthContext'

export default function useUnreadNotificationCount() {
  const { isAuthenticated } = useAuth()
  const isRefreshingRef = useRef(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnreadCount = useCallback(async () => {
    if (
      !isAuthenticated
      || document.visibilityState !== 'visible'
      || isRefreshingRef.current
    ) {
      return
    }

    isRefreshingRef.current = true
    try {
      const response = await getUnreadNotificationCount()
      setUnreadCount(Number(response.unread_count ?? 0))
    } catch {
      // Keep the last confirmed count when a background refresh fails.
    } finally {
      isRefreshingRef.current = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined
    }

    const initialRefreshId = window.setTimeout(refreshUnreadCount, 0)
    const intervalId = window.setInterval(refreshUnreadCount, 45000)
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refreshUnreadCount)
    document.addEventListener('visibilitychange', refreshUnreadCount)

    return () => {
      window.clearTimeout(initialRefreshId)
      window.clearInterval(intervalId)
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refreshUnreadCount)
      document.removeEventListener('visibilitychange', refreshUnreadCount)
    }
  }, [isAuthenticated, refreshUnreadCount])

  return unreadCount
}
