export const COMMUNITY_EVENT_CATEGORY_LABELS = {
  workshop: 'Workshop',
  meetup: 'Meetup',
  project_showcase: 'Project Showcase',
  career: 'Career',
  challenge: 'Challenge',
  community: 'Community',
}

export const COMMUNITY_EVENT_FORMAT_LABELS = {
  online: 'Online',
  in_person: 'In person',
  hybrid: 'Hybrid',
}

export const COMMUNITY_EVENT_STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  cancelled: 'Cancelled',
}

export const COMMUNITY_EVENT_CATEGORY_OPTIONS = [
  { value: '', label: 'All' },
  ...Object.entries(COMMUNITY_EVENT_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
]

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
})

function parseTimestamp(value) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function mapCommunityEvent(event) {
  if (!event || typeof event !== 'object') return null

  return {
    id: String(event.id),
    title: event.title ?? '',
    shortDescription: event.short_description ?? '',
    fullDescription: event.full_description ?? '',
    category: event.category ?? '',
    startsAt: event.starts_at ?? null,
    endsAt: event.ends_at ?? null,
    location: event.location ?? '',
    format: event.format ?? '',
    organizer: event.organizer ?? '',
    capacity: event.capacity !== null
      && event.capacity !== undefined
      && event.capacity !== ''
      && Number.isFinite(Number(event.capacity))
      ? Number(event.capacity)
      : null,
    topics: Array.isArray(event.topics) ? event.topics.filter(Boolean) : [],
    requirements: event.requirements ?? '',
    externalUrl: event.external_url ?? '',
    status: event.status ?? '',
    attendeeCount: Number.isFinite(Number(event.attendee_count)) ? Number(event.attendee_count) : 0,
    isAttending: Boolean(event.is_attending),
    createdAt: event.created_at ?? null,
    updatedAt: event.updated_at ?? null,
  }
}

export function getCommunityEventCategoryLabel(value) {
  return COMMUNITY_EVENT_CATEGORY_LABELS[value] ?? 'Event'
}

export function getCommunityEventFormatLabel(value) {
  return COMMUNITY_EVENT_FORMAT_LABELS[value] ?? ''
}

export function getCommunityEventStatusLabel(value) {
  return COMMUNITY_EVENT_STATUS_LABELS[value] ?? ''
}

export function formatCommunityEventDate(value) {
  const date = parseTimestamp(value)
  return date ? dateFormatter.format(date) : 'Date to be confirmed'
}

export function formatCommunityEventTime(startsAt, endsAt) {
  const start = parseTimestamp(startsAt)
  if (!start) return 'Time to be confirmed'

  const startLabel = timeFormatter.format(start)
  const end = parseTimestamp(endsAt)
  return end ? `${startLabel}–${timeFormatter.format(end)}` : startLabel
}

export function getCommunityEventLocationLabel(event) {
  return event?.location || getCommunityEventFormatLabel(event?.format) || 'Location to be confirmed'
}

export function getSafeCommunityEventUrl(value) {
  if (!value) return ''

  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''
  } catch {
    return ''
  }
}

export function isCommunityEventFull(event) {
  return event?.capacity !== null
    && event?.capacity !== undefined
    && event.attendeeCount >= event.capacity
}
