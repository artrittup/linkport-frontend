import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { getCompanyJobs } from '../api/jobsApi'
import { getCompanyProjects } from '../api/projectsApi'
import CompanyOpportunityCard from '../components/CompanyOpportunityCard'
import LoadingSpinner from '../components/LoadingSpinner'
import PostOpportunityMenu from '../components/PostOpportunityMenu'
import CompanyLayout from '../layouts/CompanyLayout'
import {
  mapJobOpportunity,
  mapProjectOpportunity,
  opportunityMatchesSearch,
} from '../utils/companyOpportunity'

const typeTabs = [
  { value: 'all', label: 'All' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'projects', label: 'Projects' },
  { value: 'internships', label: 'Internships' },
  { value: 'challenges', label: 'Challenges' },
]
const statuses = ['all', 'active', 'draft', 'closed', 'expired']
const initialSource = { items: [], loading: true, error: false }
const controlClasses = 'w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring'

function SourceMessage({ children, error = false }) {
  return (
    <p role={error ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm ${
      error
        ? 'border-danger/30 bg-danger/10 text-danger-text'
        : 'border-border bg-surface text-text-muted'
    }`}>
      {children}
    </p>
  )
}

export default function CompanyOpportunities() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedType = searchParams.get('type')?.toLowerCase()
  const requestedStatus = searchParams.get('status')?.toLowerCase()
  const type = typeTabs.some((tab) => tab.value === requestedType) ? requestedType : 'all'
  const status = statuses.includes(requestedStatus) ? requestedStatus : 'all'
  const [search, setSearch] = useState('')
  const [jobs, setJobs] = useState(initialSource)
  const [projects, setProjects] = useState(initialSource)

  useEffect(() => {
    let active = true
    getCompanyJobs({ per_page: 50, page: 1 }).then((response) => {
      if (active) setJobs({ items: response.data.map(mapJobOpportunity), loading: false, error: false })
    }).catch(() => {
      if (active) setJobs({ items: [], loading: false, error: true })
    })
    getCompanyProjects({ per_page: 50, page: 1 }).then((response) => {
      if (active) setProjects({ items: response.data.map(mapProjectOpportunity), loading: false, error: false })
    }).catch(() => {
      if (active) setProjects({ items: [], loading: false, error: true })
    })
    return () => { active = false }
  }, [])

  const updateQuery = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  const selectedItems = useMemo(() => {
    if (type === 'jobs') return jobs.items
    if (type === 'projects') return projects.items
    if (type === 'all') return [...jobs.items, ...projects.items]
    return []
  }, [jobs.items, projects.items, type])
  const query = search.trim().toLowerCase()
  const visibleItems = selectedItems.filter((item) =>
    (status === 'all' || item.statusGroup === status)
    && opportunityMatchesSearch(item, query),
  )
  const unsupported = type === 'internships' || type === 'challenges'
  const initialLoading = type === 'jobs'
    ? jobs.loading
    : type === 'projects'
      ? projects.loading
      : jobs.loading && projects.loading

  const clearFilters = () => {
    setSearch('')
    const next = new URLSearchParams(searchParams)
    next.delete('status')
    setSearchParams(next)
  }

  return (
    <CompanyLayout title="Opportunities">
      <div className="min-w-0 space-y-7">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-sm text-primary">Publishing</p>
            <h2 className="mt-2 text-3xl font-bold">Opportunities</h2>
            <p className="mt-2 max-w-2xl text-text-muted">Manage jobs and company projects from one clear workspace.</p>
          </div>
          <div className="w-full sm:w-auto sm:min-w-48"><PostOpportunityMenu /></div>
        </section>

        <nav className="flex max-w-full gap-1 overflow-x-auto border-b border-border" aria-label="Opportunity types">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-current={type === tab.value ? 'page' : undefined}
              onClick={() => updateQuery('type', tab.value)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                type === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="min-w-0">
            <label htmlFor="company-opportunity-search" className="sr-only">Search opportunities</label>
            <input
              id="company-opportunity-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, description, location, skills..."
              className={controlClasses}
            />
          </div>
          <div>
            <label htmlFor="company-opportunity-status" className="sr-only">Filter by status</label>
            <select id="company-opportunity-status" value={status} onChange={(event) => updateQuery('status', event.target.value)} className={controlClasses}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </section>

        {type === 'all' && jobs.error && <SourceMessage error>Jobs could not be loaded. Available projects are still shown.</SourceMessage>}
        {type === 'all' && projects.error && <SourceMessage error>Projects could not be loaded. Available jobs are still shown.</SourceMessage>}
        {type === 'all' && jobs.loading && !projects.loading && <SourceMessage>Jobs are still loading. Available projects are shown now.</SourceMessage>}
        {type === 'all' && projects.loading && !jobs.loading && <SourceMessage>Projects are still loading. Available jobs are shown now.</SourceMessage>}
        {type === 'jobs' && jobs.error && <SourceMessage error>Jobs could not be loaded right now.</SourceMessage>}
        {type === 'projects' && projects.error && <SourceMessage error>Projects could not be loaded right now.</SourceMessage>}

        {unsupported ? (
          <section className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
            <h3 className="text-xl font-semibold">{type === 'internships' ? 'Internships' : 'Challenges'} are coming later</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-text-muted">This opportunity type is not available yet. No placeholder records or publishing requests have been created.</p>
          </section>
        ) : (
          <>
            {initialLoading && <LoadingSpinner label={`Loading ${type === 'all' ? 'opportunities' : type}...`} />}
            {!initialLoading && visibleItems.length > 0 && (
              <section className="grid min-w-0 gap-5 lg:grid-cols-2">
                {visibleItems.map((item) => <CompanyOpportunityCard key={item.key} opportunity={item} />)}
              </section>
            )}
            {!initialLoading && visibleItems.length === 0 && !(type === 'jobs' && jobs.error) && !(type === 'projects' && projects.error) && !(type === 'all' && jobs.error && projects.error) && !(type === 'all' && (jobs.loading || projects.loading)) && (
              <section className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
                <h3 className="text-xl font-semibold">
                  {query || status !== 'all'
                    ? 'No opportunities match your search.'
                    : type === 'jobs'
                      ? 'You have not posted any jobs yet.'
                      : type === 'projects'
                        ? 'You have not posted any company projects yet.'
                        : 'You have not posted any opportunities yet.'}
                </h3>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {(query || status !== 'all') ? (
                    <button type="button" onClick={clearFilters} className="rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary">Clear search</button>
                  ) : (
                    <>
                      {(type === 'all' || type === 'jobs') && <Link to="/company/jobs/create" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast">Post a job</Link>}
                      {(type === 'all' || type === 'projects') && <Link to="/company/projects/create" className="rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary">Post a project</Link>}
                    </>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {!unsupported && <SourceMessage>Showing the first 50 records from each available opportunity type. Use the dedicated management pages for complete pagination.</SourceMessage>}
      </div>
    </CompanyLayout>
  )
}
