import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { formatActivityDate } from '../data/candidateActivityAdapters'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'

const contentConfig = {
  projects: {
    label: 'projects',
    loading: 'Loading your projects...',
    errorTitle: 'Unable to load projects',
    emptyTitle: "You haven't created any projects yet.",
    emptyDescription: 'Projects you create will appear here.',
    actionLabel: 'Create a project',
    actionPath: '/member/create/project',
  },
  posts: {
    label: 'posts',
    loading: 'Loading your posts...',
    errorTitle: 'Unable to load posts',
    emptyTitle: "You haven't shared any posts yet.",
    emptyDescription: 'Posts you share with the community will appear here.',
    actionLabel: 'Create a post',
    actionPath: '/member/create/post',
  },
}

export default function CandidateContentActivity({ items, type, isLoading, error, retry }) {
  const navigate = useNavigate()
  const config = contentConfig[type]
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const visibleItems = useMemo(() => items.filter((item) => !query || [item.title, item.description, item.status].some((value) => String(value ?? '').toLowerCase().includes(query))), [items, query])

  if (isLoading) return <LoadingSpinner label={config.loading} size="lg" />

  if (error) {
    return <EmptyState title={config.errorTitle} description={error} actionLabel="Try again" onAction={retry} />
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={config.emptyTitle}
        description={config.emptyDescription}
        actionLabel={config.actionLabel}
        onAction={() => navigate(config.actionPath)}
      />
    )
  }

  return (
    <section className="min-w-0" aria-live="polite">
      <label htmlFor={`activity-${type}-search`} className="sr-only">Search {config.label}</label>
      <input
        id={`activity-${type}-search`}
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={`Search your ${config.label}...`}
        className="w-full rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring"
      />
      <div className="my-4 flex items-center justify-between gap-3">
        <p className="text-sm text-text-subtle">{visibleItems.length} {visibleItems.length === 1 ? config.label.slice(0, -1) : config.label}</p>
        {query && <button type="button" onClick={() => setSearch('')} className="text-sm font-medium text-primary hover:underline">Clear search</button>}
      </div>
      {visibleItems.length > 0 ? <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {visibleItems.map((item) => (
          <article key={item.id} className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface/60 p-5">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <span className="rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-primary">{item.label}</span>
              <span className="break-words text-xs text-text-subtle">{formatActivityDate(item.createdAt)}</span>
            </div>
            <h3 className="mt-4 break-words text-lg font-semibold text-text-primary">{item.title}</h3>
            <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-text-muted">{item.description}</p>
            <p className="mt-4 break-words text-xs font-medium text-text-secondary">{item.status}</p>
            <div className="mt-auto pt-5">
              <Link to={item.path} className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">
                {item.action}
              </Link>
            </div>
          </article>
        ))}
      </div> : (
        <EmptyState title={`No ${config.label} match your search`} description="Try a broader search." actionLabel="Clear search" onAction={() => setSearch('')} />
      )}
    </section>
  )
}
