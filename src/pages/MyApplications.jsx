import { useEffect, useState } from 'react'
import { getMyApplications } from '../api/applicationsApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
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

const statuses = ['All statuses', 'Pending', 'Accepted', 'Rejected']
const statusClasses = {
  Pending: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
  Accepted: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]',
  Rejected: 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]',
}

function StatusBadge({ status }) {
  const statusClass =
    statusClasses[status] ??
    'border-[#233554] bg-[#0a192f]/70 text-[#8892b0]'

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass}`}>
      {status}
    </span>
  )
}

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadApplications() {
      setIsLoading(true)
      setError('')

      try {
        const response = await getMyApplications({
          status: status === 'All statuses' ? undefined : status.toLowerCase(),
          per_page: 15,
          page,
        })

        if (!isActive) return
        setApplications(response.data)
        setPagination(response)
      } catch (requestError) {
        if (!isActive) return
        setApplications([])
        setError(
          requestError.response?.data?.message ||
            'Unable to load your applications. Please try again.',
        )
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadApplications()

    return () => {
      isActive = false
    }
  }, [page, status])

  const query = search.trim().toLowerCase()

  const filteredApplications = applications.filter(
    (application) =>
      (!query ||
        application.jobTitle.toLowerCase().includes(query) ||
        application.company.toLowerCase().includes(query)) &&
      (status === 'All statuses' || application.status === status),
  )

  const stats = [
    { label: 'Total Applications', value: pagination.total },
    { label: 'Pending', value: applications.filter((item) => item.status === 'Pending').length },
    { label: 'Accepted', value: applications.filter((item) => item.status === 'Accepted').length },
    { label: 'Rejected', value: applications.filter((item) => item.status === 'Rejected').length },
  ]

  const lastPage = Math.max(
    1,
    Math.ceil(pagination.total / pagination.per_page),
  )

  const showDetails = (application) =>
    window.alert(`${application.jobTitle} at ${application.company}\n\n${application.messagePreview}`)

  return (
    <DashboardLayout title="My Applications" navItems={navItems} userType="Candidate">
      <div className="space-y-8">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Application tracker</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">My Applications</h2>
          <p className="mt-3 text-[#8892b0]">Track the jobs you have applied for.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item, index) => (
              <Card key={item.label} hover>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#8892b0]">{item.label}</p>
                    <p className="mt-3 text-3xl font-bold text-[#e6f1ff]">{item.value}</p>
                  </div>
                  <span className="font-mono text-xs text-[#64ffda]">0{index + 1}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <Card>
          <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
            <div>
              <label htmlFor="application-search" className="mb-2 block text-xs text-[#8892b0]">
                Search applications
              </label>
              <input
                id="application-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Job title or company..."
                className="w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
              />
            </div>
            <div>
              <label htmlFor="application-status" className="mb-2 block text-xs text-[#8892b0]">
                Status
              </label>
              <select
                id="application-status"
                value={status}
                onChange={(event) => { setStatus(event.target.value); setPage(1) }}
                className="w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
              >
                {statuses.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>
        </Card>

        <section>
          <p className="mb-4 text-sm text-[#8892b0]">
            Showing <span className="font-medium text-[#e6f1ff]">{filteredApplications.length}</span> applications
          </p>

          {isLoading ? (
            <LoadingSpinner label="Loading your applications..." size="lg" />
          ) : error ? (
            <EmptyState title="Unable to load applications" description={error} />
          ) : (
            <>
          <Card padding="sm" className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-[#233554] text-[11px] uppercase tracking-wider text-[#64748b]">
                    <th className="px-4 py-3 font-medium">Job</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Applied</th>
                    <th className="px-4 py-3 font-medium">Message</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="border-b border-[#233554]/70 last:border-0 hover:bg-[#172a45]/60">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-[#e6f1ff]">{application.jobTitle}</p>
                        <p className="mt-1 text-xs text-[#64ffda]">{application.company}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-[#8892b0]">{application.location}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-[#8892b0]">{application.dateApplied}</td>
                      <td className="max-w-xs px-4 py-4 text-xs text-[#8892b0]">
                        <p className="truncate">{application.messagePreview}</p>
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={application.status} /></td>
                      <td className="px-4 py-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => showDetails(application)}>View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-4 md:hidden">
            {filteredApplications.map((application) => (
              <Card key={application.id} hover>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[#e6f1ff]">{application.jobTitle}</h3>
                    <p className="mt-1 text-sm text-[#64ffda]">{application.company}</p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
                <div className="mt-4 space-y-2 border-y border-[#233554] py-4 text-xs text-[#8892b0]">
                  <p>{application.location}</p>
                  <p>Applied {application.dateApplied}</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#8892b0]">{application.messagePreview}</p>
                <Button variant="outline" size="sm" className="mt-5 w-full" onClick={() => showDetails(application)}>View Details</Button>
              </Card>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <EmptyState
              title="No applications found"
              description={applications.length === 0 ? 'You have not submitted any applications with this status.' : 'Try changing your search.'}
            />
          )}

          {lastPage > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
              <span className="text-sm text-[#8892b0]">Page {pagination.current_page} of {lastPage}</span>
              <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          )}
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
