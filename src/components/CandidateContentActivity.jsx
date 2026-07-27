import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { formatActivityDate } from '../data/candidateActivityAdapters'
import EmptyState from './EmptyState'

const contentFilters = ['All', 'Projects', 'Posts', 'Team requests']

export default function CandidateContentActivity({ items }) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const visibleItems = useMemo(
    () => filter === 'All' ? items : items.filter((item) => item.type === filter),
    [filter, items],
  )

  return (
    <section className="min-w-0" aria-live="polite">
      <div className="flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter shared content">
        {contentFilters.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={filter === item}
            onClick={() => setFilter(item)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              filter === item
                ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]'
                : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/50 hover:text-[#e6f1ff]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="my-4 text-sm text-[#64748b]">{visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}</p>

      {visibleItems.length > 0 ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          {visibleItems.map((item) => (
            <article key={item.id} className="flex min-w-0 flex-col rounded-2xl border border-[#233554] bg-[#112240]/60 p-5">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-[#64ffda]/25 bg-[#64ffda]/5 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-[#64ffda]">{item.label}</span>
                <span className="break-words text-xs text-[#64748b]">{formatActivityDate(item.createdAt)}</span>
              </div>
              <h3 className="mt-4 break-words text-lg font-semibold text-[#e6f1ff]">{item.title}</h3>
              <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-[#8892b0]">{item.description}</p>
              <p className="mt-4 break-words text-xs font-medium text-[#a8b2d1]">{item.status}</p>
              <div className="mt-auto pt-5">
                <Link to={item.path} className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] hover:bg-[#64ffda]/10">
                  {item.action}
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={items.length === 0 ? 'You have not shared anything yet.' : `No ${filter.toLowerCase()} shared yet`}
          description={items.length === 0 ? 'Projects, posts, and teammate requests you create will appear here.' : 'Choose another content type to review your activity.'}
          actionLabel={items.length === 0 ? 'Create something' : 'Show all content'}
          onAction={items.length === 0 ? () => navigate('/candidate/create/project') : () => setFilter('All')}
        />
      )}
    </section>
  )
}
