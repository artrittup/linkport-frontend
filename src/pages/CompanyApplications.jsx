import { useEffect, useState } from 'react'
import {
  acceptApplication,
  getCompanyApplications,
  rejectApplication,
} from '../api/applicationsApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const statusClasses = {
  Pending: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
  Accepted: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]',
  Rejected: 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]',
}
const inputClasses =
  'w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

const getErrorMessage = (error, fallback) => {
  const errors = error.response?.data?.errors
  const messages = errors ? Object.values(errors).flat().filter(Boolean) : []
  return messages.length
    ? messages.join(' ')
    : error.response?.data?.message || fallback
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses[status] ?? 'border-[#233554] text-[#8892b0]'}`}
    >
      {status}
    </span>
  )
}

function Skills({ items = [] }) {
  if (!items.length) {
    return <span className="text-xs text-[#64748b]">No skills listed</span>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((skill) => (
        <span
          key={skill}
          className="rounded-full border border-[#233554] bg-[#0a192f]/70 px-2 py-1 font-mono text-[10px] text-[#64ffda]"
        >
          {skill}
        </span>
      ))}
    </div>
  )
}

export default function CompanyApplications() {
  const { showToast } = useToast()
  const [applications, setApplications] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [job, setJob] = useState('All jobs')
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewing, setReviewing] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadApplications() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getCompanyApplications({
          status:
            status === 'All statuses' ? undefined : status.toLowerCase(),
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
          getErrorMessage(
            requestError,
            'Unable to load company applications.',
          ),
        )
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadApplications()
    return () => {
      isActive = false
    }
  }, [page, refreshKey, status])

  const jobs = [...new Set(applications.map((item) => item.jobTitle))].sort()
  const query = search.trim().toLowerCase()
  const filtered = applications.filter(
    (item) =>
      (!query ||
        item.candidateName.toLowerCase().includes(query) ||
        item.jobTitle.toLowerCase().includes(query) ||
        item.candidateEmail.toLowerCase().includes(query)) &&
      (job === 'All jobs' || item.jobTitle === job),
  )
  const stats = ['Pending', 'Accepted', 'Rejected'].map((label) => ({
    label,
    value: applications.filter((item) => item.status === label).length,
  }))
  stats.unshift({ label: 'Total Applications', value: pagination.total })
  const lastPage = Math.max(
    1,
    Math.ceil(
      Number(pagination.total ?? 0) / Number(pagination.per_page ?? 15),
    ),
  )

  const reviewApplication = async (application, decision) => {
    if (application.status !== 'Pending') return

    setReviewing(`${application.id}:${decision}`)
    try {
      const response =
        decision === 'accept'
          ? await acceptApplication(application.id)
          : await rejectApplication(application.id)
      showToast(
        response.message ??
          `Application ${decision === 'accept' ? 'accepted' : 'rejected'} successfully.`,
        decision === 'accept' ? 'success' : 'error',
      )
      setSelected(null)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      const message = getErrorMessage(
        requestError,
        'Unable to review this application.',
      )
      showToast(message, 'error')
      if (requestError.response?.status === 409) {
        setSelected(null)
        setRefreshKey((current) => current + 1)
      }
    } finally {
      setReviewing(null)
    }
  }

  const Actions = ({ application }) => {
    const isPending = application.status === 'Pending'

    return (
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelected(application)}
        >
          View Profile
        </Button>
        <Button
          size="sm"
          disabled={!isPending || reviewing !== null}
          onClick={() => reviewApplication(application, 'accept')}
        >
          {reviewing === `${application.id}:accept` ? 'Accepting...' : 'Accept'}
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={!isPending || reviewing !== null}
          onClick={() => reviewApplication(application, 'reject')}
        >
          {reviewing === `${application.id}:reject` ? 'Rejecting...' : 'Reject'}
        </Button>
      </div>
    )
  }

  return (
    <DashboardLayout title="Applications" userType="Company">
      <div className="space-y-8">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Hiring pipeline</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Applications</h2>
          <p className="mt-3 text-[#8892b0]">
            Review members who applied for your job opportunities.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, index) => (
            <Card key={item.label} hover>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-[#8892b0]">{item.label}</p>
                  <p className="mt-3 text-3xl font-bold">{item.value}</p>
                </div>
                <span className="font-mono text-xs text-[#64ffda]">
                  0{index + 1}
                </span>
              </div>
            </Card>
          ))}
        </section>

        <Card>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="company-application-search"
                className="mb-2 block text-xs text-[#8892b0]"
              >
                Search
              </label>
              <input
                id="company-application-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Member or job title..."
                className={inputClasses}
              />
            </div>
            <div>
              <label
                htmlFor="company-application-status"
                className="mb-2 block text-xs text-[#8892b0]"
              >
                Status
              </label>
              <select
                id="company-application-status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(1)
                  setJob('All jobs')
                }}
                className={inputClasses}
              >
                {['All statuses', 'Pending', 'Accepted', 'Rejected'].map(
                  (item) => (
                    <option key={item}>{item}</option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label
                htmlFor="company-application-job"
                className="mb-2 block text-xs text-[#8892b0]"
              >
                Job
              </label>
              <select
                id="company-application-job"
                value={job}
                onChange={(event) => setJob(event.target.value)}
                className={inputClasses}
              >
                <option>All jobs</option>
                {jobs.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <section>
          <p className="mb-4 text-sm text-[#8892b0]">
            Showing <span className="text-[#e6f1ff]">{filtered.length}</span>{' '}
            applications
          </p>

          {isLoading ? (
            <LoadingSpinner label="Loading company applications..." size="lg" />
          ) : error ? (
            <EmptyState
              title="Unable to load applications"
              description={error}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No applications found"
              description={
                applications.length
                  ? 'Try changing your search or job filter.'
                  : 'No applications match the selected status.'
              }
            />
          ) : (
            <>
              <Card padding="sm" className="hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] text-left">
                    <thead>
                      <tr className="border-b border-[#233554] text-[11px] uppercase tracking-wider text-[#64748b]">
                        <th className="px-4 py-3">Member</th>
                        <th className="px-4 py-3">Job</th>
                        <th className="px-4 py-3">Skills</th>
                        <th className="px-4 py-3">Applied</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#233554]/70 last:border-0 hover:bg-[#172a45]/60"
                        >
                          <td className="px-4 py-4">
                            <p className="text-sm font-medium">
                              {item.candidateName}
                            </p>
                            <p className="mt-1 text-xs text-[#8892b0]">
                              {item.location}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-sm text-[#8892b0]">
                            {item.jobTitle}
                          </td>
                          <td className="px-4 py-4">
                            <Skills items={item.skills} />
                          </td>
                          <td className="px-4 py-4 text-xs text-[#8892b0]">
                            {item.dateApplied}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-4 py-4">
                            <Actions application={item} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="space-y-4 md:hidden">
                {filtered.map((item) => (
                  <Card key={item.id} hover>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{item.candidateName}</h3>
                        <p className="mt-1 text-sm text-[#64ffda]">
                          {item.jobTitle}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-3 text-xs text-[#8892b0]">
                      {item.location} &middot; {item.dateApplied}
                    </p>
                    <div className="mt-4">
                      <Skills items={item.skills} />
                    </div>
                    <div className="mt-5">
                      <Actions application={item} />
                    </div>
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
                onClick={() => {
                  setJob('All jobs')
                  setPage((current) => current - 1)
                }}
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
                onClick={() => {
                  setJob('All jobs')
                  setPage((current) => current + 1)
                }}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null)
          }}
        >
          <Card padding="lg" className="w-full max-w-lg shadow-2xl">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="candidate-profile-title"
            >
              <p className="font-mono text-xs uppercase text-[#64ffda]">
                Member profile
              </p>
              <h2
                id="candidate-profile-title"
                className="mt-2 text-2xl font-bold"
              >
                {selected.candidateName}
              </h2>
              <p className="mt-1 text-sm text-[#64ffda]">
                {selected.headline}
              </p>
              <div className="mt-5 grid gap-4 border-y border-[#233554] py-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#64748b]">Job</p>
                  <p className="mt-1 text-sm text-[#e6f1ff]">
                    {selected.jobTitle}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">Location</p>
                  <p className="mt-1 text-sm text-[#e6f1ff]">
                    {selected.location}
                  </p>
                </div>
                {selected.candidateEmail && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-[#64748b]">Email</p>
                    <p className="mt-1 text-sm text-[#e6f1ff]">
                      {selected.candidateEmail}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-5">
                <Skills items={selected.skills} />
              </div>
              <div className="mt-5">
                <p className="text-xs text-[#64748b]">Cover letter</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#8892b0]">
                  {selected.coverLetter || 'No cover letter provided.'}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setSelected(null)}>
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
