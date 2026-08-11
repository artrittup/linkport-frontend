import { useMemo, useState } from 'react'
import { communityDiscussions, DISCUSSION_TYPES } from '../data/communityContent'

export default function CommunityDiscussionsView() {
  const [search, setSearch] = useState('')
  const [circle, setCircle] = useState('All')
  const [type, setType] = useState('All')
  const [sort, setSort] = useState('recent')
  const circleOptions = useMemo(
    () => ['All', ...new Set(communityDiscussions.map((discussion) => discussion.circleName))],
    [],
  )
  const visibleDiscussions = useMemo(() => {
    const query = search.trim().toLowerCase()
    return communityDiscussions
      .filter((discussion) => circle === 'All' || discussion.circleName === circle)
      .filter((discussion) => type === 'All' || discussion.type === type)
      .filter((discussion) => !query || [discussion.title, discussion.summary, discussion.circleName, discussion.type]
        .some((value) => value.toLowerCase().includes(query)))
      .sort((first, second) => sort === 'active'
        ? second.replyCount - first.replyCount
        : Date.parse(second.lastActivityAt) - Date.parse(first.lastActivityAt))
  }, [circle, search, sort, type])

  const clearFilters = () => {
    setSearch('')
    setCircle('All')
    setType('All')
    setSort('recent')
  }

  return (
    <section aria-labelledby="community-discussions-heading">
      <h2 id="community-discussions-heading" className="text-2xl font-semibold text-text-primary">Discussions</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">Find focused questions, advice, and conversations across LinkPort Circles.</p>

      <div className="mt-6 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_10rem]">
        <div>
          <label htmlFor="discussion-search" className="sr-only">Search discussions</label>
          <input id="discussion-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search discussions..." className="w-full rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring" />
        </div>
        <div>
          <label htmlFor="discussion-circle" className="sr-only">Filter by Circle</label>
          <select id="discussion-circle" value={circle} onChange={(event) => setCircle(event.target.value)} className="w-full rounded-xl border border-border bg-surface/70 px-3 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-focus-ring">
            {circleOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="discussion-type" className="sr-only">Filter by discussion type</label>
          <select id="discussion-type" value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-xl border border-border bg-surface/70 px-3 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-focus-ring">
            {DISCUSSION_TYPES.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="discussion-sort" className="sr-only">Sort discussions</label>
          <select id="discussion-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="w-full rounded-xl border border-border bg-surface/70 px-3 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-focus-ring">
            <option value="recent">Most recent</option>
            <option value="active">Most active</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-text-subtle">{visibleDiscussions.length} {visibleDiscussions.length === 1 ? 'discussion' : 'discussions'}</p>
        {(search || circle !== 'All' || type !== 'All' || sort !== 'recent') && <button type="button" onClick={clearFilters} className="text-sm font-semibold text-primary hover:underline">Clear filters</button>}
      </div>

      {visibleDiscussions.length > 0 ? (
        <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-2">
          {visibleDiscussions.map((discussion) => (
            <article key={discussion.id} className="min-w-0 rounded-xl border border-border bg-surface/55 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{discussion.type}</span>
                <span className="text-xs text-text-subtle">{discussion.activityLabel}</span>
              </div>
              <h3 className="mt-3 break-words text-lg font-semibold leading-7 text-text-primary">{discussion.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">{discussion.summary}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-text-secondary">
                <span>{discussion.circleName}</span>
                <span>{discussion.replyCount} replies</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-border bg-surface/50 p-6 text-sm text-text-muted">No discussions match the current filters.</p>
      )}
    </section>
  )
}
