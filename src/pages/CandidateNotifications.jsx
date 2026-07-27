import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import NotificationRow from '../components/NotificationRow'
import { useLocalContent } from '../context/LocalContentContext'
import {
  formatNotificationTime,
  getVisibleCandidateNotifications,
} from '../data/mockCandidateNotifications'
import CandidateLayout from '../layouts/CandidateLayout'

const filters = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
]

export default function CandidateNotifications() {
  const navigate = useNavigate()
  const selectAllRef = useRef(null)
  const [filter, setFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false)
  const {
    readNotificationIds,
    deletedNotificationIds,
    markCandidateNotificationRead,
    markAllCandidateNotificationsRead,
    deleteCandidateNotifications,
    storageError,
  } = useLocalContent()

  const notifications = useMemo(
    () => getVisibleCandidateNotifications(readNotificationIds, deletedNotificationIds),
    [deletedNotificationIds, readNotificationIds],
  )
  const unreadCount = notifications.filter((notification) => !notification.isRead).length
  const visibleNotifications = filter === 'unread'
    ? notifications.filter((notification) => !notification.isRead)
    : notifications
  const visibleIds = useMemo(
    () => visibleNotifications.map((notification) => notification.id),
    [visibleNotifications],
  )
  const visibleIdSet = useMemo(() => new Set(visibleIds), [visibleIds])
  const validSelectedIds = useMemo(
    () => new Set([...selectedIds].filter((id) => visibleIdSet.has(id))),
    [selectedIds, visibleIdSet],
  )
  const selectedVisibleCount = validSelectedIds.size
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const hasSelection = validSelectedIds.size > 0

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected
    }
  }, [allVisibleSelected, selectedVisibleCount])

  const openNotification = (notification) => {
    if (!notification.isRead) markCandidateNotificationRead(notification.id)
    navigate(notification.targetRoute)
  }

  const changeFilter = (nextFilter) => {
    setFilter(nextFilter)
    setSelectedIds(new Set())
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

  const deleteOne = (notificationId) => {
    deleteCandidateNotifications(notificationId)
    setSelectedIds((current) => {
      if (!current.has(notificationId)) return current
      const next = new Set(current)
      next.delete(notificationId)
      return next
    })
  }

  const deleteSelected = () => {
    deleteCandidateNotifications([...validSelectedIds])
    setSelectedIds(new Set())
  }

  const deleteAll = () => {
    deleteCandidateNotifications(notifications.map((notification) => notification.id))
    setSelectedIds(new Set())
    setShowDeleteAllConfirmation(false)
  }

  const markAllVisibleRead = () => {
    markAllCandidateNotificationsRead(visibleIds)
    setSelectedIds(new Set())
  }

  const everyNotificationDeleted = notifications.length === 0
  const emptyTitle = everyNotificationDeleted
    ? 'You have no notifications.'
    : 'You are all caught up.'

  return (
    <CandidateLayout title="Notifications">
      <div className="mx-auto min-w-0 max-w-4xl">
        <section className="min-w-0">
          <p className="font-mono text-sm text-[#64ffda]">Candidate updates</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">Notifications</h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#8892b0]">
            Review useful updates about opportunities, projects, applications, proposals, and community events.
          </p>
        </section>

        {storageError && (
          <p role="status" className="mt-6 rounded-lg border border-[#facc15]/25 bg-[#facc15]/5 px-4 py-3 text-sm text-[#fde68a]">{storageError}</p>
        )}

        <div className="mt-8 flex min-w-0 gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter notifications">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              onClick={() => changeFilter(item.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda] ${
                filter === item.id
                  ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]'
                  : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/50 hover:text-[#e6f1ff]'
              }`}
            >
              {item.label}{item.id === 'unread' ? ` (${unreadCount})` : ''}
            </button>
          ))}
        </div>

        {!everyNotificationDeleted && (
          <div
            className="mt-5 flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-[#233554] bg-[#112240]/70 px-3 py-2.5 sm:px-4"
            aria-label={hasSelection ? 'Notification selection actions' : 'Notification actions'}
          >
            <label className="mr-auto flex min-w-0 cursor-pointer items-center gap-2 text-sm text-[#e6f1ff]">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                disabled={visibleIds.length === 0}
                onChange={toggleAllVisible}
                aria-label="Select all visible notifications"
                className="h-4 w-4 shrink-0 cursor-pointer accent-[#64ffda] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda] focus-visible:ring-offset-2 focus-visible:ring-offset-[#112240] disabled:cursor-not-allowed"
              />
              <span className="break-words">
                {hasSelection ? `${validSelectedIds.size} selected` : 'Select all visible'}
              </span>
            </label>

            {hasSelection ? (
              <>
                <button type="button" onClick={toggleAllVisible} className="shrink-0 rounded-md px-2.5 py-2 text-xs font-semibold text-[#64ffda] hover:bg-[#64ffda]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]">
                  {allVisibleSelected ? 'Deselect all' : 'Select all'}
                </button>
                <button type="button" onClick={deleteSelected} className="shrink-0 rounded-md px-2.5 py-2 text-xs font-semibold text-[#fca5a5] hover:bg-[#ef4444]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]">
                  Delete selected
                </button>
                <button type="button" onClick={() => setSelectedIds(new Set())} className="shrink-0 rounded-md px-2.5 py-2 text-xs font-semibold text-[#8892b0] hover:bg-[#172a45] hover:text-[#e6f1ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]">
                  Clear
                </button>
              </>
            ) : (
              <>
                {visibleNotifications.some((notification) => !notification.isRead) && (
                  <button type="button" onClick={markAllVisibleRead} className="shrink-0 rounded-md px-2.5 py-2 text-xs font-semibold text-[#64ffda] hover:bg-[#64ffda]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]">
                    Mark all as read
                  </button>
                )}
                <button type="button" onClick={() => setShowDeleteAllConfirmation(true)} className="shrink-0 rounded-md px-2.5 py-2 text-xs font-semibold text-[#8892b0] hover:bg-[#ef4444]/10 hover:text-[#fca5a5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]">
                  Delete all
                </button>
              </>
            )}
          </div>
        )}

        <section className="mt-4 min-w-0" aria-live="polite">
          {visibleNotifications.length > 0 ? (
            <div className="min-w-0 divide-y divide-[#233554] overflow-hidden rounded-xl border border-[#233554] bg-[#112240]/45">
              {visibleNotifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  selected={validSelectedIds.has(notification.id)}
                  selectionMode
                  onSelect={selectNotification}
                  onOpen={openNotification}
                  onDelete={deleteOne}
                  formattedTime={formatNotificationTime(notification.createdAt)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={emptyTitle}
              description={everyNotificationDeleted
                ? 'Explore LinkPort to find opportunities, projects, and community activity.'
                : 'New Candidate updates will appear here when they are available.'}
              actionLabel={everyNotificationDeleted ? 'Explore LinkPort' : 'Browse opportunities'}
              onAction={() => navigate(everyNotificationDeleted ? '/candidate/community' : '/candidate/opportunities')}
            />
          )}
        </section>
      </div>

      <Modal
        isOpen={showDeleteAllConfirmation}
        onClose={() => setShowDeleteAllConfirmation(false)}
        title="Delete all notifications?"
        maxWidth="max-w-md"
        showCloseButton={false}
        footer={(
          <>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteAllConfirmation(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={deleteAll}>Delete all</Button>
          </>
        )}
      >
        <p className="text-sm leading-6 text-[#8892b0]">This action cannot be undone.</p>
      </Modal>
    </CandidateLayout>
  )
}
