import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { getProjectById, getProjects } from '../api/projectsApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ProjectCard from '../components/ProjectCard'
import SendBidModal from '../components/SendBidModal'
import { useAuth } from '../context/AuthContext'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/candidate/dashboard' },
  { label: 'Member Profile', href: '/candidate/profile' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'My Applications', href: '/candidate/applications' },
  { label: 'Projects', href: '/projects' },
  { label: 'My Bids', href: '/candidate/bids' },
  { label: 'Settings', href: '/settings' },
  { label: 'Logout', href: '/login' },
]

const controlClasses =
  'w-full rounded-md border border-[#233554] bg-[#112240] px-4 py-3 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

const getMinimumBudget = (budget) =>
  Number(String(budget ?? 0).replace(/[^\d.]/g, ''))

const getDeadlineMonth = (deadline) =>
  deadline
    ? new Intl.DateTimeFormat(undefined, { month: 'short' }).format(
        new Date(deadline),
      )
    : null

export default function Projects() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { showToast } = useToast()
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [budgetRange, setBudgetRange] = useState('All budgets')
  const [deadline, setDeadline] = useState('Any deadline')
  const [skill, setSkill] = useState('All skills')
  const [skills, setSkills] = useState([])
  const [deadlineMonths, setDeadlineMonths] = useState([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [bidProject, setBidProject] = useState(null)

  useEffect(() => {
    let isActive = true
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await getProjects({
          search: search.trim() || undefined,
          skill: skill === 'All skills' ? undefined : skill,
          per_page: 12,
          page,
        })

        if (!isActive) return

        setProjects(response.data)
        setPagination(response)
        setSkills((current) =>
          [...new Set([...current, ...response.data.flatMap((project) => project.skills)])].sort(),
        )
        setDeadlineMonths((current) =>
          [...new Set([...current, ...response.data.map((project) => getDeadlineMonth(project.deadline)).filter(Boolean)])],
        )
      } catch (requestError) {
        if (!isActive) return
        setProjects([])
        setError(
          requestError.response?.data?.message ||
            'Unable to load projects. Please try again.',
        )
      } finally {
        if (isActive) setIsLoading(false)
      }
    }, 300)

    return () => {
      isActive = false
      window.clearTimeout(timer)
    }
  }, [page, search, skill])

  const filteredProjects = projects.filter((project) => {
    const minimumBudget = getMinimumBudget(project.budget)
    const matchesBudget =
      budgetRange === 'All budgets' ||
      (budgetRange === 'Under €1,000' && minimumBudget < 1000) ||
      (budgetRange === '€1,000–€1,499' && minimumBudget >= 1000 && minimumBudget < 1500) ||
      (budgetRange === '€1,500+' && minimumBudget >= 1500)
    const matchesDeadline =
      deadline === 'Any deadline' || getDeadlineMonth(project.deadline) === deadline

    return matchesBudget && matchesDeadline
  })

  const openDetails = async (project) => {
    setModal({ type: 'details', project, isLoading: true, error: '' })

    try {
      const response = await getProjectById(project.id)
      setModal((current) =>
        current?.type === 'details' && current.project.id === project.id
          ? { type: 'details', project: response.project, isLoading: false, error: '' }
          : current,
      )
    } catch (requestError) {
      setModal((current) =>
        current?.type === 'details' && current.project.id === project.id
          ? {
              type: 'details',
              project,
              isLoading: false,
              error:
                requestError.response?.data?.message ||
                'Unable to load project details.',
            }
          : current,
      )
    }
  }

  const clearFilters = () => {
    setSearch('')
    setBudgetRange('All budgets')
    setDeadline('Any deadline')
    setSkill('All skills')
    setPage(1)
  }

  const hasFilters =
    search ||
    budgetRange !== 'All budgets' ||
    deadline !== 'Any deadline' ||
    skill !== 'All skills'

  const openBid = (project) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (user?.role !== 'candidate') {
      showToast('Only members can bid on projects.', 'error')
      return
    }

    setBidProject(project)
  }

  const handleBidSuccess = (response) => {
    setBidProject(null)
    showToast(response.message ?? 'Bid submitted successfully.', 'success')
  }

  return (
    <DashboardLayout title="Explore Projects" navItems={navItems} userType="Member">
      <div className="space-y-8">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Project marketplace</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Explore Projects
          </h2>
          <p className="mt-3 text-[#8892b0]">Send offers for real company projects.</p>
        </section>

        <Card padding="md">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="project-search" className="mb-2 block text-xs text-[#8892b0]">
                Search
              </label>
              <input
                id="project-search"
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                placeholder="Project title or description..."
                className={controlClasses}
              />
            </div>
            <div>
              <label htmlFor="budget-filter" className="mb-2 block text-xs text-[#8892b0]">
                Budget range
              </label>
              <select
                id="budget-filter"
                value={budgetRange}
                onChange={(event) => { setBudgetRange(event.target.value); setPage(1) }}
                className={controlClasses}
              >
                {['All budgets', 'Under €1,000', '€1,000–€1,499', '€1,500+'].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="deadline-filter" className="mb-2 block text-xs text-[#8892b0]">
                Deadline
              </label>
              <select
                id="deadline-filter"
                value={deadline}
                onChange={(event) => { setDeadline(event.target.value); setPage(1) }}
                className={controlClasses}
              >
                <option>Any deadline</option>
                {deadlineMonths.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="project-skill-filter" className="mb-2 block text-xs text-[#8892b0]">
                Skill
              </label>
              <select
                id="project-skill-filter"
                value={skill}
                onChange={(event) => { setSkill(event.target.value); setPage(1) }}
                className={controlClasses}
              >
                <option>All skills</option>
                {skills.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#8892b0]">
              Showing{' '}
              <span className="font-medium text-[#e6f1ff]">{filteredProjects.length}</span>{' '}
              projects
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-[#64ffda] transition-opacity hover:opacity-80"
              >
                Clear filters
              </button>
            )}
          </div>

          {isLoading ? (
            <LoadingSpinner label="Loading projects..." size="lg" />
          ) : error ? (
            <div className="mt-5">
              <EmptyState title="Unable to load projects" description={error} />
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewDetails={openDetails}
                  onSendOffer={openBid}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState title="No projects match your filters" description="Try a broader search or clear the selected filters." actionLabel="Clear filters" onAction={clearFilters} />
            </div>
          )}

          {!isLoading && !error && pagination?.last_page > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
              <span className="text-sm text-[#8892b0]">Page {pagination.current_page} of {pagination.last_page}</span>
              <Button variant="outline" size="sm" disabled={page >= pagination.last_page} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          )}
        </section>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null)
          }}
        >
          <Card className="w-full max-w-md shadow-2xl shadow-black/40" padding="lg">
            <div role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
              <p className="font-mono text-xs uppercase tracking-wider text-[#64ffda]">
                Project details
              </p>
              <h2 id="project-modal-title" className="mt-3 text-xl font-bold text-[#e6f1ff]">
                {modal.project.title}
              </h2>
              <p className="mt-1 text-sm text-[#64ffda]">{modal.project.company}</p>
              {modal.isLoading ? (
                <LoadingSpinner label="Loading project details..." />
              ) : (
                <p className="mt-5 text-sm leading-relaxed text-[#8892b0]">
                  {modal.error || modal.project.description}
                </p>
              )}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {bidProject && (
        <SendBidModal
          project={bidProject}
          onClose={() => setBidProject(null)}
          onSuccess={handleBidSuccess}
        />
      )}
    </DashboardLayout>
  )
}
