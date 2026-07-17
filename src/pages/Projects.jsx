import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import ProjectCard from '../components/ProjectCard'
import useToast from '../hooks/useToast'
import mockProjects from '../data/mockProjects'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/candidate/dashboard' },
  { label: 'My Profile', href: '/candidate/profile' },
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
  Number(budget.match(/[\d,]+/)?.[0].replace(',', '') ?? 0)

export default function Projects() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [budgetRange, setBudgetRange] = useState('All budgets')
  const [deadline, setDeadline] = useState('Any deadline')
  const [category, setCategory] = useState('All categories')
  const [skill, setSkill] = useState('All skills')
  const [modal, setModal] = useState(null)

  const categories = [...new Set(mockProjects.map((project) => project.category))].sort()
  const skills = [...new Set(mockProjects.flatMap((project) => project.skills))].sort()
  const deadlineMonths = [...new Set(mockProjects.map((project) => project.deadline.split(' ')[0]))]
  const query = search.trim().toLowerCase()

  const filteredProjects = mockProjects.filter((project) => {
    const minimumBudget = getMinimumBudget(project.budget)
    const matchesSearch =
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.company.toLowerCase().includes(query) ||
      project.category.toLowerCase().includes(query) ||
      project.skills.some((item) => item.toLowerCase().includes(query))
    const matchesBudget =
      budgetRange === 'All budgets' ||
      (budgetRange === 'Under €1,000' && minimumBudget < 1000) ||
      (budgetRange === '€1,000–€1,499' && minimumBudget >= 1000 && minimumBudget < 1500) ||
      (budgetRange === '€1,500+' && minimumBudget >= 1500)
    const matchesDeadline =
      deadline === 'Any deadline' || project.deadline.startsWith(deadline)
    const matchesCategory =
      category === 'All categories' || project.category === category
    const matchesSkill = skill === 'All skills' || project.skills.includes(skill)

    return (
      matchesSearch &&
      matchesBudget &&
      matchesDeadline &&
      matchesCategory &&
      matchesSkill
    )
  })

  const clearFilters = () => {
    setSearch('')
    setBudgetRange('All budgets')
    setDeadline('Any deadline')
    setCategory('All categories')
    setSkill('All skills')
  }

  const hasFilters =
    search ||
    budgetRange !== 'All budgets' ||
    deadline !== 'Any deadline' ||
    category !== 'All categories' ||
    skill !== 'All skills'

  return (
    <DashboardLayout title="Explore Projects" navItems={navItems} userType="Candidate">
      <div className="space-y-8">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Project marketplace</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Explore Projects
          </h2>
          <p className="mt-3 text-[#8892b0]">Send offers for real company projects.</p>
        </section>

        <Card padding="md">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label htmlFor="project-search" className="mb-2 block text-xs text-[#8892b0]">
                Search
              </label>
              <input
                id="project-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Project, company, skill..."
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
                onChange={(event) => setBudgetRange(event.target.value)}
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
                onChange={(event) => setDeadline(event.target.value)}
                className={controlClasses}
              >
                <option>Any deadline</option>
                {deadlineMonths.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category-filter" className="mb-2 block text-xs text-[#8892b0]">
                Category
              </label>
              <select
                id="category-filter"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={controlClasses}
              >
                <option>All categories</option>
                {categories.map((item) => (
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
                onChange={(event) => setSkill(event.target.value)}
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

          {filteredProjects.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewDetails={(selectedProject) =>
                    setModal({ type: 'details', project: selectedProject })
                  }
                  onSendOffer={(selectedProject) =>
                    setModal({ type: 'offer', project: selectedProject })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState title="No projects match your filters" description="Try a broader search or clear the selected filters." actionLabel="Clear filters" onAction={clearFilters} />
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
                {modal.type === 'offer' ? 'Offer preview' : 'Project details'}
              </p>
              <h2 id="project-modal-title" className="mt-3 text-xl font-bold text-[#e6f1ff]">
                {modal.project.title}
              </h2>
              <p className="mt-1 text-sm text-[#64ffda]">{modal.project.company}</p>
              <p className="mt-5 text-sm leading-relaxed text-[#8892b0]">
                {modal.type === 'offer'
                  ? 'Your offer form will be connected here once backend project bidding is available.'
                  : modal.project.description}
              </p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setModal(null)}>
                  Close
                </Button>
                {modal.type === 'offer' && (
                  <Button onClick={() => { showToast(`Offer sent for ${modal.project.title}.`, 'success'); setModal(null) }}>
                    Submit Offer
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
