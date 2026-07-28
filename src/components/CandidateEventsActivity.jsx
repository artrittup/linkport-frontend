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
        onAction={() => navigate('/candidate/community/events')}
      />
    )
  }

  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-2" aria-live="polite">
      {events.map((event) => (
        <article key={event.id} className="flex min-w-0 flex-col rounded-2xl border border-[#233554] bg-[#112240]/60 p-5">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <span className="max-w-full break-words rounded-full border border-[#64ffda]/25 bg-[#64ffda]/5 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-[#64ffda]">{getCommunityEventCategoryLabel(event.category)}</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${event.status === 'cancelled' ? 'border-[#f87171]/35 bg-[#f87171]/10 text-[#fca5a5]' : 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#86efac]'}`}>
              {event.status === 'cancelled' ? 'Cancelled' : 'Attending'}
            </span>
          </div>
          <h3 className="mt-4 break-words text-lg font-semibold text-[#e6f1ff]">{event.title}</h3>
          <dl className="mt-4 space-y-2 border-y border-[#233554] py-4 text-sm">
            <div className="flex min-w-0 flex-wrap gap-x-2">
              <dt className="text-[#64748b]">When</dt>
              <dd className="break-words text-[#a8b2d1]">{formatCommunityEventDate(event.startsAt)} · {formatCommunityEventTime(event.startsAt, event.endsAt)}</dd>
            </div>
            <div className="flex min-w-0 flex-wrap gap-x-2">
              <dt className="text-[#64748b]">Where</dt>
              <dd className="break-words text-[#a8b2d1]">{getCommunityEventLocationLabel(event)}</dd>
            </div>
          </dl>
          <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
            <Link to={`/candidate/community/events/${event.id}`} className="inline-flex flex-1 items-center justify-center rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] hover:bg-[#64ffda]/10">
              View event
            </Link>
            <button type="button" disabled={removingEventId === event.id} onClick={() => onRemove(event.id)} className="inline-flex items-center justify-center rounded-lg border border-[#233554] px-4 py-2.5 text-sm font-medium text-[#a8b2d1] hover:border-[#f87171]/50 hover:text-[#f87171] disabled:cursor-not-allowed disabled:opacity-60">
              {removingEventId === event.id ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </article>
      ))}
    </section>
  )
}
