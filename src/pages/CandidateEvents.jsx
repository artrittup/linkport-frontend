import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getCommunityEventErrorMessage, removeCommunityEventAttendance } from '../api/communityEventsApi'
import EmptyState from '../components/EmptyState'
import EventCard from '../components/EventCard'
import { COMMUNITY_EVENT_CATEGORY_OPTIONS } from '../data/communityEventMapper'
import useCommunityEvents, { useMyCommunityEvents } from '../hooks/useCommunityEvents'
import CandidateLayout from '../layouts/CandidateLayout'

export default function CandidateEvents() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showMyEvents, setShowMyEvents] = useState(false)
  const [page, setPage] = useState(1)
  const [removingEventId, setRemovingEventId] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [search])

  const allEvents = useCommunityEvents({
    search: debouncedSearch,
    category,
    page,
    perPage: 12,
    enabled: !showMyEvents,
  })
  const myEvents = useMyCommunityEvents({
    search: debouncedSearch,
    category,
    page,
    perPage: 50,
    enabled: showMyEvents,
  })
  const result = showMyEvents ? myEvents : allEvents

  const clearFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setCategory('')
    setShowMyEvents(false)
    setPage(1)
  }

  async function handleRemove(eventId) {
    if (removingEventId) return
    setRemovingEventId(eventId)
    setActionError('')
    try {
      await removeCommunityEventAttendance(eventId)
      myEvents.retry()
    } catch (error) {
      setActionError(getCommunityEventErrorMessage(error, 'We could not remove this event. Please try again.'))
    } finally {
      setRemovingEventId('')
    }
  }

  const hasFilters = Boolean(search.trim() || category || showMyEvents)
  const emptyTitle = showMyEvents
    ? 'No events in My Events'
    : debouncedSearch
      ? 'No events match your search'
      : category
        ? 'No events in this category'
        : 'No upcoming events'
  const emptyDescription = showMyEvents
    ? 'Events you attend will appear here and remain available after you refresh.'
    : hasFilters
      ? 'Try another search or clear the current filters.'
      : 'New Community events will appear here when they are published.'

  return (
    <CandidateLayout title="Community Events">
      <div className="min-w-0 max-w-full">
        <section className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-sm text-[#64ffda]">Learn and build together</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">Community Events</h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#8892b0]">Join workshops, project sessions, meetups, career conversations, and community challenges.</p>
          </div>
          <Link to="/member/community" className="text-sm font-medium text-[#64ffda] hover:underline">Return to Community</Link>
        </section>

        <section className="mt-8 min-w-0 max-w-full" aria-label="Find community events">
          <label htmlFor="event-search" className="sr-only">Search community events</label>
          <input
            id="event-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by event, topic, organizer, or location..."
            className="w-full min-w-0 max-w-full rounded-xl border border-[#233554] bg-[#112240]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
          />
          <div className="mt-4 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter events">
            {COMMUNITY_EVENT_CATEGORY_OPTIONS.map((item) => (
              <button
                key={item.value || 'all'}
                type="button"
                role="tab"
                aria-selected={!showMyEvents && category === item.value}
                onClick={() => {
                  setCategory(item.value)
                  setShowMyEvents(false)
                  setPage(1)
                }}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${!showMyEvents && category === item.value ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]' : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/50 hover:text-[#e6f1ff]'}`}
              >
                {item.label}
              </button>
            ))}
            <button type="button" role="tab" aria-selected={showMyEvents} onClick={() => {
              setShowMyEvents(true)
              setPage(1)
            }} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${showMyEvents ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]' : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/50 hover:text-[#e6f1ff]'}`}>
              My Events
            </button>
          </div>
        </section>

        <section className="mt-8 min-w-0 max-w-full" aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#64748b]">{result.meta.total} {result.meta.total === 1 ? 'event' : 'events'}</p>
            {hasFilters && <button type="button" onClick={clearFilters} className="text-sm text-[#64ffda] hover:underline">Clear filters</button>}
          </div>

          {actionError && <p role="alert" className="mb-5 rounded-lg border border-[#f87171]/25 bg-[#f87171]/5 px-4 py-3 text-sm text-[#fca5a5]">{actionError}</p>}

          {result.isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading community events">
              {[0, 1, 2].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl border border-[#233554] bg-[#112240]/45" />)}
            </div>
          ) : result.error ? (
            <EmptyState title="Events are unavailable" description={result.error} actionLabel="Try again" onAction={result.retry} />
          ) : result.events.length > 0 ? (
            <>
              <div className="grid min-w-0 max-w-full gap-5 md:grid-cols-2 xl:grid-cols-3">
                {result.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRemove={showMyEvents ? handleRemove : undefined}
                    isRemoving={removingEventId === event.id}
                  />
                ))}
              </div>
              {result.meta.last_page > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Event pages">
                  <button type="button" disabled={page <= 1 || result.isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-[#233554] px-4 py-2 text-sm text-[#a8b2d1] hover:border-[#64ffda]/50 hover:text-[#64ffda] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                  <span className="text-sm text-[#64748b]">Page {result.meta.current_page} of {result.meta.last_page}</span>
                  <button type="button" disabled={page >= result.meta.last_page || result.isLoading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-[#233554] px-4 py-2 text-sm text-[#a8b2d1] hover:border-[#64ffda]/50 hover:text-[#64ffda] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                </nav>
              )}
            </>
          ) : (
            <EmptyState title={emptyTitle} description={emptyDescription} actionLabel={hasFilters ? 'Clear filters' : 'Return to Community'} onAction={hasFilters ? clearFilters : () => window.history.back()} />
          )}
        </section>
      </div>
    </CandidateLayout>
  )
}
