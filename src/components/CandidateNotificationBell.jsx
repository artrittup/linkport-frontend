import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  announceNotificationsChanged,
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

export default function CandidateNotificationBell({
  placement = 'mobile',
  className = '',
}) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const panelId = useId()
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const refreshingCountRef = useRef(false)
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [openingId, setOpeningId] = useState(null)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const refreshUnreadCount = useCallback(async () => {
    if (
      !isAuthenticated ||
      document.visibilityState !== 'visible' ||
      refreshingCountRef.current
    ) {
      return
    }

    refreshingCountRef.current = true
    try {
      const response = await getUnreadNotificationCount()
      setUnreadCount(Number(response.unread_count ?? 0))
    } catch {
      // Keep the last confirmed count when a background refresh fails.
    } finally {
      refreshingCountRef.current = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return undefined

    const refreshId = window.setTimeout(refreshUnreadCount, 0)
    const intervalId = window.setInterval(refreshUnreadCount, 45000)
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refreshUnreadCount)
    document.addEventListener('visibilitychange', refreshUnreadCount)
    return () => {
      window.clearTimeout(refreshId)
      window.clearInterval(intervalId)
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refreshUnreadCount)
      document.removeEventListener('visibilitychange', refreshUnreadCount)
    }
  }, [isAuthenticated, refreshUnreadCount])

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  const toggleDropdown = async () => {
    const nextOpen = !isOpen
    setIsOpen(nextOpen)
    if (!nextOpen) return

    setIsLoading(true)
    setError('')
    try {
      const response = await getNotifications({ filter: 'all', per_page: 6, page: 1 })
      setNotifications(response.data)
      setUnreadCount(response.unreadCount)
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError, 'Notifications are unavailable right now.'))
    } finally {
      setIsLoading(false)
    }
  }

  const openNotification = async (notification) => {
    if (openingId !== null) return
    setOpeningId(notification.id)
    setError('')

    if (!notification.isRead) {
      try {
        const response = await markNotificationAsRead(notification.id)
        setNotifications((items) => items.map((item) => (
          item.id === notification.id ? response.notification : item
        )))
        setUnreadCount(response.unreadCount)
        announceNotificationsChanged('candidate-bell')
      } catch {
        setError('This update could not be marked as read.')
      }
    }

    setIsOpen(false)
    navigate(getNotificationDestination(notification, '/member/notifications'))
    setOpeningId(null)
  }

  const markAllRead = async () => {
    if (isMarkingAll) return
    setIsMarkingAll(true)
    setError('')
    try {
      const response = await markAllNotificationsAsRead()
      const readAt = new Date().toISOString()
      setNotifications((items) => items.map((item) => ({
        ...item,
        isRead: true,
        readAt: item.readAt ?? readAt,
      })))
      setUnreadCount(response.unreadCount)
      announceNotificationsChanged('candidate-bell')
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError, 'Unable to mark notifications as read.'))
    } finally {
      setIsMarkingAll(false)
    }
  }

  const panelPosition = placement === 'sidebar'
    ? 'left-0 top-full w-[min(22rem,calc(100vw-2rem))]'
    : 'right-0 top-full w-[min(22rem,calc(100vw-2rem))]'

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        aria-label="Open notifications"
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda] ${
          isOpen
            ? 'bg-[#112240] text-[#64ffda]'
            : 'text-[#8892b0] hover:bg-[#112240] hover:text-[#64ffda]'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#64ffda] px-1 text-[9px] font-bold text-[#071426]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          id={panelId}
          role="dialog"
          aria-label="Recent notifications"
          className={`absolute z-[80] mt-2 flex max-h-[calc(100vh-6rem)] min-w-0 flex-col overflow-hidden rounded-xl border border-[#233554] bg-[#112240] shadow-2xl shadow-black/45 ${panelPosition}`}
        >
          <header className="flex min-w-0 items-start justify-between gap-3 border-b border-[#233554] px-4 py-3">
            <div className="min-w-0">
              <h2 className="font-semibold text-[#e6f1ff]">Notifications</h2>
              <p className="mt-0.5 text-[11px] text-[#8892b0]">{unreadCount} unread</p>
            </div>
            {unreadCount > 0 && (
              <button type="button" disabled={isMarkingAll} onClick={markAllRead} className="shrink-0 text-xs font-medium text-[#64ffda] hover:underline disabled:cursor-wait disabled:opacity-60">
                {isMarkingAll ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
            {isLoading && <p className="px-3 py-8 text-center text-xs text-[#8892b0]">Loading notifications...</p>}
            {!isLoading && error && <p role="alert" className="px-3 py-3 text-center text-xs text-[#fca5a5]">{error}</p>}
            {!isLoading && notifications.length === 0 && (
              <p className="px-3 py-8 text-center text-xs text-[#8892b0]">You have no notifications.</p>
            )}
            {!isLoading && notifications.map((notification) => (
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

          <Link
            to="/member/notifications"
            onClick={() => setIsOpen(false)}
            className="block border-t border-[#233554] px-4 py-3 text-center text-xs font-semibold text-[#64ffda] transition-colors hover:bg-[#172a45]"
          >
            View all notifications
          </Link>
        </section>
      )}
    </div>
  )
}
