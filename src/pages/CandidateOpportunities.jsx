import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getJobs } from '../api/jobsApi'
import { getProjects } from '../api/projectsApi'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import OpportunityCard from '../components/OpportunityCard'
import { getCandidateActivityPath } from '../config/candidateActivity'
import { jobToOpportunity, projectToOpportunity } from '../data/opportunityAdapters'
import CandidateLayout from '../layouts/CandidateLayout'

const typeFilters = ['All', 'Jobs', 'Internships', 'Projects']
const workStyleFilters = ['All work styles', 'Remote', 'Hybrid', 'On-site']

export default function CandidateOpportunities() {
  const [apiOpportunities, setApiOpportunities] = useState([])
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('All')
  const [workStyle, setWorkStyle] = useState('All work styles')
  const [jobsLoading, setJobsLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [jobsError, setJobsError] = useState(false)
  const [projectsError, setProjectsError] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadApiOpportunities() {
      const [jobsResult, projectsResult] = await Promise.allSettled([
        getJobs({ per_page: 50, page: 1 }),
        getProjects({ per_page: 50, page: 1 }),
      ])

      if (!isActive) return

      const opportunities = []
      if (jobsResult.status === 'fulfilled') {
        opportunities.push(...jobsResult.value.data.map(jobToOpportunity))
      } else {
        setJobsError(true)
      }

      if (projectsResult.status === 'fulfilled') {
        opportunities.push(...projectsResult.value.data.map(projectToOpportunity))
      } else {
        setProjectsError(true)
      }

      setApiOpportunities(opportunities)
      setJobsLoading(false)
      setProjectsLoading(false)
    }

    loadApiOpportunities()
    return () => {
      isActive = false
    }
  }, [])

  const visibleOpportunities = useMemo(() => {
    const query = search.trim().toLowerCase()

    return apiOpportunities.filter((opportunity) => {
      const matchesType = activeType === 'All' || opportunity.typeCategory === activeType
      const matchesWorkStyle = workStyle === 'All work styles' || opportunity.workStyle === workStyle
      const matchesSearch = !query || [
        opportunity.title,
        opportunity.company,
        opportunity.description,
        opportunity.location,
        ...opportunity.skills,
      ].some((value) => value?.toLowerCase().includes(query))

      return matchesType && matchesWorkStyle && matchesSearch
    })
  }, [activeType, apiOpportunities, search, workStyle])

  const clearFilters = () => {
    setSearch('')
    setActiveType('All')
    setWorkStyle('All work styles')
  }

  const isLoading = jobsLoading || projectsLoading
  const hasFilters = search.trim() || activeType !== 'All' || workStyle !== 'All work styles'

  return (
    <CandidateLayout title="Opportunities">
      <section className="flex min-w-0 max-w-full flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-sm text-[#64ffda]">Member opportunities</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">Opportunities</h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#8892b0]">
            Find live jobs, internships, and company projects that match your next step.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-4 text-sm">
          <Link to={getCandidateActivityPath('applications')} className="text-[#a8b2d1] hover:text-[#64ffda]">My applications</Link>
          <Link to={getCandidateActivityPath('proposals')} className="text-[#a8b2d1] hover:text-[#64ffda]">My proposals</Link>
        </div>
      </section>

      <section className="mt-8 min-w-0 max-w-full" aria-label="Find opportunities">
        <div className="grid min-w-0 max-w-full gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
          <div className="min-w-0">
            <label htmlFor="opportunity-search" className="sr-only">Search opportunities</label>
            <input
              id="opportunity-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, company, or skill..."
              className="w-full min-w-0 max-w-full rounded-xl border border-[#233554] bg-[#112240]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="work-style-filter" className="sr-only">Work style</label>
            <select
              id="work-style-filter"
              value={workStyle}
              onChange={(event) => setWorkStyle(event.target.value)}
              className="w-full min-w-0 max-w-full rounded-xl border border-[#233554] bg-[#112240]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
            >
              {workStyleFilters.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter opportunity types">
          {typeFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={activeType === filter}
              onClick={() => setActiveType(filter)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                activeType === filter
                  ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]'
                  : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/50 hover:text-[#e6f1ff]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 min-w-0 max-w-full" aria-live="polite">
        {jobsLoading && (
          <div className="mb-5 rounded-xl border border-[#233554] bg-[#112240]/50 px-4 py-3">
            <LoadingSpinner label="Loading jobs..." />
          </div>
        )}
        {jobsError && (
          <p className="mb-5 rounded-xl border border-[#facc15]/25 bg-[#facc15]/5 px-4 py-3 text-sm text-[#fde68a]">
            Jobs are temporarily unavailable. Other opportunities are still shown below.
          </p>
        )}
        {projectsError && (
          <p className="mb-5 rounded-xl border border-[#facc15]/25 bg-[#facc15]/5 px-4 py-3 text-sm text-[#fde68a]">
            Company projects are temporarily unavailable. Jobs are still available.
          </p>
        )}

        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm text-[#64748b]">
            {visibleOpportunities.length} {visibleOpportunities.length === 1 ? 'opportunity' : 'opportunities'}
          </p>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="text-sm text-[#64ffda] hover:underline">
              Clear filters
            </button>
          )}
        </div>

        {visibleOpportunities.length > 0 ? (
          <div className="grid min-w-0 max-w-full gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : !isLoading && (
          <EmptyState
            title={search.trim() ? 'No search results' : 'No opportunities in this category'}
            description={search.trim()
              ? 'Try a different title, company, or skill.'
              : 'Choose another type or work style to see more opportunities.'}
            actionLabel={hasFilters ? 'Clear filters' : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
        )}
      </section>
    </CandidateLayout>
  )
}
