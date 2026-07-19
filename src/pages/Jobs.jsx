import { useEffect, useState } from 'react'
import { getJobById, getJobs } from '../api/jobsApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import JobCard from '../components/JobCard'
import LoadingSpinner from '../components/LoadingSpinner'
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
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('All locations')
  const [locations, setLocations] = useState([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)

  useEffect(() => {
    let isActive = true
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await getJobs({
          search: search.trim() || undefined,
          location: location === 'All locations' ? undefined : location,
          per_page: 12,
          page,
        })

        if (!isActive) return

        setJobs(response.data)
        setPagination(response)
        setLocations((current) =>
          [...new Set([...current, ...response.data.map((job) => job.location).filter(Boolean)])].sort(),
        )
      } catch (requestError) {
        if (!isActive) return
        setJobs([])
        setError(
          requestError.response?.data?.message ||
            'Unable to load jobs. Please try again.',
        )
      } finally {
        if (isActive) setIsLoading(false)
      }
    }, 300)

    return () => {
      isActive = false
      window.clearTimeout(timer)
    }
  }, [location, page, search])

  const openDetails = async (job) => {
    setModal({ type: 'details', job, isLoading: true, error: '' })

    try {
      const response = await getJobById(job.id)
      setModal((current) =>
        current?.type === 'details' && current.job.id === job.id
          ? { type: 'details', job: response.job, isLoading: false, error: '' }
          : current,
      )
    } catch (requestError) {
      setModal((current) =>
        current?.type === 'details' && current.job.id === job.id
          ? {
              type: 'details',
              job,
              isLoading: false,
              error:
                requestError.response?.data?.message ||
                'Unable to load job details.',
            }
          : current,
      )
    }
  }

  const clearFilters = () => {
    setSearch('')
    setLocation('All locations')
    setPage(1)
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
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="job-search" className="mb-2 block text-xs text-[#8892b0]">
                Search
              </label>
              <input
                id="job-search"
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                placeholder="Title, description, or requirements..."
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
                onChange={(event) => { setLocation(event.target.value); setPage(1) }}
                className={controlClasses}
              >
                <option>All locations</option>
                {locations.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#8892b0]">
              Showing <span className="font-medium text-[#e6f1ff]">{jobs.length}</span>{' '}
              of {pagination?.total ?? jobs.length} opportunities
            </p>
            {(search || location !== 'All locations') && (
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
            <LoadingSpinner label="Loading jobs..." size="lg" />
          ) : error ? (
            <div className="mt-5">
              <EmptyState title="Unable to load jobs" description={error} />
            </div>
          ) : jobs.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={openDetails}
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
            <div role="dialog" aria-modal="true" aria-labelledby="job-modal-title">
              <p className="font-mono text-xs uppercase tracking-wider text-[#64ffda]">
                {modal.type === 'apply' ? 'Application preview' : 'Job details'}
              </p>
              <h2 id="job-modal-title" className="mt-3 text-xl font-bold text-[#e6f1ff]">
                {modal.job.title}
              </h2>
              <p className="mt-1 text-sm text-[#64ffda]">{modal.job.company}</p>
              {modal.isLoading ? (
                <LoadingSpinner label="Loading job details..." />
              ) : (
                <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#8892b0]">
                  <p>
                    {modal.error || (modal.type === 'apply'
                      ? 'Application submission is not connected yet.'
                      : modal.job.description)}
                  </p>
                  {!modal.error && modal.type === 'details' && modal.job.requirements && (
                    <div>
                      <h3 className="font-medium text-[#e6f1ff]">Requirements</h3>
                      <p className="mt-1 whitespace-pre-line">{modal.job.requirements}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setModal(null)}>
                  Close
                </Button>
                {modal.type === 'apply' && (
                  <Button disabled>
                    Application unavailable
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
