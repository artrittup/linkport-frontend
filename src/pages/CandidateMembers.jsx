import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import EmptyState from '../components/EmptyState'
import MemberCard from '../components/MemberCard'
import { INTEREST_OPTIONS } from '../data/communityMemberMapper'
import useCommunityConnections from '../hooks/useCommunityConnections'
import useCommunityMembers from '../hooks/useCommunityMembers'
import CandidateLayout from '../layouts/CandidateLayout'

export default function CandidateMembers({ embedded = false, showHeader = true, initialSearch = '', externalSearch, onClearSearch }) {
  const [search, setSearch] = useState(initialSearch)
  const effectiveSearch = externalSearch ?? search
  const [debouncedSearch, setDebouncedSearch] = useState(() => effectiveSearch.trim())
  const [interest, setInterest] = useState('')
  const [page, setPage] = useState(1)
  const connections = useCommunityConnections()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(effectiveSearch.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [effectiveSearch])

  const {
    members,
    meta,
    isLoading,
    error,
    retry,
  } = useCommunityMembers({
    search: debouncedSearch,
    interest,
    page,
    perPage: 12,
  })

  const clearFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    onClearSearch?.()
    setInterest('')
    setPage(1)
  }
  const hasFilters = Boolean(effectiveSearch.trim() || interest)

  const content = (
    <div className="min-w-0 max-w-full">
      {showHeader && (
        <section className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.13em] text-primary">People</p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">{embedded ? 'Find members' : 'Community Members'}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">Search by interests, skills, education, or location and meet people you have something in common with.</p>
          </div>
          <Link to="/member/profile" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">View my profile</Link>
        </section>
      )}

      <section className="mt-6 min-w-0 max-w-full" aria-label="Find community members">
        {!embedded && (
          <>
            <label htmlFor="member-search" className="sr-only">Search community members</label>
            <input
              id="member-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, skill, university, field, or location..."
              className="w-full min-w-0 max-w-full rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring"
            />
          </>
        )}
        <div className="mt-4 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter members by interest">
          {INTEREST_OPTIONS.map((item) => (
            <button
              key={item.value || 'all'}
              type="button"
              role="tab"
              aria-selected={interest === item.value}
              onClick={() => {
                setInterest(item.value)
                setPage(1)
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${interest === item.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted hover:border-primary/50 hover:text-text-primary'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-7 min-w-0 max-w-full" aria-live="polite">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-subtle">{meta.total} {meta.total === 1 ? 'member' : 'members'}</p>
          {hasFilters && <button type="button" onClick={clearFilters} className="text-sm text-primary hover:underline">Clear filters</button>}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading community members">
            {[0, 1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl border border-border bg-surface/45" />)}
          </div>
        ) : error ? (
          <EmptyState title="Members are unavailable" description={error} actionLabel="Try again" onAction={retry} />
        ) : members.length > 0 ? (
          <>
            <div className="grid min-w-0 max-w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  showConnection={!connections.error}
                  initialConnectionStatus={connections.isLoading
                    ? { status: 'loading' }
                    : connections.statuses.get(String(member.id)) ?? { status: 'none' }}
                />
              ))}
            </div>
            {meta.last_page > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Member pages">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                <span className="text-sm text-text-subtle">Page {meta.current_page} of {meta.last_page}</span>
                <button type="button" disabled={page >= meta.last_page} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">Next</button>
              </nav>
            )}
          </>
        ) : (
          <EmptyState
            title={debouncedSearch ? 'No members match your search' : interest ? 'No members in this interest area' : 'No community members yet'}
            description={hasFilters ? 'Try another search or interest area.' : 'Member profiles will appear here when they become available.'}
            actionLabel={hasFilters ? 'Clear filters' : 'Return to Community'}
            onAction={hasFilters ? clearFilters : () => window.history.back()}
          />
        )}
      </section>
    </div>
  )

  return embedded
    ? content
    : <CandidateLayout title="Community Members">{content}</CandidateLayout>
}
