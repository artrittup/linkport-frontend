import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import EmptyState from '../components/EmptyState'
import MemberCard from '../components/MemberCard'
import { INTEREST_OPTIONS } from '../data/communityMemberMapper'
import useCommunityMembers from '../hooks/useCommunityMembers'
import CandidateLayout from '../layouts/CandidateLayout'

export default function CandidateMembers() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [interest, setInterest] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [search])

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
    setInterest('')
    setPage(1)
  }
  const hasFilters = Boolean(search.trim() || interest)

  return (
    <CandidateLayout title="Community Members">
      <div className="min-w-0 max-w-full">
        <section className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-sm text-[#64ffda]">Member discovery</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">Community Members</h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#8892b0]">Discover people through their interests, skills, fields of study, and projects.</p>
          </div>
          <Link to="/member/profile" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] hover:bg-[#64ffda]/10">View my profile</Link>
        </section>

        <section className="mt-8 min-w-0 max-w-full" aria-label="Find community members">
          <label htmlFor="member-search" className="sr-only">Search community members</label>
          <input
            id="member-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, skill, university, field, or location..."
            className="w-full min-w-0 max-w-full rounded-xl border border-[#233554] bg-[#112240]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
          />
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
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${interest === item.value ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]' : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/50 hover:text-[#e6f1ff]'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 min-w-0 max-w-full" aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#64748b]">{meta.total} {meta.total === 1 ? 'member' : 'members'}</p>
            {hasFilters && <button type="button" onClick={clearFilters} className="text-sm text-[#64ffda] hover:underline">Clear filters</button>}
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading community members">
              {[0, 1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl border border-[#233554] bg-[#112240]/45" />)}
            </div>
          ) : error ? (
            <EmptyState title="Members are unavailable" description={error} actionLabel="Try again" onAction={retry} />
          ) : members.length > 0 ? (
            <>
              <div className="grid min-w-0 max-w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {members.map((member) => <MemberCard key={member.id} member={member} />)}
              </div>
              {meta.last_page > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Member pages">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-[#233554] px-4 py-2 text-sm text-[#a8b2d1] hover:border-[#64ffda]/50 hover:text-[#64ffda] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                  <span className="text-sm text-[#64748b]">Page {meta.current_page} of {meta.last_page}</span>
                  <button type="button" disabled={page >= meta.last_page} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-[#233554] px-4 py-2 text-sm text-[#a8b2d1] hover:border-[#64ffda]/50 hover:text-[#64ffda] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
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
    </CandidateLayout>
  )
}
