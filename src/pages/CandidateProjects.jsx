import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import EmptyState from '../components/EmptyState'
import ProjectShowcaseCard from '../components/ProjectShowcaseCard'
import ShareProjectModal from '../components/ShareProjectModal'
import { mockProjects, PROJECT_STATUSES } from '../data/mockProjects'
import CandidateLayout from '../layouts/CandidateLayout'

const filters = [
  { label: 'All', value: 'ALL' },
  { label: 'Looking for team', value: PROJECT_STATUSES.LOOKING_FOR_TEAM },
  { label: 'In progress', value: PROJECT_STATUSES.IN_PROGRESS },
  { label: 'Completed', value: PROJECT_STATUSES.COMPLETED },
]

export default function CandidateProjects() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const isShareOpen = searchParams.get('share') === 'true'

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase()

    return mockProjects.filter((project) => {
      const matchesFilter = activeFilter === 'ALL' || project.status === activeFilter
      const matchesSearch = !query || [
        project.title,
        project.description,
        project.creator,
        project.creatorHeadline,
        project.university,
        ...project.skills,
      ].some((value) => value?.toLowerCase().includes(query))

      return matchesFilter && matchesSearch
    })
  }, [activeFilter, search])

  const openShareModal = () => setSearchParams({ share: 'true' })
  const closeShareModal = () => setSearchParams({})
  const clearFilters = () => {
    setSearch('')
    setActiveFilter('ALL')
  }

  const hasSearch = search.trim().length > 0
  const hasFilter = activeFilter !== 'ALL'

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
        <button
          type="button"
          onClick={openShareModal}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#64ffda] bg-[#64ffda] px-5 py-2.5 text-sm font-semibold text-[#071426] transition-colors hover:bg-[#7dffe1]"
        >
          Share a project
        </button>
      </section>

      <section className="mt-8 min-w-0 max-w-full" aria-label="Find projects">
        <label htmlFor="showcase-search" className="sr-only">Search projects</label>
        <input
          id="showcase-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by project, creator, or skill..."
          className="w-full min-w-0 max-w-full rounded-xl border border-[#233554] bg-[#112240]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
        />

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter projects by status">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
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
        <p className="mb-4 text-sm text-[#64748b]">
          {visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'}
        </p>
        {visibleProjects.length > 0 ? (
          <div className="grid min-w-0 max-w-full gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map((project) => <ProjectShowcaseCard key={project.id} project={project} />)}
          </div>
        ) : (
          <EmptyState
            title={hasSearch ? 'No search results' : 'No projects in this category'}
            description={hasSearch
              ? 'Try a different project name, creator, or skill.'
              : 'Choose another status to explore more member projects.'}
            actionLabel={hasSearch || hasFilter ? 'Clear filters' : undefined}
            onAction={hasSearch || hasFilter ? clearFilters : undefined}
          />
        )}
      </section>

      <ShareProjectModal isOpen={isShareOpen} onClose={closeShareModal} />
    </CandidateLayout>
  )
}
