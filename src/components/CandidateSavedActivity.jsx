import CommunityFeedCard from './CommunityFeedCard'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'
import { savedItemRecordToFeedItem } from '../data/savedItemMapper'
import useSavedItems from '../hooks/useSavedItems'

export default function CandidateSavedActivity() {
  const savedItems = useSavedItems()
  const items = savedItems.items.map(savedItemRecordToFeedItem).filter(Boolean)

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
        description="Save discussions, projects, events, jobs, and other opportunities to find them here."
      />
    )
  }

  return (
    <section className="space-y-5" aria-live="polite">
      <p className="text-sm text-text-subtle">{items.length} {items.length === 1 ? 'saved item' : 'saved items'}</p>
      {items.map((item) => (
        <CommunityFeedCard
          key={item.id}
          item={item}
          onUnsaved={(changedItem) => savedItems.updateSavedState(changedItem.saveType, changedItem.saveId, false)}
          onSavedChange={(changedItem, nextSaved) => savedItems.updateSavedState(changedItem.saveType, changedItem.saveId, nextSaved)}
        />
      ))}
    </section>
  )
}
