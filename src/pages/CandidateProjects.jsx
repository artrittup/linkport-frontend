import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ProjectShowcaseCard from '../components/ProjectShowcaseCard'
import { COMMUNITY_PROJECT_STATUSES } from '../data/communityProjectMapper'
import useCommunityProjects from '../hooks/useCommunityProjects'
import CandidateLayout from '../layouts/CandidateLayout'

const filters = [
  { label: 'All', value: '' },
  { label: 'Looking for team', value: COMMUNITY_PROJECT_STATUSES.LOOKING_FOR_TEAM },
  { label: 'In progress', value: COMMUNITY_PROJECT_STATUSES.IN_PROGRESS },
  { label: 'Completed', value: COMMUNITY_PROJECT_STATUSES.COMPLETED },
]

export default function CandidateProjects() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [page, setPage] = useState(1)
  const { projects, meta, isLoading, error, retry } = useCommunityProjects({
    search: appliedSearch,
    status: activeFilter,
    page,
    perPage: 12,
  })

  const applySearch = (event) => {
    event.preventDefault()
    setAppliedSearch(search.trim())
    setPage(1)
  }

  const selectFilter = (status) => {
    setActiveFilter(status)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setAppliedSearch('')
    setActiveFilter('')
    setPage(1)
  }

  const hasFilters = Boolean(appliedSearch || activeFilter)

  return (
    <CandidateLayout title="Projects">
      <section className="flex min-w-0 max-w-full flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-sm text-[#64ffda]">Project showcase</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#e6f1ff] sm:text-4xl">Projects</h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#8892b0]">
            Discover work from LinkPort members, share what you are building, and find projects looking for collaborators.
          </p>
        </div>
        <Link
          to="/candidate/create/project"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#64ffda] bg-[#64ffda] px-5 py-2.5 text-sm font-semibold text-[#071426] transition-colors hover:bg-[#7dffe1]"
        >
          Share a project
        </Link>
      </section>

      <section className="mt-8 min-w-0 max-w-full" aria-label="Find projects">
        <form onSubmit={applySearch} className="flex min-w-0 flex-col gap-3 sm:flex-row">
          <label htmlFor="showcase-search" className="sr-only">Search community projects</label>
          <input
            id="showcase-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by project, description, or skill..."
            className="min-w-0 flex-1 rounded-xl border border-[#233554] bg-[#112240]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
          />
          <Button type="submit" variant="outline" className="shrink-0">Search</Button>
        </form>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter projects by status">
          {filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              role="tab"
              aria-selected={activeFilter === filter.value}
              onClick={() => selectFilter(filter.value)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === filter.value
                  ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]'
                  : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/50 hover:text-[#e6f1ff]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 min-w-0 max-w-full" aria-live="polite">
        {isLoading ? (
          <LoadingSpinner label="Loading community projects..." size="lg" />
        ) : error ? (
          <EmptyState
            title="Unable to load projects"
            description={error}
            actionLabel="Try again"
            onAction={retry}
          />
        ) : projects.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-[#64748b]">
              {meta.total} {meta.total === 1 ? 'project' : 'projects'}
            </p>
            <div className="grid min-w-0 max-w-full gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => <ProjectShowcaseCard key={project.id} project={project} />)}
            </div>
            {meta.last_page > 1 && (
              <nav className="mt-8 flex flex-wrap items-center justify-center gap-3" aria-label="Project pages">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <span className="text-sm text-[#8892b0]">Page {meta.current_page} of {meta.last_page}</span>
                <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </nav>
            )}
          </>
        ) : (
          <EmptyState
            title={hasFilters ? 'No projects match your filters' : 'No community projects yet'}
            description={hasFilters
              ? 'Try a broader search or another project status.'
              : 'Be the first member to share work with the community.'}
            actionLabel={hasFilters ? 'Clear filters' : 'Share a project'}
            onAction={hasFilters ? clearFilters : () => navigate('/candidate/create/project')}
          />
        )}
      </section>
    </CandidateLayout>
  )
}
