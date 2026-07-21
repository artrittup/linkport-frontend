import { useEffect, useState } from 'react'
import { acceptBid, getCompanyBids, rejectBid } from '../api/bidsApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/company/dashboard' },
  { label: 'Company Profile', href: '/company/profile' },
  { label: 'Jobs', href: '/company/jobs' },
  { label: 'Applications', href: '/company/applications' },
  { label: 'Projects', href: '/company/projects' },
  { label: 'Bids', href: '/company/bids' },
  { label: 'Settings', href: '/settings' },
  { label: 'Logout', href: '/login' },
]

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

export default function CompanyBids() {
  const { showToast } = useToast()
  const [bids, setBids] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [project, setProject] = useState('All projects')
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

    async function loadBids() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getCompanyBids({
          status:
            status === 'All statuses' ? undefined : status.toLowerCase(),
          per_page: 15,
          page,
        })
        if (!isActive) return
        setBids(response.data)
        setPagination(response)
      } catch (requestError) {
        if (!isActive) return
        setBids([])
        setError(
          getErrorMessage(requestError, 'Unable to load company bids.'),
        )
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadBids()
    return () => {
      isActive = false
    }
  }, [page, refreshKey, status])

  const projects = [...new Set(bids.map((item) => item.projectTitle))].sort()
  const query = search.trim().toLowerCase()
  const filtered = bids.filter(
    (item) =>
      (!query ||
        item.candidateName.toLowerCase().includes(query) ||
        item.projectTitle.toLowerCase().includes(query) ||
        item.candidateEmail.toLowerCase().includes(query)) &&
      (project === 'All projects' || item.projectTitle === project),
  )
  const stats = ['Pending', 'Accepted', 'Rejected'].map((label) => ({
    label,
    value: bids.filter((item) => item.status === label).length,
  }))
  stats.unshift({ label: 'Total Bids', value: pagination.total })
  const lastPage = Math.max(
    1,
    Math.ceil(
      Number(pagination.total ?? 0) / Number(pagination.per_page ?? 15),
    ),
  )

  const reviewBid = async (bid, decision) => {
    if (bid.status !== 'Pending') return

    setReviewing(`${bid.id}:${decision}`)
    try {
      const response =
        decision === 'accept'
          ? await acceptBid(bid.id)
          : await rejectBid(bid.id)
      showToast(
        response.message ??
          `Bid ${decision === 'accept' ? 'accepted' : 'rejected'} successfully.`,
        decision === 'accept' ? 'success' : 'error',
      )
      setSelected(null)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      const message = getErrorMessage(
        requestError,
        'Unable to review this bid.',
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

  const Actions = ({ bid }) => {
    const isPending = bid.status === 'Pending'

    return (
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelected(bid)}
        >
          View Proposal
        </Button>
        <Button
          size="sm"
          disabled={!isPending || reviewing !== null}
          onClick={() => reviewBid(bid, 'accept')}
        >
          {reviewing === `${bid.id}:accept` ? 'Accepting...' : 'Accept'}
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={!isPending || reviewing !== null}
          onClick={() => reviewBid(bid, 'reject')}
        >
          {reviewing === `${bid.id}:reject` ? 'Rejecting...' : 'Reject'}
        </Button>
      </div>
    )
  }

  return (
    <DashboardLayout title="Project Bids" navItems={navItems} userType="Company">
      <div className="space-y-8">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">
            Proposal pipeline
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Project Bids</h2>
          <p className="mt-3 text-[#8892b0]">
            Review offers submitted by members.
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
                htmlFor="company-bid-search"
                className="mb-2 block text-xs text-[#8892b0]"
              >
                Search
              </label>
              <input
                id="company-bid-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Member or project..."
                className={inputClasses}
              />
            </div>
            <div>
              <label
                htmlFor="company-bid-status"
                className="mb-2 block text-xs text-[#8892b0]"
              >
                Status
              </label>
              <select
                id="company-bid-status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(1)
                  setProject('All projects')
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
                htmlFor="company-bid-project"
                className="mb-2 block text-xs text-[#8892b0]"
              >
                Project
              </label>
              <select
                id="company-bid-project"
                value={project}
                onChange={(event) => setProject(event.target.value)}
                className={inputClasses}
              >
                <option>All projects</option>
                {projects.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <section>
          <p className="mb-4 text-sm text-[#8892b0]">
            Showing <span className="text-[#e6f1ff]">{filtered.length}</span>{' '}
            bids
          </p>

          {isLoading ? (
            <LoadingSpinner label="Loading company bids..." size="lg" />
          ) : error ? (
            <EmptyState title="Unable to load bids" description={error} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No bids found"
              description={
                bids.length
                  ? 'Try changing your search or project filter.'
                  : 'No bids match the selected status.'
              }
            />
          ) : (
            <>
              <Card padding="sm" className="hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left">
                    <thead>
                      <tr className="border-b border-[#233554] text-[11px] uppercase tracking-wider text-[#64748b]">
                        <th className="px-4 py-3">Member</th>
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">Skills</th>
                        <th className="px-4 py-3">Offer</th>
                        <th className="px-4 py-3">Delivery</th>
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
                          <td className="px-4 py-4">
                            <p className="text-sm text-[#8892b0]">
                              {item.projectTitle}
                            </p>
                            <p className="mt-1 text-xs text-[#64748b]">
                              {item.dateSubmitted}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <Skills items={item.skills} />
                          </td>
                          <td className="px-4 py-4 font-medium">
                            {item.offeredPrice}
                          </td>
                          <td className="px-4 py-4 text-xs text-[#8892b0]">
                            {item.deliveryDays
                              ? `${item.deliveryDays} days`
                              : 'Not specified'}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-4 py-4">
                            <Actions bid={item} />
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
                          {item.projectTitle}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[#233554] py-4 text-xs">
                      <div>
                        <p className="text-[#64748b]">Offer</p>
                        <p className="mt-1 text-[#e6f1ff]">
                          {item.offeredPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#64748b]">Delivery</p>
                        <p className="mt-1 text-[#8892b0]">
                          {item.deliveryDays
                            ? `${item.deliveryDays} days`
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Skills items={item.skills} />
                    </div>
                    <div className="mt-5">
                      <Actions bid={item} />
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
                  setProject('All projects')
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
                  setProject('All projects')
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
            <div role="dialog" aria-modal="true" aria-labelledby="proposal-title">
              <p className="font-mono text-xs uppercase text-[#64ffda]">
                Project proposal
              </p>
              <h2 id="proposal-title" className="mt-2 text-2xl font-bold">
                {selected.candidateName}
              </h2>
              <p className="mt-1 text-sm text-[#64ffda]">
                {selected.headline}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#233554] py-5">
                <div>
                  <p className="text-xs text-[#64748b]">Project</p>
                  <p className="mt-1 text-sm">{selected.projectTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">Location</p>
                  <p className="mt-1 text-sm">{selected.location}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">Offered price</p>
                  <p className="mt-1 font-semibold">{selected.offeredPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">Delivery</p>
                  <p className="mt-1 text-sm">
                    {selected.deliveryDays
                      ? `${selected.deliveryDays} days`
                      : 'Not specified'}
                  </p>
                </div>
                {selected.candidateEmail && (
                  <div className="col-span-2">
                    <p className="text-xs text-[#64748b]">Email</p>
                    <p className="mt-1 text-sm">{selected.candidateEmail}</p>
                  </div>
                )}
              </div>
              <div className="mt-5">
                <Skills items={selected.skills} />
              </div>
              <div className="mt-5">
                <p className="text-xs text-[#64748b]">Proposal</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#8892b0]">
                  {selected.proposalMessage || 'No proposal provided.'}
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
