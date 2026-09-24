import { useMemo, useState } from 'react'
import { CIRCLE_CATEGORIES, CIRCLE_SORT_OPTIONS } from '../data/circles'
import CircleCard from './CircleCard'
import EmptyState from './EmptyState'

const activityOrder = {
  'Active today': 3,
  'New discussions': 2,
  'Active this week': 1,
}

function sortCircles(items, sort) {
  return [...items].sort((first, second) => {
    if (sort === 'active') return (activityOrder[second.activityLevel] ?? 0) - (activityOrder[first.activityLevel] ?? 0)
    if (sort === 'newest') return Date.parse(second.createdAt) - Date.parse(first.createdAt)
    if (sort === 'members') return second.memberCount - first.memberCount
    return Number(second.isRecommended) - Number(first.isRecommended)
      || (activityOrder[second.activityLevel] ?? 0) - (activityOrder[first.activityLevel] ?? 0)
  })
}

export default function DiscoverCirclesView({ circles, onJoin, onCreate, onPreview }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('recommended')

  const visibleCircles = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = circles.filter((circle) => {
      const matchesCategory = category === 'All' || circle.category === category
      const matchesSearch = !query || [
        circle.name,
        circle.tagline,
        circle.description,
        circle.category,
        circle.location,
        ...circle.tags,
      ].some((value) => value.toLowerCase().includes(query))
      return matchesCategory && matchesSearch
    })
    return sortCircles(filtered, sort)
  }, [category, circles, search, sort])

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setSort('recommended')
  }

  return (
    <section aria-labelledby="discover-circles-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="discover-circles-heading" className="text-2xl font-semibold text-text-primary">Discover Circles</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">Find welcoming communities built around shared interests, ambitions, and local ideas.</p>
        </div>
        <button type="button" onClick={onCreate} className="inline-flex w-fit rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">Create Circle</button>
      </div>

      <div className="mt-6 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_13rem]">
        <div>
          <label htmlFor="circle-search" className="sr-only">Search Circles</label>
          <input
            id="circle-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, topic, tag, or location..."
            className="w-full rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring"
          />
        </div>
        <div>
          <label htmlFor="circle-sort" className="sr-only">Sort Circles</label>
          <select id="circle-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="w-full rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-focus-ring">
            {CIRCLE_SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Filter Circles by category">
        {CIRCLE_CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${category === item ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted hover:border-primary/50 hover:text-text-primary'}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-text-subtle">{visibleCircles.length} {visibleCircles.length === 1 ? 'Circle' : 'Circles'}</p>
        {(search || category !== 'All' || sort !== 'recommended') && <button type="button" onClick={clearFilters} className="text-sm font-medium text-primary hover:underline">Clear filters</button>}
      </div>

      {visibleCircles.length > 0 ? (
        <div className="mt-5 grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleCircles.map((circle) => <CircleCard key={circle.id} circle={circle} onOpen={onPreview} onJoin={onJoin} />)}
        </div>
      ) : (
        <div className="mt-6 max-w-2xl">
          <EmptyState title="No Circles found" description="Try a broader search or choose another category." actionLabel="Clear filters" onAction={clearFilters} />
        </div>
      )}
    </section>
  )
}
