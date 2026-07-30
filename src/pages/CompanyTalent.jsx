import { useSearchParams } from 'react-router'
import CompanyTalentCard from '../components/CompanyTalentCard'
import EmptyState from '../components/EmptyState'
import {
  COLLABORATION_STATUS_OPTIONS,
  INTEREST_OPTIONS,
} from '../data/communityMemberMapper'
import useCommunityMembers from '../hooks/useCommunityMembers'
import CompanyLayout from '../layouts/CompanyLayout'

const controlClasses = 'w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring'

export default function CompanyTalent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const validInterests = new Set(INTEREST_OPTIONS.map((item) => item.value))
  const validStatuses = new Set(COLLABORATION_STATUS_OPTIONS.map((item) => item.value))
  const search = searchParams.get('search') ?? ''
  const skill = searchParams.get('skill') ?? ''
  const university = searchParams.get('university') ?? ''
  const requestedInterest = searchParams.get('interest') ?? ''
  const requestedStatus = searchParams.get('collaboration_status') ?? ''
  const interest = validInterests.has(requestedInterest) ? requestedInterest : ''
  const collaborationStatus = validStatuses.has(requestedStatus) ? requestedStatus : ''
  const requestedPage = Number(searchParams.get('page') ?? 1)
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const hasFilters = Boolean(search || skill || university || interest || collaborationStatus)
  const { members, meta, isLoading, error, retry } = useCommunityMembers({
    search,
    skill,
    university,
    interest,
    collaborationStatus,
    page,
    perPage: 12,
  })

  const submitFilters = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const next = new URLSearchParams()
    ;['search', 'skill', 'university', 'interest', 'collaboration_status'].forEach((key) => {
      const value = String(form.get(key) ?? '').trim()
      if (value) next.set(key, value)
    })
    setSearchParams(next)
  }

  const changePage = (nextPage) => {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) next.delete('page')
    else next.set('page', String(nextPage))
    setSearchParams(next)
  }

  return (
    <CompanyLayout title="Talent">
      <div className="min-w-0 space-y-7">
        <section>
          <p className="font-mono text-sm text-primary">Member discovery</p>
          <h2 className="mt-2 text-3xl font-bold">Talent</h2>
          <p className="mt-2 max-w-2xl text-text-muted">Discover students and graduates through their skills, interests, and projects.</p>
        </section>

        <form key={searchParams.toString()} method="get" onSubmit={submitFilters} className="grid min-w-0 gap-3 rounded-xl border border-border bg-surface/55 p-4 md:grid-cols-2 xl:grid-cols-5" aria-label="Talent filters">
          <div className="min-w-0 xl:col-span-2"><label htmlFor="talent-search" className="mb-1.5 block text-xs text-text-muted">Search</label><input id="talent-search" name="search" type="search" defaultValue={search} placeholder="Name, headline, field, location..." className={controlClasses} /></div>
          <div className="min-w-0"><label htmlFor="talent-skill" className="mb-1.5 block text-xs text-text-muted">Skill</label><input id="talent-skill" name="skill" defaultValue={skill} placeholder="e.g. React" className={controlClasses} /></div>
          <div className="min-w-0"><label htmlFor="talent-university" className="mb-1.5 block text-xs text-text-muted">University</label><input id="talent-university" name="university" defaultValue={university} placeholder="University name" className={controlClasses} /></div>
          <div className="min-w-0"><label htmlFor="talent-interest" className="mb-1.5 block text-xs text-text-muted">Interest</label><select id="talent-interest" name="interest" defaultValue={interest} className={controlClasses}>{INTEREST_OPTIONS.map((item) => <option key={item.value || 'all'} value={item.value}>{item.value ? item.label : 'All interests'}</option>)}</select></div>
          <div className="min-w-0 md:col-span-2 xl:col-span-2"><label htmlFor="talent-collaboration" className="mb-1.5 block text-xs text-text-muted">Collaboration status</label><select id="talent-collaboration" name="collaboration_status" defaultValue={collaborationStatus} className={controlClasses}><option value="">All statuses</option>{COLLABORATION_STATUS_OPTIONS.filter((item) => item.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
          <div className="flex flex-wrap items-end gap-2 md:col-span-2 xl:col-span-3">
            <button type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast">Apply filters</button>
            {hasFilters && <button type="button" onClick={() => setSearchParams({})} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-primary">Clear filters</button>}
          </div>
        </form>

        <section aria-live="polite">
          <p className="mb-4 text-sm text-text-subtle">{isLoading ? 'Loading members...' : `${meta.total} ${meta.total === 1 ? 'member' : 'members'}`}</p>
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading talent">{[0, 1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl border border-border bg-surface/45" />)}</div>
          ) : error ? (
            <EmptyState title="Talent directory unavailable" description="Member discovery could not be loaded. Please try again." actionLabel="Try again" onAction={retry} />
          ) : members.length > 0 ? (
            <>
              <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">{members.map((member) => <CompanyTalentCard key={member.id} member={member} />)}</div>
              {meta.last_page > 1 && <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Talent pages">
                <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)} className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary disabled:opacity-40">Previous</button>
                <span className="text-sm text-text-subtle">Page {meta.current_page} of {meta.last_page}</span>
                <button type="button" disabled={page >= meta.last_page} onClick={() => changePage(page + 1)} className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary disabled:opacity-40">Next</button>
              </nav>}
            </>
          ) : (
            <EmptyState title={hasFilters ? 'No members match your filters' : 'No members are available yet.'} description={hasFilters ? 'Try a broader search or clear the current filters.' : 'Active member profiles will appear here.'} actionLabel={hasFilters ? 'Clear filters' : undefined} onAction={hasFilters ? () => setSearchParams({}) : undefined} />
          )}
        </section>
      </div>
    </CompanyLayout>
  )
}
