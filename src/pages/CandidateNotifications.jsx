import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  announceNotificationsChanged,
  deleteAllNotifications,
  deleteNotification,
  deleteSelectedNotifications,
  getNotificationErrorMessage,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NOTIFICATIONS_CHANGED_EVENT,
} from '../api/notificationsApi'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'
import NotificationRow from '../components/NotificationRow'
import CandidateLayout from '../layouts/CandidateLayout'
import { getNotificationDestination } from '../utils/notificationDestination'
import { formatNotificationTime } from '../utils/notificationMapper'

const PAGE_SIZE = 15
const filters = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
]

export default function CandidateNotifications() {
  const navigate = useNavigate()
  const selectAllRef = useRef(null)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingReadIds, setMarkingReadIds] = useState(() => new Set())
  const [deletingIds, setDeletingIds] = useState(() => new Set())
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [isDeletingSelected, setIsDeletingSelected] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  useEffect(() => {
    let active = true

    getNotifications({ filter, page, per_page: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        setNotifications(response.data)
        setPage(response.currentPage)
        setLastPage(response.lastPage)
        setTotal(response.total)
        setUnreadCount(response.unreadCount)
        setSelectedIds(new Set())
      })
      .catch((requestError) => {
        if (active) {
          setError(getNotificationErrorMessage(requestError, 'Notifications are unavailable right now.'))
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [filter, page, reloadKey])

  useEffect(() => {
    const refreshAfterExternalChange = (event) => {
      if (event.detail?.source === 'candidate-page') return
      setIsLoading(true)
      setError('')
      setReloadKey((current) => current + 1)
    }

    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refreshAfterExternalChange)
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refreshAfterExternalChange)
    }
  }, [])

  const visibleIds = useMemo(
    () => notifications.map((notification) => notification.id),
    [notifications],
  )
  const visibleIdSet = useMemo(() => new Set(visibleIds), [visibleIds])
  const validSelectedIds = useMemo(
    () => new Set([...selectedIds].filter((id) => visibleIdSet.has(id))),
    [selectedIds, visibleIdSet],
  )
  const selectedVisibleCount = validSelectedIds.size
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const hasSelection = selectedVisibleCount > 0
  const isWorking = isMarkingAll || isDeletingSelected || isDeletingAll

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected
    }
  }, [allVisibleSelected, selectedVisibleCount])

  const removeFromPage = (ids) => {
    const removedIds = new Set(ids)
    setNotifications((items) => items.filter((item) => !removedIds.has(item.id)))
    setSelectedIds(new Set())
    setTotal((count) => Math.max(0, count - removedIds.size))
    if (notifications.every((item) => removedIds.has(item.id)) && page > 1) {
      setIsLoading(true)
      setPage((current) => current - 1)
    } else if (notifications.every((item) => removedIds.has(item.id)) && total > removedIds.size) {
      setIsLoading(true)
      setReloadKey((current) => current + 1)
    }
  }

  const openNotification = async (notification) => {
    if (markingReadIds.has(notification.id)) return

    if (!notification.isRead) {
      setMarkingReadIds((ids) => new Set(ids).add(notification.id))
      setError('')
      try {
        const response = await markNotificationAsRead(notification.id)
        setUnreadCount(response.unreadCount)
        if (filter === 'unread') {
          setNotifications((items) => items.filter((item) => item.id !== notification.id))
          setTotal((count) => Math.max(0, count - 1))
          setSelectedIds((ids) => {
            const next = new Set(ids)
            next.delete(notification.id)
            return next
          })
        } else {
          setNotifications((items) => items.map((item) => (
            item.id === notification.id ? response.notification : item
          )))
        }
        announceNotificationsChanged('candidate-page')
      } catch {
        setError('This update could not be marked as read, but you can still open it.')
      } finally {
        setMarkingReadIds((ids) => {
          const next = new Set(ids)
          next.delete(notification.id)
          return next
        })
      }
    }

    navigate(getNotificationDestination(notification, '/member/notifications'))
  }

  const changeFilter = (nextFilter) => {
    if (!filters.some((item) => item.id === nextFilter)) return
    if (nextFilter === filter) return
    setFilter(nextFilter)
    setPage(1)
    setSelectedIds(new Set())
    setIsLoading(true)
    setError('')
  }

  const selectNotification = (notificationId, selected) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (selected) next.add(notificationId)
      else next.delete(notificationId)
      return next
    })
  }

  const toggleAllVisible = () => {
    setSelectedIds(allVisibleSelected ? new Set() : new Set(visibleIds))
  }

  const deleteOne = async (notificationId) => {
    if (deletingIds.has(notificationId)) return
    setDeletingIds((ids) => new Set(ids).add(notificationId))
    setError('')
    try {
      const response = await deleteNotification(notificationId)
      removeFromPage([notificationId])
      setUnreadCount(response.unreadCount)
      announceNotificationsChanged('candidate-page')
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError, 'Unable to delete this notification.'))
    } finally {
      setDeletingIds((ids) => {
        const next = new Set(ids)
        next.delete(notificationId)
        return next
      })
    }
  }

  const deleteSelected = async () => {
    const ids = [...validSelectedIds]
    if (ids.length === 0 || isDeletingSelected) return

    setIsDeletingSelected(true)
    setError('')
    try {
      const response = await deleteSelectedNotifications(ids)
      removeFromPage(ids)
      setUnreadCount(response.unreadCount)
      announceNotificationsChanged('candidate-page')
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError, 'Unable to delete the selected notifications.'))
    } finally {
      setIsDeletingSelected(false)
    }
  }

  const deleteAll = async () => {
    if (isDeletingAll) return
    setIsDeletingAll(true)
    setError('')
    try {
      const response = await deleteAllNotifications()
      setNotifications([])
      setSelectedIds(new Set())
      setTotal(0)
      setPage(1)
      setLastPage(1)
      setUnreadCount(response.unreadCount)
      setShowDeleteAllConfirmation(false)
      announceNotificationsChanged('candidate-page')
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError, 'Unable to delete all notifications.'))
    } finally {
      setIsDeletingAll(false)
    }
  }

  const markAllRead = async () => {
    if (isMarkingAll) return
    setIsMarkingAll(true)
    setError('')
    try {
      const response = await markAllNotificationsAsRead()
      const readAt = new Date().toISOString()
      if (filter === 'unread') {
        setNotifications([])
        setTotal(0)
      } else {
        setNotifications((items) => items.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt ?? readAt,
        })))
      }
      setSelectedIds(new Set())
      setUnreadCount(response.unreadCount)
      announceNotificationsChanged('candidate-page')
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError, 'Unable to mark notifications as read.'))
    } finally {
      setIsMarkingAll(false)
    }
  }

  const emptyTitle = total === 0 && filter === 'all'
    ? 'You have no notifications.'
    : 'You are all caught up.'

  return (
    <CandidateLayout title="Notifications">
      <div className="mx-auto min-w-0 max-w-4xl">
        <section className="min-w-0">
          <p className="font-mono text-sm text-primary">Member updates</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Notifications</h2>
          <p className="mt-4 max-w-2xl leading-7 text-text-muted">
            Review useful updates about opportunities, projects, applications, proposals, and community events.
          </p>
        </section>

        {error && (
          <p role="alert" className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-text">{error}</p>
        )}

        <div className="mt-8 flex min-w-0 gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter notifications">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              disabled={isWorking}
              onClick={() => changeFilter(item.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-60 ${
                filter === item.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-muted hover:border-primary/50 hover:text-text-primary'
              }`}
            >
              {item.label}{item.id === 'unread' ? ` (${unreadCount})` : ''}
            </button>
          ))}
        </div>

        {!isLoading && total > 0 && (
          <div
            className="mt-5 flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-border bg-surface/70 px-3 py-2.5 sm:px-4"
            aria-label={hasSelection ? 'Notification selection actions' : 'Notification actions'}
          >
            <label className="mr-auto flex min-w-0 cursor-pointer items-center gap-2 text-sm text-text-primary">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                disabled={visibleIds.length === 0 || isWorking}
                onChange={toggleAllVisible}
                aria-label="Select all visible notifications"
                className="h-4 w-4 shrink-0 cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed"
              />
              <span className="break-words">
                {hasSelection ? `${selectedVisibleCount} selected` : 'Select all visible'}
              </span>
            </label>

            {hasSelection ? (
              <>
                <button type="button" disabled={isWorking} onClick={toggleAllVisible} className="shrink-0 rounded-md px-2.5 py-2 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-60">
                  {allVisibleSelected ? 'Deselect all' : 'Select all'}
                </button>
                <button type="button" disabled={isDeletingSelected} onClick={deleteSelected} className="shrink-0 rounded-md px-2.5 py-2 text-xs font-semibold text-danger-text hover:bg-danger/10 disabled:cursor-wait disabled:opacity-60">
                  {isDeletingSelected ? 'Deleting...' : 'Delete selected'}
                </button>
                <button type="button" disabled={isWorking} onClick={() => setSelectedIds(new Set())} className="shrink-0 rounded-md px-2.5 py-2 text-xs font-semibold text-text-muted hover:bg-surface-elevated hover:text-text-primary disabled:opacity-60">
                  Clear
                </button>
              </>
            ) : (
              <>
                {unreadCount > 0 && (
                  <button type="button" disabled={isMarkingAll} onClick={markAllRead} className="shrink-0 rounded-md px-2.5 py-2 text-xs font-semibold text-primary hover:bg-primary/10 disabled:cursor-wait disabled:opacity-60">
                    {isMarkingAll ? 'Marking...' : 'Mark all as read'}
                  </button>
                )}
                <button type="button" disabled={isWorking} onClick={() => setShowDeleteAllConfirmation(true)} className="shrink-0 rounded-md px-2.5 py-2 text-xs font-semibold text-text-muted hover:bg-danger/10 hover:text-danger-text disabled:opacity-60">
                  Delete all
                </button>
              </>
            )}
          </div>
        )}

        <section className="mt-4 min-w-0" aria-live="polite">
          {isLoading ? (
            <LoadingSpinner label="Loading notifications..." />
          ) : notifications.length > 0 ? (
            <div className="min-w-0 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface/45">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  selected={validSelectedIds.has(notification.id)}
                  selectionMode
                  onSelect={selectNotification}
                  onOpen={openNotification}
                  onDelete={deleteOne}
                  formattedTime={formatNotificationTime(notification.createdAt)}
                  disabled={markingReadIds.has(notification.id) || deletingIds.has(notification.id) || isWorking}
                  isDeleting={deletingIds.has(notification.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={emptyTitle}
              description={filter === 'all'
                ? 'Explore LinkPort to find opportunities, projects, and community activity.'
                : 'New member updates will appear here when they are available.'}
              actionLabel={filter === 'all' ? 'Explore LinkPort' : 'Browse opportunities'}
              onAction={() => navigate(filter === 'all' ? '/member/community' : '/member/opportunities')}
            />
          )}
        </section>

        {!isLoading && lastPage > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Notification pages">
            <Button variant="outline" size="sm" disabled={page <= 1 || isWorking} onClick={() => {
              setIsLoading(true)
              setError('')
              setPage((current) => Math.max(1, current - 1))
            }}>
              Previous
            </Button>
            <span className="text-xs text-text-muted">Page {page} of {lastPage}</span>
            <Button variant="outline" size="sm" disabled={page >= lastPage || isWorking} onClick={() => {
              setIsLoading(true)
              setError('')
              setPage((current) => Math.min(lastPage, current + 1))
            }}>
              Next
            </Button>
          </nav>
        )}
      </div>

      <Modal
        isOpen={showDeleteAllConfirmation}
        onClose={() => {
          if (!isDeletingAll) setShowDeleteAllConfirmation(false)
        }}
        title="Delete all notifications?"
        maxWidth="max-w-md"
        showCloseButton={false}
        footer={(
          <>
            <Button variant="outline" size="sm" disabled={isDeletingAll} onClick={() => setShowDeleteAllConfirmation(false)}>Cancel</Button>
            <Button variant="danger" size="sm" disabled={isDeletingAll} onClick={deleteAll}>
              {isDeletingAll ? 'Deleting...' : 'Delete all'}
            </Button>
          </>
        )}
      >
        <p className="text-sm leading-6 text-text-muted">This action cannot be undone.</p>
      </Modal>
    </CandidateLayout>
  )
}
