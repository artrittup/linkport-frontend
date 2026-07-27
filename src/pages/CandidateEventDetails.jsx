import { Link, useParams } from 'react-router'
import { useLocalContent } from '../context/LocalContentContext'
import {
  formatEventDate,
  formatEventTime,
  getMockEvent,
  getSafeEventUrl,
} from '../data/mockEvents'
import CandidateLayout from '../layouts/CandidateLayout'

function DetailSection({ title, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/55 p-5 sm:p-6">
      <h3 className="text-xl font-semibold text-[#e6f1ff]">{title}</h3>
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  )
}

export default function CandidateEventDetails() {
  const { eventId } = useParams()
  const { attendingEventIds, setEventAttendance, storageError } = useLocalContent()
  const event = getMockEvent(eventId)

  if (!event) {
    return (
      <CandidateLayout title="Event not found">
        <section className="mx-auto max-w-2xl rounded-2xl border border-[#233554] bg-[#112240]/65 p-8 text-center sm:p-10">
          <p className="font-mono text-sm text-[#64ffda]">Community events</p>
          <h2 className="mt-3 text-2xl font-bold text-[#e6f1ff]">Event not found</h2>
          <p className="mt-3 text-sm leading-6 text-[#8892b0]">This event is not available in the Community events list.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/candidate/community/events" className="inline-flex rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] hover:bg-[#64ffda]/10">
              Browse events
            </Link>
            <Link to="/candidate/community" className="inline-flex rounded-lg border border-[#233554] px-4 py-2.5 text-sm font-semibold text-[#a8b2d1] hover:border-[#64ffda]/50 hover:text-[#64ffda]">
              Return to Community
            </Link>
          </div>
        </section>
      </CandidateLayout>
    )
  }

  const isAttending = attendingEventIds.includes(event.id)
  const externalUrl = getSafeEventUrl(event.externalUrl)

  return (
    <CandidateLayout title={event.title}>
      <div className="min-w-0 max-w-full">
        <Link to="/candidate/community/events" className="text-sm font-medium text-[#64ffda] hover:underline">&larr; Back to events</Link>

        {storageError && (
          <p role="status" className="mt-6 rounded-lg border border-[#facc15]/25 bg-[#facc15]/5 px-4 py-3 text-sm text-[#fde68a]">{storageError}</p>
        )}

        <header className="mt-6 min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/65 p-5 sm:p-7">
          <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex max-w-full break-words rounded-full border border-[#64ffda]/25 bg-[#64ffda]/5 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-[#64ffda]">{event.category}</span>
              <h2 className="mt-4 max-w-4xl break-words text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">{event.title}</h2>
              <dl className="mt-6 grid min-w-0 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#64748b]">Date and time</dt>
                  <dd className="mt-1 break-words text-[#e6f1ff]">{formatEventDate(event.date)} · {formatEventTime(event)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#64748b]">Location</dt>
                  <dd className="mt-1 break-words text-[#e6f1ff]">{event.location || event.format}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#64748b]">Organizer</dt>
                  <dd className="mt-1 break-words text-[#e6f1ff]">{event.organizer}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#64748b]">Format</dt>
                  <dd className="mt-1 text-[#e6f1ff]">{event.format}</dd>
                </div>
              </dl>
            </div>

            <div className="w-full min-w-0 shrink-0 rounded-xl border border-[#233554] bg-[#0a192f]/45 p-4 lg:w-72">
              {isAttending ? (
                <>
                  <button type="button" disabled className="inline-flex w-full cursor-default items-center justify-center rounded-lg border border-[#22c55e]/40 bg-[#22c55e]/10 px-4 py-2.5 text-sm font-semibold text-[#86efac]">
                    Attending
                  </button>
                  <button type="button" onClick={() => setEventAttendance(event.id, false)} className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-[#233554] px-4 py-2.5 text-sm font-semibold text-[#a8b2d1] transition-colors hover:border-[#f87171]/50 hover:text-[#f87171]">
                    Remove from my events
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setEventAttendance(event.id, true)} className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] bg-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#071426] transition-colors hover:bg-[#7dffe1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]">
                  Attend event
                </button>
              )}
              <p className="mt-3 text-xs leading-5 text-[#64748b]">This saves the event to your LinkPort list. Official registration will be added later.</p>
            </div>
          </div>
        </header>

        <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)]">
          <DetailSection title="About">
            <p className="whitespace-pre-line break-words text-sm leading-6 text-[#a8b2d1]">{event.fullDescription}</p>
            <div className="mt-5">
              <h4 className="text-xs uppercase tracking-wide text-[#64748b]">Main topics</h4>
              <div className="mt-2 flex min-w-0 flex-wrap gap-2">
                {event.topics.map((topic) => (
                  <span key={topic} className="max-w-full break-words rounded-full border border-[#64ffda]/25 bg-[#64ffda]/5 px-3 py-1.5 text-sm text-[#64ffda]">{topic}</span>
                ))}
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Event information">
            <dl className="space-y-5">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#64748b]">Who it is for</dt>
                <dd className="mt-1 break-words text-sm leading-6 text-[#a8b2d1]">{event.audience}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#64748b]">Capacity</dt>
                <dd className="mt-1 text-sm text-[#a8b2d1]">{event.capacity ? `${event.capacity} participants` : 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#64748b]">Requirements</dt>
                <dd className="mt-1">
                  {event.requirements.length > 0 ? (
                    <ul className="space-y-1 text-sm leading-6 text-[#a8b2d1]">
                      {event.requirements.map((requirement) => <li key={requirement} className="break-words">&bull; {requirement}</li>)}
                    </ul>
                  ) : (
                    <span className="text-sm text-[#8892b0]">No preparation is required.</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[#64748b]">External event link</dt>
                <dd className="mt-2">
                  {externalUrl ? (
                    <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full break-words rounded-lg border border-[#233554] px-3 py-2 text-sm font-medium text-[#a8b2d1] hover:border-[#64ffda]/50 hover:text-[#64ffda]">
                      Open event information
                    </a>
                  ) : (
                    <span className="text-sm leading-6 text-[#8892b0]">No external event link is available.</span>
                  )}
                </dd>
              </div>
            </dl>
          </DetailSection>
        </div>
      </div>
    </CandidateLayout>
  )
}
