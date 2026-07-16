import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import mockJobs from '../data/mockJobs'
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

export default function Jobs() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('All locations')
  const [jobType, setJobType] = useState('All types')
  const [skill, setSkill] = useState('All skills')
  const [modal, setModal] = useState(null)

  const locations = [...new Set(mockJobs.map((job) => job.location))]
  const jobTypes = [...new Set(mockJobs.map((job) => job.type))]
  const skills = [...new Set(mockJobs.flatMap((job) => job.skills))].sort()

  const query = search.trim().toLowerCase()

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.skills.some((item) => item.toLowerCase().includes(query))
    const matchesLocation = location === 'All locations' || job.location === location
    const matchesType = jobType === 'All types' || job.type === jobType
    const matchesSkill = skill === 'All skills' || job.skills.includes(skill)

    return matchesSearch && matchesLocation && matchesType && matchesSkill
  })

  const clearFilters = () => {
    setSearch('')
    setLocation('All locations')
    setJobType('All types')
    setSkill('All skills')
  }

  return (
    <DashboardLayout title="Explore Jobs" navItems={navItems} userType="Candidate">
      <div className="space-y-8">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Career opportunities</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Explore Jobs
          </h2>
          <p className="mt-3 text-[#8892b0]">Find opportunities that match your skills.</p>
        </section>

        <Card padding="md">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="job-search" className="mb-2 block text-xs text-[#8892b0]">
                Search
              </label>
              <input
                id="job-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Title, company, or skill..."
                className={controlClasses}
              />
            </div>
            <div>
              <label htmlFor="location-filter" className="mb-2 block text-xs text-[#8892b0]">
                Location
              </label>
              <select
                id="location-filter"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={controlClasses}
              >
                <option>All locations</option>
                {locations.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="type-filter" className="mb-2 block text-xs text-[#8892b0]">
                Job type
              </label>
              <select
                id="type-filter"
                value={jobType}
                onChange={(event) => setJobType(event.target.value)}
                className={controlClasses}
              >
                <option>All types</option>
                {jobTypes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="skill-filter" className="mb-2 block text-xs text-[#8892b0]">
                Skill
              </label>
              <select
                id="skill-filter"
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
              Showing <span className="font-medium text-[#e6f1ff]">{filteredJobs.length}</span>{' '}
              opportunities
            </p>
            {(search || location !== 'All locations' || jobType !== 'All types' || skill !== 'All skills') && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-[#64ffda] transition-opacity hover:opacity-80"
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredJobs.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <Card key={job.id} hover className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold leading-snug text-[#e6f1ff]">
                        {job.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#64ffda]">{job.company}</p>
                    </div>
                    <span className="rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-2.5 py-1 text-[10px] font-semibold text-[#22c55e]">
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-y border-[#233554] py-4 text-xs text-[#8892b0]">
                    <span>{job.location}</span>
                    <span>{job.type}</span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[#8892b0]">
                    {job.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[#233554] bg-[#0a192f]/70 px-2.5 py-1 font-mono text-[10px] text-[#64ffda]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-6">
                    <p className="mb-4 text-xs text-[#64748b]">
                      Deadline: <span className="text-[#facc15]">{job.deadline}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModal({ type: 'details', job })}
                      >
                        View Details
                      </Button>
                      <Button size="sm" onClick={() => setModal({ type: 'apply', job })}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-5 text-center" padding="lg">
              <p className="text-[#e6f1ff]">No jobs match your filters.</p>
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
            <div role="dialog" aria-modal="true" aria-labelledby="job-modal-title">
              <p className="font-mono text-xs uppercase tracking-wider text-[#64ffda]">
                {modal.type === 'apply' ? 'Application preview' : 'Job details'}
              </p>
              <h2 id="job-modal-title" className="mt-3 text-xl font-bold text-[#e6f1ff]">
                {modal.job.title}
              </h2>
              <p className="mt-1 text-sm text-[#64ffda]">{modal.job.company}</p>
              <p className="mt-5 text-sm leading-relaxed text-[#8892b0]">
                {modal.type === 'apply'
                  ? 'Your application is ready to be submitted. Backend submission will be connected in a future update.'
                  : modal.job.description}
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
