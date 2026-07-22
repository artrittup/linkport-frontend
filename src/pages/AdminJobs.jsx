import { useEffect, useState } from 'react'
import { deleteAdminJob, getAdminJobs } from '../api/adminApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Jobs', href: '/admin/jobs' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Logout', href: '/login' },
]
const control =
  'rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm outline-none focus:border-[#64ffda]'

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback

function Status({ status }) {
  const classes = {
    Open: 'bg-[#22c55e]/10 text-[#22c55e]',
    Draft: 'bg-[#facc15]/10 text-[#facc15]',
    Closed: 'bg-[#ef4444]/10 text-[#ef4444]',
  }[status] ?? 'bg-[#233554] text-[#8892b0]'

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${classes}`}>
      {status}
    </span>
  )
}

export default function AdminJobs() {
  const { showToast } = useToast()
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    )
    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let isActive = true

    async function loadJobs() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getAdminJobs({
          search: debouncedSearch || undefined,
          per_page: 15,
          page,
        })
        if (!isActive) return
        setJobs(response.data)
        setPagination(response)
      } catch (requestError) {
        if (!isActive) return
        setJobs([])
        setError(getErrorMessage(requestError, 'Unable to load jobs.'))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadJobs()
    return () => {
      isActive = false
    }
  }, [debouncedSearch, page, refreshKey])

  const filtered = jobs.filter(
    (job) => status === 'All' || job.status === status,
  )
  const lastPage = Math.max(
    1,
    Math.ceil(
      Number(pagination.total ?? 0) / Number(pagination.per_page ?? 15),
    ),
  )

  const removeJob = async (job) => {
    if (!window.confirm(`Delete “${job.title}”?`)) return

    setDeletingId(job.id)
    try {
      const response = await deleteAdminJob(job.id)
      showToast(response.message ?? `${job.title} was deleted.`, 'success')
      if (jobs.length === 1 && page > 1) {
        setPage((current) => current - 1)
      } else {
        setRefreshKey((current) => current + 1)
      }
    } catch (requestError) {
      showToast(
        getErrorMessage(requestError, 'Unable to delete this job.'),
        'error',
      )
    } finally {
      setDeletingId(null)
    }
  }

  const Actions = ({ job }) => (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          window.alert(`${job.title}\n${job.company}\n\n${job.description ?? ''}`)
        }
      >
        View
      </Button>
      <Button
        variant="danger"
        size="sm"
        disabled={deletingId !== null}
        onClick={() => removeJob(job)}
      >
        {deletingId === job.id ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  )

  return (
    <DashboardLayout title="Jobs" navItems={navItems} userType="Admin">
      <section className="mb-8">
        <p className="font-mono text-sm text-[#64ffda]">Content moderation</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Jobs</h2>
        <p className="mt-3 text-[#8892b0]">Review and manage job posts.</p>
      </section>

      <Card>
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search job title..."
            aria-label="Search jobs"
            className={control}
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Status"
            className={control}
          >
            {['All', 'Draft', 'Open', 'Closed'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </Card>

      <p className="mb-4 mt-8 text-sm text-[#8892b0]">
        Showing {filtered.length} of {pagination.total} jobs
      </p>
      {isLoading ? (
        <LoadingSpinner label="Loading jobs..." size="lg" />
      ) : error ? (
        <EmptyState title="Unable to load jobs" description={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description={
            jobs.length
              ? 'Try changing your status filter.'
              : 'No jobs match your search.'
          }
        />
      ) : (
        <>
          <Card padding="sm" className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-[#233554] text-xs text-[#64748b]">
                    <th className="p-4">Title</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-[#233554]/70 last:border-0"
                    >
                      <td className="p-4 text-sm font-medium">{job.title}</td>
                      <td className="p-4 text-sm text-[#64ffda]">
                        {job.company}
                      </td>
                      <td className="p-4 text-xs text-[#8892b0]">
                        {job.location}
                      </td>
                      <td className="p-4">
                        <Status status={job.status} />
                      </td>
                      <td className="p-4 text-xs text-[#8892b0]">
                        {job.createdDate}
                      </td>
                      <td className="p-4">
                        <Actions job={job} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-4 md:hidden">
            {filtered.map((job) => (
              <Card key={job.id} hover>
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="mt-1 text-sm text-[#64ffda]">
                      {job.company}
                    </p>
                  </div>
                  <Status status={job.status} />
                </div>
                <p className="my-4 text-xs text-[#8892b0]">
                  {job.location} &middot; {job.createdDate}
                </p>
                <Actions job={job} />
              </Card>
            ))}
          </div>
        </>
      )}

      {!isLoading && !error && lastPage > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-[#8892b0]">
            Page {pagination.current_page} of {lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= lastPage}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </DashboardLayout>
  )
}
