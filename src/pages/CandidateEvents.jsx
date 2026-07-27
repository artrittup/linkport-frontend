import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import EmptyState from '../components/EmptyState'
import EventCard from '../components/EventCard'
import { useLocalContent } from '../context/LocalContentContext'
import { EVENT_CATEGORIES, mockEvents } from '../data/mockEvents'
import CandidateLayout from '../layouts/CandidateLayout'

const validEventIds = new Set(mockEvents.map((event) => event.id))

export default function CandidateEvents() {
  const { attendingEventIds, storageError } = useLocalContent()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showMyEvents, setShowMyEvents] = useState(false)

  const attendingEventIdSet = useMemo(
    () => new Set(attendingEventIds.filter((eventId) => validEventIds.has(eventId))),
    [attendingEventIds],
  )
  const visibleEvents = useMemo(() => {
    const query = search.trim().toLowerCase()

    return mockEvents.filter((event) => {
      const matchesSaved = !showMyEvents || attendingEventIdSet.has(event.id)
      const matchesCategory = category === 'All' || event.category === category
      const matchesSearch = !query || [
        event.title,
        event.shortDescription,
        event.fullDescription,
        event.category,
        event.location,
        event.format,
        event.organizer,
        ...event.topics,
      ].some((value) => String(value ?? '').toLowerCase().includes(query))

      return matchesSaved && matchesCategory && matchesSearch
    })
  }, [attendingEventIdSet, category, search, showMyEvents])

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setShowMyEvents(false)
  }
  const hasSearch = search.trim().length > 0
  const hasCategoryFilter = category !== 'All'

  let emptyTitle = 'No events match these filters'
  let emptyDescription = 'Try another category or clear the current search.'
  let emptyAction = 'Clear filters'

  if (showMyEvents && attendingEventIdSet.size === 0) {
    emptyTitle = 'No saved events yet'
    emptyDescription = 'Mark an event as attending to keep it in your LinkPort list.'
    emptyAction = 'Browse events'
  } else if (hasSearch) {
    emptyTitle = 'No events match your search'
    emptyDescription = 'Try another title, topic, category, or location.'
  } else if (hasCategoryFilter) {
    emptyTitle = 'No events in this category'
    emptyDescription = 'Choose another category to browse upcoming events.'
  } else if (showMyEvents) {
    emptyTitle = 'No saved events match these filters'
    emptyDescription = 'Clear the filters to see all events saved to your list.'
  }

  return (
    <CandidateLayout title="Community Events">
      <div className="min-w-0 max-w-full">
        <section className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-sm text-[#64ffda]">Learn and build together</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">Community Events</h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#8892b0]">
              Join workshops, project sessions, meetups, career conversations, and community challenges.
            </p>
          </div>
          <Link to="/candidate/community" className="text-sm font-medium text-[#64ffda] hover:underline">Return to Community</Link>
        </section>

        {storageError && (
          <p role="status" className="mt-6 rounded-lg border border-[#facc15]/25 bg-[#facc15]/5 px-4 py-3 text-sm text-[#fde68a]">{storageError}</p>
        )}

        <section className="mt-8 min-w-0 max-w-full" aria-label="Find community events">
          <label htmlFor="event-search" className="sr-only">Search community events</label>
          <input
            id="event-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by event, topic, category, or location..."
            className="w-full min-w-0 max-w-full rounded-xl border border-[#233554] bg-[#112240]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
          />

          <div className="mt-4 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter events">
            {EVENT_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={!showMyEvents && category === item}
                onClick={() => {
                  setCategory(item)
                  setShowMyEvents(false)
                }}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  !showMyEvents && category === item
                    ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]'
                    : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/50 hover:text-[#e6f1ff]'
                }`}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              role="tab"
              aria-selected={showMyEvents}
              onClick={() => {
                setCategory('All')
                setShowMyEvents(true)
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                showMyEvents
                  ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]'
                  : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/50 hover:text-[#e6f1ff]'
              }`}
            >
              My events ({attendingEventIdSet.size})
            </button>
          </div>
        </section>

        <section className="mt-8 min-w-0 max-w-full" aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#64748b]">
              {visibleEvents.length} {visibleEvents.length === 1 ? 'event' : 'events'}
            </p>
            {(hasSearch || hasCategoryFilter || showMyEvents) && (
              <button type="button" onClick={clearFilters} className="text-sm text-[#64ffda] hover:underline">Clear filters</button>
            )}
          </div>

          {visibleEvents.length > 0 ? (
            <div className="grid min-w-0 max-w-full gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleEvents.map((event) => (
                <EventCard key={event.id} event={event} isAttending={attendingEventIdSet.has(event.id)} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              actionLabel={emptyAction}
              onAction={clearFilters}
            />
          )}
        </section>
      </div>
    </CandidateLayout>
  )
}
