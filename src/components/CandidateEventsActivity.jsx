import { Link, useNavigate } from 'react-router'
import {
  formatCommunityEventDate,
  formatCommunityEventTime,
  getCommunityEventCategoryLabel,
  getCommunityEventLocationLabel,
} from '../data/communityEventMapper'
import EmptyState from './EmptyState'

export default function CandidateEventsActivity({ events, onRemove, removingEventId = '' }) {
  const navigate = useNavigate()

  if (events.length === 0) {
    return (
      <EmptyState
        title="You have not saved any events yet."
        description="Events marked as attending will appear in this list."
        actionLabel="Browse events"
        onAction={() => navigate('/member/community/events')}
      />
    )
  }

  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-2" aria-live="polite">
      {events.map((event) => (
        <article key={event.id} className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface/60 p-5">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <span className="max-w-full break-words rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-primary">{getCommunityEventCategoryLabel(event.category)}</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${event.status === 'cancelled' ? 'border-danger-soft/35 bg-danger-soft/10 text-danger-text' : 'border-success/30 bg-success/10 text-success-text'}`}>
              {event.status === 'cancelled' ? 'Cancelled' : 'Attending'}
            </span>
          </div>
          <h3 className="mt-4 break-words text-lg font-semibold text-text-primary">{event.title}</h3>
          <dl className="mt-4 space-y-2 border-y border-border py-4 text-sm">
            <div className="flex min-w-0 flex-wrap gap-x-2">
              <dt className="text-text-subtle">When</dt>
              <dd className="break-words text-text-secondary">{formatCommunityEventDate(event.startsAt)} · {formatCommunityEventTime(event.startsAt, event.endsAt)}</dd>
            </div>
            <div className="flex min-w-0 flex-wrap gap-x-2">
              <dt className="text-text-subtle">Where</dt>
              <dd className="break-words text-text-secondary">{getCommunityEventLocationLabel(event)}</dd>
            </div>
          </dl>
          <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
            <Link to={`/member/community/events/${event.id}`} className="inline-flex flex-1 items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">
              View event
            </Link>
            <button type="button" disabled={removingEventId === event.id} onClick={() => onRemove(event.id)} className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:border-danger-soft/50 hover:text-danger-soft disabled:cursor-not-allowed disabled:opacity-60">
              {removingEventId === event.id ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </article>
      ))}
    </section>
  )
}
