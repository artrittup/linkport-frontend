import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  announceNotificationsChanged,
  deleteNotification,
  getNotificationErrorMessage,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../api/notificationsApi'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'
import { getNotificationDestination } from '../utils/notificationDestination'

const PAGE_SIZE = 15

function navigationFor(role) {
  if (role === 'candidate') return [{ label: 'Dashboard', href: '/candidate/dashboard' }, { label: 'Profile', href: '/candidate/profile' }, { label: 'My Network', href: '/connections' }, { label: 'Circles', href: '/circles' }, { label: 'Logout', href: '/login' }]
  if (role === 'company') return [{ label: 'Dashboard', href: '/company/dashboard' }, { label: 'Company Profile', href: '/company/profile' }, { label: 'Applications', href: '/company/applications' }, { label: 'Bids', href: '/company/bids' }, { label: 'Logout', href: '/login' }]
  return [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Users', href: '/admin/users' }, { label: 'Jobs', href: '/admin/jobs' }, { label: 'Projects', href: '/admin/projects' }, { label: 'Logout', href: '/login' }]
}

export default function Notifications() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [filter, setFilter] = useState('all')
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let active = true
    getNotifications({ unread: filter === 'unread' ? true : undefined, per_page: PAGE_SIZE, page: 1 })
      .then((response) => {
        if (active) {
          setNotifications(response.data ?? [])
          setTotal(Number(response.total ?? 0))
        }
      })
      .catch((requestError) => {
        if (active) setError(getNotificationErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [filter])

  const changeFilter = (nextFilter) => {
    if (nextFilter === filter) return
    setFilter(nextFilter)
    setNotifications([])
    setTotal(0)
    setError('')
    setIsLoading(true)
  }

  const loadMore = async () => {
    if (isLoadingMore || notifications.length >= total) return

    setIsLoadingMore(true)
    setError('')
    const nextPage = Math.floor(notifications.length / PAGE_SIZE) + 1

    try {
      const response = await getNotifications({
        unread: filter === 'unread' ? true : undefined,
        per_page: PAGE_SIZE,
        page: nextPage,
      })
      setNotifications((items) => {
        const existingIds = new Set(items.map((item) => item.id))
        return [...items, ...(response.data ?? []).filter((item) => !existingIds.has(item.id))]
      })
      setTotal(Number(response.total ?? 0))
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError, 'Unable to load more notifications.'))
    } finally {
      setIsLoadingMore(false)
    }
  }

  const markRead = async (notification) => {
    if (notification.read_at) return
    setWorkingId(notification.id)
    try {
      const response = await markNotificationAsRead(notification.id)
      if (filter === 'unread') {
        setNotifications((items) => items.filter((item) => item.id !== notification.id))
        setTotal((count) => Math.max(0, count - 1))
      }
      else setNotifications((items) => items.map((item) => item.id === notification.id ? response.notification : item))
      announceNotificationsChanged()
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError, 'Unable to mark this notification as read.'))
    } finally {
      setWorkingId(null)
    }
  }

  const openNotification = async (notification) => {
    if (workingId !== null) return
    setWorkingId(notification.id)

    if (!notification.read_at) {
      try {
        await markNotificationAsRead(notification.id)
        announceNotificationsChanged()
      } catch {
        // A read-status failure must not block the notification destination.
      }
    }

    navigate(getNotificationDestination(notification))
    setWorkingId(null)
  }

  const markAll = async () => {
    try {
      const response = await markAllNotificationsAsRead()
      if (filter === 'unread') setNotifications([])
      else setNotifications((items) => items.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })))
      if (filter === 'unread') setTotal(0)
      announceNotificationsChanged()
      showToast(response.message, 'success')
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError, 'Unable to mark notifications as read.'))
    }
  }

  const remove = async (id) => {
    setWorkingId(id)
    try {
      const response = await deleteNotification(id)
      setNotifications((items) => items.filter((item) => item.id !== id))
      setTotal((count) => Math.max(0, count - 1))
      announceNotificationsChanged()
      showToast(response.message, 'success')
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError, 'Unable to delete this notification.'))
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <DashboardLayout title="Notifications" navItems={navigationFor(user?.role)} userType={user?.role === 'candidate' ? 'Member' : user?.role}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-sm text-[#64ffda]">Updates</p><h2 className="mt-2 text-3xl font-bold text-[#e6f1ff]">Notifications</h2><p className="mt-2 text-[#8892b0]">Keep up with connections, opportunities, and circles.</p></div><Button variant="outline" size="sm" onClick={markAll}>Mark all as read</Button></div>
        <div className="inline-flex rounded-lg border border-[#233554] bg-[#071426] p-1">{['all', 'unread'].map((item) => <button key={item} type="button" onClick={() => changeFilter(item)} className={`rounded-md px-4 py-2 text-sm font-medium capitalize ${filter === item ? 'bg-[#112240] text-[#64ffda]' : 'text-[#8892b0]'}`}>{item}</button>)}</div>
        {error && <p role="alert" className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
        {isLoading ? <LoadingSpinner label="Loading notifications..." /> : notifications.length === 0 ? <div className="rounded-xl border border-dashed border-[#233554] bg-[#112240]/40 px-6 py-14 text-center text-sm text-[#8892b0]">No {filter === 'unread' ? 'unread ' : ''}notifications.</div> : (
          <div className="space-y-3">{notifications.map((notification) => <article key={notification.id} className={`relative rounded-xl border p-5 ${notification.read_at ? 'border-[#233554] bg-[#112240]/65' : 'border-[#64ffda]/25 bg-[#112240]'}`}><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><button type="button" disabled={workingId !== null} onClick={() => openNotification(notification)} className="min-w-0 flex-1 rounded-md text-left outline-none transition-colors hover:text-[#64ffda] focus-visible:ring-2 focus-visible:ring-[#64ffda] disabled:cursor-wait">{!notification.read_at && <span className="mb-2 inline-flex rounded-full bg-[#64ffda]/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#64ffda]">New</span>}<h3 className="font-semibold text-[#e6f1ff]">{notification.title}</h3>{notification.message && <p className="mt-1.5 text-sm leading-6 text-[#8892b0]">{notification.message}</p>}<time className="mt-2 block text-xs text-[#64748b]">{new Date(notification.created_at).toLocaleString()}</time></button><div className="flex shrink-0 gap-2">{!notification.read_at && <Button size="sm" variant="ghost" disabled={workingId === notification.id} onClick={() => markRead(notification)}>Mark read</Button>}<Button size="sm" variant="ghost" disabled={workingId === notification.id} onClick={() => remove(notification.id)}>Delete</Button></div></div></article>)}</div>
        )}
        {!isLoading && notifications.length < total && <div className="flex justify-center"><Button variant="outline" disabled={isLoadingMore} onClick={loadMore}>{isLoadingMore ? 'Loading...' : 'Load more'}</Button></div>}
      </div>
    </DashboardLayout>
  )
}
