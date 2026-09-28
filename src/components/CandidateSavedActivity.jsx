import { useMemo, useState } from 'react'
import CommunityFeedCard from './CommunityFeedCard'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'
import { savedItemRecordToFeedItem } from '../data/savedItemMapper'

export default function CandidateSavedActivity({ savedItems }) {
  const [search, setSearch] = useState('')
  const items = savedItems.items.map(savedItemRecordToFeedItem).filter(Boolean)
  const query = search.trim().toLowerCase()
  const visibleItems = useMemo(() => items.filter((item) => !query || [item.title, item.description, item.author, ...(item.tags ?? [])].some((value) => String(value ?? '').toLowerCase().includes(query))), [items, query])

  if (savedItems.isLoading) return <LoadingSpinner label="Loading your saved items..." size="lg" />

  if (savedItems.error) {
    return (
      <EmptyState
        title="Unable to load saved items"
        description={savedItems.error}
        actionLabel="Try again"
        onAction={savedItems.retry}
      />
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing saved yet"
        description="Jobs, projects, and posts you save will appear here."
      />
    )
  }

  return (
    <section className="space-y-5" aria-live="polite">
      <label htmlFor="saved-activity-search" className="sr-only">Search saved items</label>
      <input id="saved-activity-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search saved jobs, projects, posts, and community items..." className="w-full rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring" />
      <div className="flex items-center justify-between gap-3"><p className="text-sm text-text-subtle">{visibleItems.length} {visibleItems.length === 1 ? 'saved item' : 'saved items'}</p>{query && <button type="button" onClick={() => setSearch('')} className="text-sm font-medium text-primary hover:underline">Clear search</button>}</div>
      {visibleItems.length > 0 ? visibleItems.map((item) => (
        <CommunityFeedCard
          key={item.id}
          item={item}
          onUnsaved={(changedItem) => savedItems.updateSavedState(changedItem.saveType, changedItem.saveId, false)}
          onSavedChange={(changedItem, nextSaved) => savedItems.updateSavedState(changedItem.saveType, changedItem.saveId, nextSaved)}
        />
      )) : <EmptyState title="No saved items match your search" description="Try a broader search." actionLabel="Clear search" onAction={() => setSearch('')} />}
    </section>
  )
}
