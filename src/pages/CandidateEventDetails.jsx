import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  attendCommunityEvent,
  getCommunityEvent,
  getCommunityEventErrorMessage,
  isCommunityEventNotFound,
  removeCommunityEventAttendance,
} from '../api/communityEventsApi'
import {
  formatCommunityEventDate,
  formatCommunityEventTime,
  getCommunityEventCategoryLabel,
  getCommunityEventFormatLabel,
  getCommunityEventLocationLabel,
  getSafeCommunityEventUrl,
  isCommunityEventFull,
} from '../data/communityEventMapper'
import CandidateLayout from '../layouts/CandidateLayout'

function DetailSection({ title, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/55 p-5 sm:p-6">
      <h3 className="text-xl font-semibold text-[#e6f1ff]">{title}</h3>
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  )
}

function UnavailableEvent({ notFound, onRetry }) {
  return (
    <CandidateLayout title={notFound ? 'Event not found' : 'Event unavailable'}>
      <section className="mx-auto max-w-2xl rounded-2xl border border-[#233554] bg-[#112240]/65 p-8 text-center sm:p-10">
        <p className="font-mono text-sm text-[#64ffda]">Community events</p>
        <h2 className="mt-3 text-2xl font-bold text-[#e6f1ff]">{notFound ? 'Event not found' : 'Event is temporarily unavailable'}</h2>
        <p className="mt-3 text-sm leading-6 text-[#8892b0]">
          {notFound ? 'This event does not exist or is no longer available.' : 'We could not load this event. Please try again.'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!notFound && <button type="button" onClick={onRetry} className="inline-flex rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] hover:bg-[#64ffda]/10">Try again</button>}
          <Link to="/candidate/community/events" className="inline-flex rounded-lg border border-[#233554] px-4 py-2.5 text-sm font-semibold text-[#a8b2d1] hover:border-[#64ffda]/50 hover:text-[#64ffda]">Browse events</Link>
        </div>
      </section>
    </CandidateLayout>
  )
}

