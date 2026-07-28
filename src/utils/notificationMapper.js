export const NOTIFICATION_CATEGORY_LABELS = Object.freeze({
  opportunity: 'Opportunity',
  event: 'Event',
  project: 'Project',
  application: 'Application',
  proposal: 'Proposal',
  community: 'Community',
  system: 'System',
})

export function getNotificationCategoryLabel(category) {
  return NOTIFICATION_CATEGORY_LABELS[category] ?? 'Notification'
}

export function mapNotification(notification = {}) {
  const category = typeof notification.category === 'string'
    ? notification.category.toLowerCase()
    : 'system'
  const metadata = notification.metadata && typeof notification.metadata === 'object'
    ? notification.metadata
    : {}

  return {
    id: notification.id,
    eventType: notification.type ?? '',
    category,
    categoryLabel: getNotificationCategoryLabel(category),
    type: getNotificationCategoryLabel(category),
    title: notification.title ?? 'Notification',
    message: notification.message ?? '',
    targetRoute: notification.target_route ?? '',
    metadata,
    isRead: Boolean(notification.is_read),
    readAt: notification.read_at ?? null,
    createdAt: notification.created_at ?? null,
  }
}

export function mapNotificationsResponse(response = {}) {
  const data = Array.isArray(response.data)
    ? response.data.map(mapNotification)
    : []

  return {
    data,
    currentPage: Number(response.current_page ?? 1),
    lastPage: Math.max(1, Number(response.last_page ?? 1)),
    perPage: Number(response.per_page ?? data.length),
    total: Number(response.total ?? data.length),
    unreadCount: Number(response.unread_count ?? 0),
  }
}

export function formatNotificationTime(value) {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return 'Date unavailable'

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (elapsedSeconds < 60) return 'Just now'
  if (elapsedSeconds < 3600) {
    const minutes = Math.floor(elapsedSeconds / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }
  if (elapsedSeconds < 86400) {
    const hours = Math.floor(elapsedSeconds / 3600)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  if (elapsedSeconds < 172800) return 'Yesterday'
  if (elapsedSeconds < 604800) return `${Math.floor(elapsedSeconds / 86400)} days ago`

  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  }).format(date)
}
