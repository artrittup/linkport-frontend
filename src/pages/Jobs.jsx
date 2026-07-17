import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import JobCard from '../components/JobCard'
import useToast from '../hooks/useToast'
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
  const { showToast } = useToast()
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
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={(selectedJob) =>
                    setModal({ type: 'details', job: selectedJob })
                  }
                  onApply={(selectedJob) =>
                    setModal({ type: 'apply', job: selectedJob })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState title="No jobs match your filters" description="Try a broader search or clear the selected filters." actionLabel="Clear filters" onAction={clearFilters} />
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
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setModal(null)}>
                  Close
                </Button>
                {modal.type === 'apply' && (
                  <Button onClick={() => { showToast(`Application submitted for ${modal.job.title}.`, 'success'); setModal(null) }}>
                    Submit Application
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
