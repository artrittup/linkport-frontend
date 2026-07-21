import { useEffect, useState } from 'react'
import { getMyBids } from '../api/bidsApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
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

export default function MyBids() {
  const [bids, setBids] = useState([])
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

    async function loadBids() {
      setIsLoading(true)
      setError('')

      try {
        const response = await getMyBids({
          status: status === 'All statuses' ? undefined : status.toLowerCase(),
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
          requestError.response?.data?.message ||
            'Unable to load your bids. Please try again.',
        )
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadBids()

    return () => {
      isActive = false
    }
  }, [page, status])

  const query = search.trim().toLowerCase()

  const filteredBids = bids.filter(
    (bid) =>
      (!query ||
        bid.projectTitle.toLowerCase().includes(query) ||
        bid.company.toLowerCase().includes(query)) &&
      (status === 'All statuses' || bid.status === status),
  )

  const stats = [
    { label: 'Total Bids', value: pagination.total },
    { label: 'Pending', value: bids.filter((item) => item.status === 'Pending').length },
    { label: 'Accepted', value: bids.filter((item) => item.status === 'Accepted').length },
    { label: 'Rejected', value: bids.filter((item) => item.status === 'Rejected').length },
  ]

  const lastPage = Math.max(
    1,
    Math.ceil(pagination.total / pagination.per_page),
  )

  const showProposal = (bid) =>
    window.alert(`${bid.projectTitle} for ${bid.company}\n\n${bid.proposalPreview}`)

  return (
    <DashboardLayout title="My Bids" navItems={navItems} userType="Member">
      <div className="space-y-8">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Proposal tracker</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">My Bids</h2>
          <p className="mt-3 text-[#8892b0]">Track your project offers and proposals.</p>

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
              <label htmlFor="bid-search" className="mb-2 block text-xs text-[#8892b0]">Search bids</label>
              <input
                id="bid-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Project title or company..."
                className="w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]"
              />
            </div>
            <div>
              <label htmlFor="bid-status" className="mb-2 block text-xs text-[#8892b0]">Status</label>
              <select
                id="bid-status"
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
            Showing <span className="font-medium text-[#e6f1ff]">{filteredBids.length}</span> bids
          </p>

          {isLoading ? (
            <LoadingSpinner label="Loading your bids..." size="lg" />
          ) : error ? (
            <EmptyState title="Unable to load bids" description={error} />
          ) : (
            <>
          <Card padding="sm" className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-[#233554] text-[11px] uppercase tracking-wider text-[#64748b]">
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Offer</th>
                    <th className="px-4 py-3 font-medium">Delivery</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBids.map((bid) => (
                    <tr key={bid.id} className="border-b border-[#233554]/70 last:border-0 hover:bg-[#172a45]/60">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-[#e6f1ff]">{bid.projectTitle}</p>
                        <p className="mt-1 text-xs text-[#64ffda]">{bid.company}</p>
                        <p className="mt-2 max-w-xs truncate text-xs text-[#64748b]">{bid.proposalPreview}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-[#e6f1ff]">{bid.offeredPrice}</td>
                      <td className="px-4 py-4 text-xs text-[#8892b0]">{bid.deliveryDays} days</td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-[#8892b0]">{bid.dateSubmitted}</td>
                      <td className="px-4 py-4"><StatusBadge status={bid.status} /></td>
                      <td className="px-4 py-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => showProposal(bid)}>View Proposal</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-4 md:hidden">
            {filteredBids.map((bid) => (
              <Card key={bid.id} hover>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[#e6f1ff]">{bid.projectTitle}</h3>
                    <p className="mt-1 text-sm text-[#64ffda]">{bid.company}</p>
                  </div>
                  <StatusBadge status={bid.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[#233554] py-4 text-xs">
                  <div><p className="text-[#64748b]">Your offer</p><p className="mt-1 text-[#e6f1ff]">{bid.offeredPrice}</p></div>
                  <div><p className="text-[#64748b]">Delivery</p><p className="mt-1 text-[#8892b0]">{bid.deliveryDays} days</p></div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#8892b0]">{bid.proposalPreview}</p>
                <p className="mt-3 text-xs text-[#64748b]">Submitted {bid.dateSubmitted}</p>
                <Button variant="outline" size="sm" className="mt-5 w-full" onClick={() => showProposal(bid)}>View Proposal</Button>
              </Card>
            ))}
          </div>

          {filteredBids.length === 0 && (
            <EmptyState
              title="No bids found"
              description={bids.length === 0 ? 'You have not submitted any bids with this status.' : 'Try changing your search.'}
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
