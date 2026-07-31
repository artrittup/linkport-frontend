import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  getNotificationErrorMessage,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NOTIFICATIONS_CHANGED_EVENT,
} from '../api/notificationsApi'
import { useAuth } from '../context/AuthContext'
import { getNotificationDestination } from '../utils/notificationDestination'
import { formatNotificationTime } from '../utils/notificationMapper'
import NotificationRow from './NotificationRow'

export default function NotificationBell({ align = 'right' }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const containerRef = useRef(null)
  const isRefreshingCountRef = useRef(false)
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [openingId, setOpeningId] = useState(null)

  const refreshUnreadCount = useCallback(async () => {
    if (
      !isAuthenticated ||
      document.visibilityState !== 'visible' ||
      isRefreshingCountRef.current
    ) {
      return
    }

    isRefreshingCountRef.current = true
    try {
      const data = await getUnreadNotificationCount()
      setUnreadCount(Number(data.unread_count ?? 0))
    } catch {
      // Keep the last known count when a background refresh fails.
    } finally {
      isRefreshingCountRef.current = false
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

  useEffect(() => {
    const close = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false)
    }
    const escape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [])

  const toggle = async () => {
    const nextOpen = !isOpen
    setIsOpen(nextOpen)
    if (!nextOpen) return

    setIsLoading(true)
    setError('')
    try {
      const [response] = await Promise.all([
        getNotifications({ per_page: 6, page: 1 }),
        refreshUnreadCount(),
      ])
      setNotifications(response.data ?? [])
      setUnreadCount(response.unreadCount)
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }

  const openNotification = async (notification) => {
    if (openingId !== null) return
    setOpeningId(notification.id)

    if (!notification.isRead) {
      try {
        const response = await markNotificationAsRead(notification.id)
        setUnreadCount(response.unreadCount)
        setNotifications((items) => items.map((item) => (
          item.id === notification.id
            ? response.notification
            : item
        )))
        refreshUnreadCount()
      } catch {
        // Navigation remains available if the read update fails.
      }
    }
    setIsOpen(false)
    navigate(getNotificationDestination(notification))
    setOpeningId(null)
  }

  const markAll = async () => {
    try {
      const response = await markAllNotificationsAsRead()
      setUnreadCount(response.unreadCount)
      setNotifications((items) => items.map((item) => ({
        ...item,
        isRead: true,
        readAt: item.readAt || new Date().toISOString(),
      })))
      refreshUnreadCount()
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError, 'Unable to mark notifications as read.'))
    }
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button type="button" onClick={toggle} aria-label="Notifications" aria-expanded={isOpen} className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface hover:text-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
        {unreadCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-contrast">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={`absolute top-full z-50 mt-2 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/40 ${align === 'left' ? 'left-0' : 'right-0'}`}>
          <div className="flex items-center justify-between border-b border-border px-4 py-3"><div><h2 className="font-semibold text-text-primary">Notifications</h2><p className="text-[11px] text-text-muted">{unreadCount} unread</p></div>{unreadCount > 0 && <button type="button" onClick={markAll} className="text-xs font-medium text-primary hover:underline">Mark all read</button>}</div>
          <div className="max-h-96 overflow-y-auto p-1.5">
            {isLoading && <p className="px-3 py-8 text-center text-xs text-text-muted">Loading notifications...</p>}
            {!isLoading && error && <p role="alert" className="px-3 py-8 text-center text-xs text-danger-text">{error}</p>}
            {!isLoading && !error && notifications.length === 0 && <p className="px-3 py-8 text-center text-xs text-text-muted">You have no notifications yet.</p>}
            {!isLoading && !error && notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onOpen={openNotification}
                formattedTime={formatNotificationTime(notification.createdAt)}
                compact
                disabled={openingId !== null}
              />
            ))}
          </div>
          <Link to="/notifications" onClick={() => setIsOpen(false)} className="block border-t border-border px-4 py-3 text-center text-xs font-semibold text-primary transition-colors hover:bg-surface-elevated">View all notifications</Link>
        </div>
      )}
    </div>
  )
}
