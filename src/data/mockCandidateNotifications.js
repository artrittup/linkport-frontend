import { getCandidateActivityPath } from '../config/candidateActivity.js'

const now = Date.now()
const minutesAgo = (minutes) => new Date(now - minutes * 60 * 1000).toISOString()
const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString()
const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString()

const notifications = [
  {
    id: 'opportunity-react-match',
    type: 'OPPORTUNITY',
    title: 'New frontend opportunity',
    message: 'A React internship matching your skills was added in Prishtina.',
    createdAt: minutesAgo(18),
    isRead: false,
    targetRoute: '/candidate/opportunities',
  },
  {
    id: 'event-portfolio-reminder',
    type: 'EVENT',
    title: 'Saved event starts soon',
    message: 'Your Portfolio Review Workshop is coming up next week.',
    createdAt: hoursAgo(2),
    isRead: false,
    targetRoute: '/candidate/community/events/portfolio-review-workshop',
  },
  {
    id: 'project-focusmate-team',
    type: 'PROJECT',
    title: 'FocusMate Mobile needs teammates',
    message: 'The project is looking for product design and backend support.',
    createdAt: hoursAgo(6),
    isRead: false,
    targetRoute: '/candidate/projects/focusmate-mobile',
  },
  {
    id: 'application-status-update',
    type: 'APPLICATION',
    title: 'Application status updated',
    message: 'One of your job applications has a new status.',
    createdAt: daysAgo(1),
    isRead: false,
    targetRoute: getCandidateActivityPath('applications'),
  },
  {
    id: 'proposal-status-update',
    type: 'PROPOSAL',
    title: 'Proposal reviewed',
    message: 'A company reviewed one of your submitted proposals.',
    createdAt: daysAgo(2),
    isRead: false,
    targetRoute: getCandidateActivityPath('proposals'),
  },
  {
    id: 'community-showcase-reminder',
    type: 'COMMUNITY',
    title: 'Community showcase this month',
    message: 'Meet project teams and share practical product feedback.',
    createdAt: daysAgo(3),
    isRead: true,
    targetRoute: '/candidate/community/events',
  },
  {
    id: 'community-project-added',
    type: 'PROJECT',
    title: 'New community project',
    message: 'Campus Sustainability Tracker shared its latest project update.',
    createdAt: daysAgo(5),
    isRead: true,
    targetRoute: '/candidate/projects/campus-sustainability-tracker',
  },
]

function notificationTimestamp(notification) {
  const timestamp = Date.parse(notification.createdAt)
  return Number.isFinite(timestamp) ? timestamp : 0
}

export const mockCandidateNotifications = [...notifications]
  .sort((first, second) => notificationTimestamp(second) - notificationTimestamp(first))

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

export function isCandidateNotificationRead(notification, readNotificationIds) {
  return notification.isRead || readNotificationIds.includes(notification.id)
}

export function getVisibleCandidateNotifications(readNotificationIds = [], deletedNotificationIds = []) {
  const safeReadIds = new Set(Array.isArray(readNotificationIds) ? readNotificationIds : [])
  const safeDeletedIds = new Set(Array.isArray(deletedNotificationIds) ? deletedNotificationIds : [])

  return mockCandidateNotifications
    .filter((notification) => !safeDeletedIds.has(notification.id))
    .map((notification) => ({
      ...notification,
      isRead: notification.isRead || safeReadIds.has(notification.id),
    }))
}
