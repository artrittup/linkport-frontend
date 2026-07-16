import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
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
                <Card key={project.id} hover className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748b]">
                        {project.category}
                      </p>
                      <h3 className="mt-2 font-semibold leading-snug text-[#e6f1ff]">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#64ffda]">{project.company}</p>
                    </div>
                    <span className="rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-2.5 py-1 text-[10px] font-semibold text-[#22c55e]">
                      {project.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[#8892b0]">
                    {project.description}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-3 border-y border-[#233554] py-4 text-xs">
                    <div>
                      <p className="text-[#64748b]">Budget</p>
                      <p className="mt-1 font-medium text-[#e6f1ff]">{project.budget}</p>
                    </div>
                    <div>
                      <p className="text-[#64748b]">Deadline</p>
                      <p className="mt-1 text-[#facc15]">{project.deadline}</p>
                    </div>
                    <div>
                      <p className="text-[#64748b]">Bids</p>
                      <p className="mt-1 text-[#8892b0]">{project.bids} offers</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.skills.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[#233554] bg-[#0a192f]/70 px-2.5 py-1 font-mono text-[10px] text-[#64ffda]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setModal({ type: 'details', project })}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setModal({ type: 'offer', project })}
                    >
                      Send Offer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-5 text-center" padding="lg">
              <p className="text-[#e6f1ff]">No projects match your filters.</p>
              <p className="mt-2 text-sm text-[#8892b0]">
                Try a broader search or clear the selected filters.
              </p>
              <Button variant="outline" size="sm" className="mt-5" onClick={clearFilters}>
                Clear filters
              </Button>
            </Card>
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
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
