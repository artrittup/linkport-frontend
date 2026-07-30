import { Link } from 'react-router'
import {
  formatCommunityEventDate,
  formatCommunityEventTime,
  getCommunityEventCategoryLabel,
  getCommunityEventLocationLabel,
} from '../data/communityEventMapper'

export default function EventCard({ event, onRemove, isRemoving = false }) {
  const visibleTopics = event.topics.slice(0, 3)
  const remainingTopics = Math.max(0, event.topics.length - visibleTopics.length)

  return (
    <article className="flex h-full min-w-0 max-w-full flex-col rounded-2xl border border-border bg-surface/65 p-5 sm:p-6">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <span className="max-w-full break-words rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-primary">
          {getCommunityEventCategoryLabel(event.category)}
        </span>
        {event.status === 'cancelled' ? (
          <span className="rounded-full border border-danger-soft/35 bg-danger-soft/10 px-2.5 py-1 text-xs font-medium text-danger-text">Cancelled</span>
        ) : event.isAttending && (
          <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success-text">Attending</span>
        )}
      </div>

      <h3 className="mt-4 break-words text-xl font-semibold leading-snug text-text-primary">{event.title}</h3>
      {event.shortDescription && <p className="mt-3 break-words text-sm leading-6 text-text-muted">{event.shortDescription}</p>}

      <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex min-w-0 flex-wrap gap-x-2">
          <dt className="text-text-subtle">When</dt>
          <dd className="break-words text-text-secondary">{formatCommunityEventDate(event.startsAt)} · {formatCommunityEventTime(event.startsAt, event.endsAt)}</dd>
        </div>
        <div className="flex min-w-0 flex-wrap gap-x-2">
          <dt className="text-text-subtle">Where</dt>
          <dd className="break-words text-text-secondary">{getCommunityEventLocationLabel(event)}</dd>
        </div>
        {event.organizer && (
          <div className="flex min-w-0 flex-wrap gap-x-2">
            <dt className="text-text-subtle">By</dt>
            <dd className="break-words text-text-secondary">{event.organizer}</dd>
          </div>
        )}
      </dl>

      {visibleTopics.length > 0 && (
        <div className="mt-4 flex min-w-0 flex-wrap gap-2">
          {visibleTopics.map((topic) => (
            <span key={topic} className="max-w-full break-words rounded-md border border-border px-2.5 py-1 text-xs text-text-muted">{topic}</span>
          ))}
          {remainingTopics > 0 && <span className="rounded-md border border-border px-2.5 py-1 text-xs text-text-subtle">+{remainingTopics}</span>}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <Link to={`/member/community/events/${event.id}`} className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
          View event
        </Link>
        {onRemove && event.isAttending && (
          <button type="button" disabled={isRemoving} onClick={() => onRemove(event.id)} className="inline-flex w-full items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:border-danger-soft/50 hover:text-danger-soft disabled:cursor-not-allowed disabled:opacity-60">
            {isRemoving ? 'Removing...' : 'Remove from my events'}
          </button>
        )}
      </div>
    </article>
  )
}
