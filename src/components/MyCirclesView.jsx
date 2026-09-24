import { useMemo, useState } from 'react'
import CircleCard from './CircleCard'
import EmptyState from './EmptyState'

export default function MyCirclesView({ circles, onDiscover, onCreate, onPreview }) {
  const [search, setSearch] = useState('')
  const visibleCircles = useMemo(() => {
    const query = search.trim().toLowerCase()
    return circles
      .filter((circle) => circle.isJoined)
      .filter((circle) => !query || [circle.name, circle.tagline, circle.category, ...circle.tags]
        .some((value) => value.toLowerCase().includes(query)))
  }, [circles, search])
  const joinedCount = circles.filter((circle) => circle.isJoined).length

  return (
    <section aria-labelledby="my-circles-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="my-circles-heading" className="text-2xl font-semibold text-text-primary">My Circles</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">Communities you have joined for ongoing conversations, learning, and collaboration.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onDiscover} className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">Discover Circles</button>
          <button type="button" onClick={onCreate} className="rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">Create Circle</button>
        </div>
      </div>

      {joinedCount > 0 && (
        <div className="mt-6 max-w-lg">
          <label htmlFor="joined-circle-search" className="sr-only">Search joined Circles</label>
          <input
            id="joined-circle-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search My Circles..."
            className="w-full rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring"
          />
        </div>
      )}

      {joinedCount === 0 ? (
        <div className="mt-8 max-w-2xl">
          <EmptyState title="Your Circles will appear here" description="Join communities around your interests, goals, and ideas to start building your Circle list." actionLabel="Discover Circles" onAction={onDiscover} />
        </div>
      ) : visibleCircles.length === 0 ? (
        <p className="mt-8 rounded-xl border border-border bg-surface/50 p-6 text-sm text-text-muted">No joined Circles match your search.</p>
      ) : (
        <div className="mt-8 grid min-w-0 gap-5 md:grid-cols-2 xl:max-w-5xl">
          {visibleCircles.map((circle) => <CircleCard key={circle.id} circle={circle} onOpen={onPreview} primaryActionLabel="Open Circle" />)}
        </div>
      )}
    </section>
  )
}
