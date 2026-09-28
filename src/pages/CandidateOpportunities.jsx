import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getJobs } from '../api/jobsApi'
import { getProjects } from '../api/projectsApi'
import ActivityToastMessage from '../components/ActivityToastMessage'
import ApplyJobModal from '../components/ApplyJobModal'
import EmptyState from '../components/EmptyState'
import SectionTabs from '../components/SectionTabs'
import OpportunityCard from '../components/OpportunityCard'
import SendBidModal from '../components/SendBidModal'
import { getCandidateActivityPath } from '../config/candidateActivity'
import { jobToOpportunity, projectToOpportunity } from '../data/opportunityAdapters'
import { getSavedItemKey } from '../data/savedItemMapper'
import useSavedItems from '../hooks/useSavedItems'
import useToast from '../hooks/useToast'
import CandidateLayout from '../layouts/CandidateLayout'

const workStyleFilters = ['All work styles', 'Remote', 'Hybrid', 'On-site']
const opportunityCache = {
  data: null,
  request: null,
}

function loadOpportunities() {
  if (opportunityCache.data) return Promise.resolve(opportunityCache.data)
  if (opportunityCache.request) return opportunityCache.request

  opportunityCache.request = Promise.allSettled([
    getJobs({ per_page: 50, page: 1 }),
    getProjects({ per_page: 50, page: 1 }),
  ]).then(([jobsResult, projectsResult]) => {
    const result = {
      jobs: jobsResult.status === 'fulfilled' ? jobsResult.value.data.map(jobToOpportunity) : [],
      projects: projectsResult.status === 'fulfilled' ? projectsResult.value.data.map(projectToOpportunity) : [],
      jobsError: jobsResult.status === 'rejected',
      projectsError: projectsResult.status === 'rejected',
    }
    opportunityCache.data = result
    return result
  }).finally(() => {
    opportunityCache.request = null
  })

  return opportunityCache.request
}

function uniqueValues(items) {
  return [...new Set(items.filter(Boolean))].sort((first, second) => first.localeCompare(second))
}

