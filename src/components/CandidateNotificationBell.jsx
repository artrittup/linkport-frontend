import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useLocalContent } from '../context/LocalContentContext'
import {
  formatNotificationTime,
  getVisibleCandidateNotifications,
} from '../data/mockCandidateNotifications'
import NotificationRow from './NotificationRow'

export default function CandidateNotificationBell({
  placement = 'mobile',
  className = '',
}) {
  const navigate = useNavigate()
  const panelId = useId()
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const {
    readNotificationIds,
    deletedNotificationIds,
    markCandidateNotificationRead,
    markAllCandidateNotificationsRead,
  } = useLocalContent()

  const notifications = useMemo(
    () => getVisibleCandidateNotifications(readNotificationIds, deletedNotificationIds),
    [deletedNotificationIds, readNotificationIds],
  )
  const unreadCount = notifications.filter((notification) => !notification.isRead).length
  const recentNotifications = notifications.slice(0, 6)

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

  const openNotification = (notification) => {
    if (!notification.isRead) markCandidateNotificationRead(notification.id)
    setIsOpen(false)
    navigate(notification.targetRoute)
  }

  const markAllRead = () => {
    markAllCandidateNotificationsRead(notifications.map((notification) => notification.id))
  }

  const panelPosition = placement === 'sidebar'
    ? 'left-0 top-full w-[22rem] max-w-[calc(100vw-17rem)]'
    : 'right-0 top-full w-[min(22rem,calc(100vw-2rem))]'

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
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
            {unreadCount > 9 ? '9+' : unreadCount}
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
              <button type="button" onClick={markAllRead} className="shrink-0 text-xs font-medium text-[#64ffda] hover:underline">
                Mark all as read
              </button>
            )}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
            {recentNotifications.length > 0 ? recentNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onOpen={openNotification}
                formattedTime={formatNotificationTime(notification.createdAt)}
                compact
              />
            )) : (
              <p className="px-3 py-8 text-center text-xs text-[#8892b0]">You have no notifications.</p>
            )}
          </div>

          <Link
            to="/candidate/notifications"
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
