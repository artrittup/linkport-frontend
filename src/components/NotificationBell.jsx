import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  getNotificationErrorMessage,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../api/notificationsApi'

function destinationFor(notification) {
  const data = notification.data ?? {}
  if (notification.type === 'connection_request') return '/connections'
  if (notification.type === 'connection_accepted' && data.receiver_id) return `/members/${data.receiver_id}`
  if (notification.type.startsWith('circle_') && data.circle_id) return `/circles/${data.circle_id}`
  if (notification.type === 'job_application_received') return '/company/applications'
  if (notification.type === 'job_application_status') return '/candidate/applications'
  if (notification.type === 'project_bid_received') return '/company/bids'
  if (notification.type === 'project_bid_status') return '/candidate/bids'
  return '/notifications'
}

function relativeTime(value) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(value).toLocaleDateString()
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getUnreadNotificationCount()
      .then((data) => active && setUnreadCount(data.unread_count ?? 0))
      .catch(() => {})
    return () => { active = false }
  }, [])

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
      const response = await getNotifications({ per_page: 6 })
      setNotifications(response.data ?? [])
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }

  const openNotification = async (notification) => {
    if (!notification.read_at) {
      try {
        await markNotificationAsRead(notification.id)
        setUnreadCount((count) => Math.max(0, count - 1))
      } catch {
        // Navigation remains available if the read update fails.
      }
    }
    setIsOpen(false)
    navigate(destinationFor(notification))
  }

  const markAll = async () => {
    try {
      await markAllNotificationsAsRead()
      setUnreadCount(0)
      setNotifications((items) => items.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })))
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError, 'Unable to mark notifications as read.'))
    }
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button type="button" onClick={toggle} aria-label="Notifications" aria-expanded={isOpen} className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#8892b0] transition-colors hover:bg-[#112240] hover:text-[#64ffda]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
        {unreadCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#64ffda] px-1 text-[9px] font-bold text-[#071426]">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#233554] bg-[#112240] shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-[#233554] px-4 py-3"><div><h2 className="font-semibold text-[#e6f1ff]">Notifications</h2><p className="text-[11px] text-[#8892b0]">{unreadCount} unread</p></div>{unreadCount > 0 && <button type="button" onClick={markAll} className="text-xs font-medium text-[#64ffda] hover:underline">Mark all read</button>}</div>
          <div className="max-h-96 overflow-y-auto p-1.5">
            {isLoading && <p className="px-3 py-8 text-center text-xs text-[#8892b0]">Loading notifications...</p>}
            {!isLoading && error && <p role="alert" className="px-3 py-8 text-center text-xs text-[#fca5a5]">{error}</p>}
            {!isLoading && !error && notifications.length === 0 && <p className="px-3 py-8 text-center text-xs text-[#8892b0]">You have no notifications yet.</p>}
            {!isLoading && !error && notifications.map((notification) => (
              <button key={notification.id} type="button" onClick={() => openNotification(notification)} className={`relative block w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-[#172a45] ${notification.read_at ? '' : 'bg-[#64ffda]/5'}`}>
                {!notification.read_at && <span className="absolute right-3 top-4 h-1.5 w-1.5 rounded-full bg-[#64ffda]" />}
                <p className="pr-4 text-sm font-medium text-[#e6f1ff]">{notification.title}</p>{notification.message && <p className="mt-1 pr-3 text-xs leading-5 text-[#8892b0]">{notification.message}</p>}<p className="mt-1.5 text-[10px] text-[#64748b]">{relativeTime(notification.created_at)}</p>
              </button>
            ))}
          </div>
          <Link to="/notifications" onClick={() => setIsOpen(false)} className="block border-t border-[#233554] px-4 py-3 text-center text-xs font-semibold text-[#64ffda] transition-colors hover:bg-[#172a45]">View all notifications</Link>
        </div>
      )}
    </div>
  )
}
