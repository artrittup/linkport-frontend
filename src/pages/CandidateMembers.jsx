import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import EmptyState from '../components/EmptyState'
import MemberCard from '../components/MemberCard'
import { MEMBER_INTERESTS, mockMembers } from '../data/mockMembers'
import CandidateLayout from '../layouts/CandidateLayout'

export default function CandidateMembers() {
  const [search, setSearch] = useState('')
  const [interest, setInterest] = useState('All')

  const visibleMembers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return mockMembers.filter((member) => {
      const matchesInterest = interest === 'All' || member.interests.includes(interest)
      const matchesSearch = !query || [
        member.name,
        member.headline,
        member.university,
        member.fieldOfStudy,
        ...member.skills,
        ...member.interests,
      ].some((value) => String(value ?? '').toLowerCase().includes(query))

      return matchesInterest && matchesSearch
    })
  }, [interest, search])

  const clearFilters = () => {
    setSearch('')
    setInterest('All')
  }
  const hasSearch = search.trim().length > 0
  const hasFilter = interest !== 'All'

  return (
    <CandidateLayout title="Community Members">
      <div className="min-w-0 max-w-full">
        <section className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-sm text-[#64ffda]">Member discovery</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">Community Members</h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#8892b0]">
              Discover people through their interests, skills, fields of study, and projects.
            </p>
          </div>
          <Link to="/candidate/profile" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] hover:bg-[#64ffda]/10">
            View my profile
          </Link>
        </section>

        <section className="mt-8 min-w-0 max-w-full" aria-label="Find community members">
          <label htmlFor="member-search" className="sr-only">Search community members</label>
          <input
            id="member-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, skill, university, or field..."
            className="w-full min-w-0 max-w-full rounded-xl border border-[#233554] bg-[#112240]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
          />

          <div className="mt-4 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter members by interest">
            {MEMBER_INTERESTS.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={interest === item}
                onClick={() => setInterest(item)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  interest === item
                    ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]'
                    : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/50 hover:text-[#e6f1ff]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 min-w-0 max-w-full" aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#64748b]">
              {visibleMembers.length} {visibleMembers.length === 1 ? 'member' : 'members'}
            </p>
            {(hasSearch || hasFilter) && (
              <button type="button" onClick={clearFilters} className="text-sm text-[#64ffda] hover:underline">Clear filters</button>
            )}
          </div>

          {visibleMembers.length > 0 ? (
            <div className="grid min-w-0 max-w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleMembers.map((member) => <MemberCard key={member.id} member={member} />)}
            </div>
          ) : (
            <EmptyState
              title={hasSearch ? 'No members match your search' : 'No members in this interest area'}
              description={hasSearch
                ? 'Try another name, skill, university, or field.'
                : 'Choose another interest to discover more members.'}
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          )}
        </section>
      </div>
    </CandidateLayout>
  )
}