export default function CandidateOpportunities({ section = 'jobs' }) {
  const savedItems = useSavedItems()
  const { showToast } = useToast()
  const [directory, setDirectory] = useState(() => opportunityCache.data ?? {
    jobs: [],
    projects: [],
    jobsError: false,
    projectsError: false,
  })
  const [isLoading, setIsLoading] = useState(() => !opportunityCache.data)
  const [search, setSearch] = useState('')
  const [workStyle, setWorkStyle] = useState('All work styles')
  const [jobType, setJobType] = useState('All job types')
  const [projectCategory, setProjectCategory] = useState('All categories')
  const [projectStatus, setProjectStatus] = useState('All statuses')
  const [sort, setSort] = useState('newest')
  const [applicationJob, setApplicationJob] = useState(null)
  const [bidProject, setBidProject] = useState(null)
  const isJobs = section !== 'projects'

  useEffect(() => {
    let active = true

    async function load() {
      const result = await loadOpportunities()
      if (!active) return
      setDirectory(result)
      setIsLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const jobTypes = useMemo(
    () => uniqueValues(directory.jobs.map((item) => item.employmentType)),
    [directory.jobs],
  )
  const projectCategories = useMemo(
    () => uniqueValues(directory.projects.map((item) => item.category)),
    [directory.projects],
  )
  const projectStatuses = useMemo(
    () => uniqueValues(directory.projects.map((item) => item.status)),
    [directory.projects],
  )

  const visibleOpportunities = useMemo(() => {
    const query = search.trim().toLowerCase()
    const sourceItems = isJobs ? directory.jobs : directory.projects

    return sourceItems
      .filter((opportunity) => {
        const matchesSearch = !query || [
          opportunity.title,
          opportunity.company,
          opportunity.description,
          opportunity.location,
          opportunity.category,
          ...opportunity.skills,
        ].some((value) => value?.toLowerCase().includes(query))

        if (isJobs) {
          const matchesWorkStyle = workStyle === 'All work styles' || opportunity.workStyle === workStyle
          const matchesJobType = jobType === 'All job types' || opportunity.employmentType === jobType
          return matchesSearch && matchesWorkStyle && matchesJobType
        }

        const matchesCategory = projectCategory === 'All categories' || opportunity.category === projectCategory
        const matchesStatus = projectStatus === 'All statuses' || opportunity.status === projectStatus
        return matchesSearch && matchesCategory && matchesStatus
      })
      .sort((first, second) => {
        if (sort === 'deadline') {
          const firstDeadline = Date.parse(first.deadline)
          const secondDeadline = Date.parse(second.deadline)
          return (Number.isFinite(firstDeadline) ? firstDeadline : Number.MAX_SAFE_INTEGER)
            - (Number.isFinite(secondDeadline) ? secondDeadline : Number.MAX_SAFE_INTEGER)
        }
        return (Date.parse(second.postedAt) || 0) - (Date.parse(first.postedAt) || 0)
      })
  }, [
    directory.jobs,
    directory.projects,
    isJobs,
    jobType,
    projectCategory,
    projectStatus,
    search,
    sort,
    workStyle,
  ])

  const clearFilters = () => {
    setSearch('')
    setWorkStyle('All work styles')
    setJobType('All job types')
    setProjectCategory('All categories')
    setProjectStatus('All statuses')
    setSort('newest')
  }

  const hasFilters = Boolean(
    search.trim()
    || sort !== 'newest'
    || (isJobs
      ? workStyle !== 'All work styles' || jobType !== 'All job types'
      : projectCategory !== 'All categories' || projectStatus !== 'All statuses'),
  )
  const activeError = isJobs ? directory.jobsError : directory.projectsError

  const runPrimaryAction = (opportunity) => {
    if (opportunity.source === 'job') setApplicationJob(opportunity.sourceData)
    else setBidProject(opportunity.sourceData)
  }

  return (
    <CandidateLayout title="Opportunities">
      <div className="min-w-0 max-w-full">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-sm text-primary">Find work worth doing</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Opportunities</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
              Explore company roles and scoped projects, then apply or submit a bid using your LinkPort profile.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link to={getCandidateActivityPath('applications')} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary hover:border-primary/50 hover:text-primary">Applications</Link>
            <Link to={getCandidateActivityPath('bids')} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary hover:border-primary/50 hover:text-primary">Bids</Link>
          </div>
        </section>

        <SectionTabs
          items={[
            { id: 'jobs', label: 'Jobs', path: '/member/opportunities/jobs', count: directory.jobs.length },
            { id: 'projects', label: 'Projects', path: '/member/opportunities/projects', count: directory.projects.length },
          ]}
          activeId={isJobs ? 'jobs' : 'projects'}
          label="Opportunity sections"
          className="mt-7"
        />

        <section className="mt-7" aria-label={isJobs ? 'Find jobs' : 'Find projects'}>
          <div className={`grid gap-3 ${isJobs ? 'md:grid-cols-[minmax(0,1fr)_12rem_12rem]' : 'md:grid-cols-[minmax(0,1fr)_12rem_12rem]'}`}>
            <div>
              <label htmlFor="opportunity-search" className="sr-only">Search {isJobs ? 'jobs' : 'projects'}</label>
              <input
                id="opportunity-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isJobs ? 'Search jobs by title, company, or skill...' : 'Search projects by title, company, or skill...'}
                className="w-full rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring"
              />
            </div>

            {isJobs ? (
              <>
                <label className="sr-only" htmlFor="job-type-filter">Employment type</label>
                <select id="job-type-filter" value={jobType} onChange={(event) => setJobType(event.target.value)} className="w-full rounded-xl border border-border bg-surface/70 px-3 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-focus-ring">
                  <option>All job types</option>
                  {jobTypes.map((value) => <option key={value}>{value}</option>)}
                </select>
                <label className="sr-only" htmlFor="work-style-filter">Work style</label>
                <select id="work-style-filter" value={workStyle} onChange={(event) => setWorkStyle(event.target.value)} className="w-full rounded-xl border border-border bg-surface/70 px-3 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-focus-ring">
                  {workStyleFilters.map((value) => <option key={value}>{value}</option>)}
                </select>
              </>
            ) : (
              <>
                <label className="sr-only" htmlFor="project-category-filter">Project category</label>
                <select id="project-category-filter" value={projectCategory} onChange={(event) => setProjectCategory(event.target.value)} className="w-full rounded-xl border border-border bg-surface/70 px-3 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-focus-ring">
                  <option>All categories</option>
                  {projectCategories.map((value) => <option key={value}>{value}</option>)}
                </select>
                <label className="sr-only" htmlFor="project-status-filter">Project status</label>
                <select id="project-status-filter" value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)} className="w-full rounded-xl border border-border bg-surface/70 px-3 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-focus-ring">
                  <option>All statuses</option>
                  {projectStatuses.map((value) => <option key={value}>{value}</option>)}
                </select>
              </>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-subtle">
              {isLoading ? 'Loading opportunities...' : `${visibleOpportunities.length} ${isJobs ? 'jobs' : 'projects'}`}
            </p>
            <div className="flex items-center gap-3">
              {hasFilters && <button type="button" onClick={clearFilters} className="text-sm font-medium text-primary hover:underline">Clear filters</button>}
              <label htmlFor="opportunity-sort" className="sr-only">Sort opportunities</label>
              <select id="opportunity-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary outline-none focus:border-primary">
                <option value="newest">Newest</option>
                <option value="deadline">Deadline soon</option>
              </select>
            </div>
          </div>
        </section>

        <section className="mt-6" aria-live="polite">
          {activeError && !isLoading && (
            <p role="alert" className="mb-5 rounded-xl border border-warning/25 bg-warning/5 px-4 py-3 text-sm text-warning-text">
              {isJobs ? 'Jobs' : 'Projects'} are temporarily unavailable. Please try again later.
            </p>
          )}

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading opportunities">
              {[0, 1, 2].map((item) => <div key={item} className="h-96 animate-pulse rounded-2xl border border-border bg-surface/45" />)}
            </div>
          ) : visibleOpportunities.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  isSaved={savedItems.savedKeys.has(getSavedItemKey(opportunity.source, opportunity.sourceId))}
                  onSavedChange={(nextSaved) => savedItems.updateSavedState(opportunity.source, opportunity.sourceId, nextSaved)}
                  onPrimaryAction={runPrimaryAction}
                />
              ))}
            </div>
          ) : !activeError && (
            <EmptyState
              title={search.trim() ? `No ${isJobs ? 'jobs' : 'projects'} match your search` : `No ${isJobs ? 'jobs' : 'projects'} available`}
              description="Try a broader search or clear the selected filters."
              actionLabel={hasFilters ? 'Clear filters' : undefined}
              onAction={hasFilters ? clearFilters : undefined}
            />
          )}
        </section>
      </div>

      {applicationJob && (
        <ApplyJobModal
          job={applicationJob}
          onClose={() => setApplicationJob(null)}
          onSuccess={(response) => {
            setApplicationJob(null)
            showToast(<ActivityToastMessage message={response.message ?? 'Application submitted successfully.'} tab="applications" />, 'success', 6000)
          }}
        />
      )}

      {bidProject && (
        <SendBidModal
          project={bidProject}
          onClose={() => setBidProject(null)}
          onSuccess={(response) => {
            setBidProject(null)
            showToast(<ActivityToastMessage message={response.message ?? 'Bid submitted successfully.'} tab="bids" />, 'success', 6000)
          }}
        />
      )}
    </CandidateLayout>
  )
}
