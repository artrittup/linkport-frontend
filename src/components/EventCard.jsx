import { Link } from 'react-router'
import { formatEventDate, formatEventTime } from '../data/mockEvents'

export default function EventCard({ event, isAttending = false }) {
  const visibleTopics = event.topics.slice(0, 3)
  const remainingTopics = Math.max(0, event.topics.length - visibleTopics.length)

  return (
    <article className="flex h-full min-w-0 max-w-full flex-col rounded-2xl border border-[#233554] bg-[#112240]/65 p-5 sm:p-6">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <span className="max-w-full break-words rounded-full border border-[#64ffda]/25 bg-[#64ffda]/5 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-[#64ffda]">
          {event.category}
        </span>
        {isAttending && (
          <span className="rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-2.5 py-1 text-xs font-medium text-[#86efac]">
            Attending
          </span>
        )}
      </div>

      <h3 className="mt-4 break-words text-xl font-semibold leading-snug text-[#e6f1ff]">{event.title}</h3>
      <p className="mt-3 break-words text-sm leading-6 text-[#8892b0]">{event.shortDescription}</p>

      <dl className="mt-5 space-y-2 border-t border-[#233554] pt-4 text-sm">
        <div className="flex min-w-0 flex-wrap gap-x-2">
          <dt className="text-[#64748b]">When</dt>
          <dd className="break-words text-[#a8b2d1]">{formatEventDate(event.date)} · {formatEventTime(event)}</dd>
        </div>
        <div className="flex min-w-0 flex-wrap gap-x-2">
          <dt className="text-[#64748b]">Where</dt>
          <dd className="break-words text-[#a8b2d1]">{event.location || event.format}</dd>
        </div>
        <div className="flex min-w-0 flex-wrap gap-x-2">
          <dt className="text-[#64748b]">By</dt>
          <dd className="break-words text-[#a8b2d1]">{event.organizer}</dd>
        </div>
      </dl>

      <div className="mt-4 flex min-w-0 flex-wrap gap-2">
        {visibleTopics.map((topic) => (
          <span key={topic} className="max-w-full break-words rounded-md border border-[#233554] px-2.5 py-1 text-xs text-[#8892b0]">{topic}</span>
        ))}
        {remainingTopics > 0 && <span className="rounded-md border border-[#233554] px-2.5 py-1 text-xs text-[#64748b]">+{remainingTopics}</span>}
      </div>

      <div className="mt-auto pt-6">
        <Link
          to={`/candidate/community/events/${event.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] transition-colors hover:bg-[#64ffda]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]"
        >
          View event
        </Link>
      </div>
    </article>
  )
}