export default function CandidateEventDetails() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let isActive = true
    async function loadEvent() {
      setIsLoading(true)
      setNotFound(false)
      try {
        const response = await getCommunityEvent(eventId)
        if (isActive) setEvent(response.data)
      } catch (error) {
        if (!isActive) return
        setEvent(null)
        setNotFound(isCommunityEventNotFound(error) || error.response?.status === 403)
      } finally {
        if (isActive) setIsLoading(false)
      }
    }
    loadEvent()
    return () => {
      isActive = false
    }
  }, [eventId, refreshKey])

  async function updateAttendance(shouldAttend) {
    if (isSubmitting) return
    setIsSubmitting(true)
    setActionError('')
    try {
      const response = shouldAttend
        ? await attendCommunityEvent(event.id)
        : await removeCommunityEventAttendance(event.id)
      setEvent(response.data)
    } catch (error) {
      const fallback = shouldAttend
        ? 'We could not add this event to My Events. Please try again.'
        : 'We could not remove this event. Please try again.'
      setActionError(getCommunityEventErrorMessage(error, fallback))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <CandidateLayout title="Community Event">
        <div className="h-96 animate-pulse rounded-2xl border border-[#233554] bg-[#112240]/45" aria-label="Loading event details" />
      </CandidateLayout>
    )
  }

  if (!event || event.status === 'draft') {
    return <UnavailableEvent notFound={notFound || event?.status === 'draft'} onRetry={() => setRefreshKey((current) => current + 1)} />
  }

  const externalUrl = getSafeCommunityEventUrl(event.externalUrl)
  const isCancelled = event.status === 'cancelled'
  const isFull = isCommunityEventFull(event)
  const cannotAttend = isCancelled || (isFull && !event.isAttending)
  const capacityLabel = event.capacity === null
    ? event.attendeeCount > 0 ? `${event.attendeeCount} attending` : ''
    : `${event.attendeeCount} of ${event.capacity} attending`

  return (
    <CandidateLayout title={event.title}>
      <div className="min-w-0 max-w-full">
        <Link to="/candidate/community/events" className="text-sm font-medium text-[#64ffda] hover:underline">&larr; Back to events</Link>
        <header className="mt-6 min-w-0 rounded-2xl border border-[#233554] bg-[#112240]/65 p-5 sm:p-7">
          <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex max-w-full break-words rounded-full border border-[#64ffda]/25 bg-[#64ffda]/5 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-[#64ffda]">{getCommunityEventCategoryLabel(event.category)}</span>
                {isCancelled && <span className="rounded-full border border-[#f87171]/35 bg-[#f87171]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#fca5a5]">Cancelled</span>}
              </div>
              <h2 className="mt-4 max-w-4xl break-words text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">{event.title}</h2>
              <dl className="mt-6 grid min-w-0 gap-4 text-sm sm:grid-cols-2">
                <div><dt className="text-xs uppercase tracking-wide text-[#64748b]">Date and time</dt><dd className="mt-1 break-words text-[#e6f1ff]">{formatCommunityEventDate(event.startsAt)} · {formatCommunityEventTime(event.startsAt, event.endsAt)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-[#64748b]">Location</dt><dd className="mt-1 break-words text-[#e6f1ff]">{getCommunityEventLocationLabel(event)}</dd></div>
                {event.organizer && <div><dt className="text-xs uppercase tracking-wide text-[#64748b]">Organizer</dt><dd className="mt-1 break-words text-[#e6f1ff]">{event.organizer}</dd></div>}
                {event.format && <div><dt className="text-xs uppercase tracking-wide text-[#64748b]">Format</dt><dd className="mt-1 text-[#e6f1ff]">{getCommunityEventFormatLabel(event.format)}</dd></div>}
              </dl>
            </div>

            <div className="w-full min-w-0 shrink-0 rounded-xl border border-[#233554] bg-[#0a192f]/45 p-4 lg:w-72">
              {capacityLabel && <p className="mb-3 text-center text-sm text-[#a8b2d1]">{capacityLabel}</p>}
              {event.isAttending ? (
                <>
                  <div className="inline-flex w-full items-center justify-center rounded-lg border border-[#22c55e]/40 bg-[#22c55e]/10 px-4 py-2.5 text-sm font-semibold text-[#86efac]">Attending</div>
                  <button type="button" disabled={isSubmitting} onClick={() => updateAttendance(false)} className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-[#233554] px-4 py-2.5 text-sm font-semibold text-[#a8b2d1] hover:border-[#f87171]/50 hover:text-[#f87171] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Removing...' : 'Remove from My Events'}</button>
                </>
              ) : (
                <button type="button" disabled={isSubmitting || cannotAttend} onClick={() => updateAttendance(true)} className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] bg-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#071426] hover:bg-[#7dffe1] disabled:cursor-not-allowed disabled:border-[#233554] disabled:bg-[#233554] disabled:text-[#8892b0]">
                  {isCancelled ? 'Event cancelled' : isFull ? 'Event full' : isSubmitting ? 'Adding...' : 'Attend event'}
                </button>
              )}
              {actionError && <p role="alert" className="mt-3 break-words text-sm leading-5 text-[#fca5a5]">{actionError}</p>}
              <p className="mt-3 text-xs leading-5 text-[#64748b]">LinkPort attendance saves this event to My Events. It does not complete registration on an external site.</p>
            </div>
          </div>
        </header>

        <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)]">
          <DetailSection title="About">
            <p className="whitespace-pre-line break-words text-sm leading-6 text-[#a8b2d1]">{event.fullDescription || event.shortDescription || 'No event description is available.'}</p>
            {event.topics.length > 0 && <div className="mt-5"><h4 className="text-xs uppercase tracking-wide text-[#64748b]">Main topics</h4><div className="mt-2 flex min-w-0 flex-wrap gap-2">{event.topics.map((topic) => <span key={topic} className="max-w-full break-words rounded-full border border-[#64ffda]/25 bg-[#64ffda]/5 px-3 py-1.5 text-sm text-[#64ffda]">{topic}</span>)}</div></div>}
          </DetailSection>

          <DetailSection title="Event information">
            <dl className="space-y-5">
              {capacityLabel && <div><dt className="text-xs uppercase tracking-wide text-[#64748b]">Capacity</dt><dd className="mt-1 text-sm text-[#a8b2d1]">{capacityLabel}{isFull ? ' · Event full' : ''}</dd></div>}
              {event.requirements && <div><dt className="text-xs uppercase tracking-wide text-[#64748b]">Requirements</dt><dd className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-[#a8b2d1]">{event.requirements}</dd></div>}
              {externalUrl && <div><dt className="text-xs uppercase tracking-wide text-[#64748b]">External event link</dt><dd className="mt-2"><a href={externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full break-words rounded-lg border border-[#233554] px-3 py-2 text-sm font-medium text-[#a8b2d1] hover:border-[#64ffda]/50 hover:text-[#64ffda]">Open event information</a></dd></div>}
            </dl>
          </DetailSection>
        </div>
      </div>
    </CandidateLayout>
  )
}
