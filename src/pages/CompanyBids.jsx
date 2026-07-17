import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import useToast from '../hooks/useToast'
import mockCompanyBids from '../data/mockCompanyBids'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/company/dashboard' }, { label: 'Company Profile', href: '/company/profile' },
  { label: 'Jobs', href: '/company/jobs' }, { label: 'Applications', href: '/company/applications' },
  { label: 'Projects', href: '/company/projects' }, { label: 'Bids', href: '/company/bids' },
  { label: 'Settings', href: '/settings' }, { label: 'Logout', href: '/login' },
]
const statusClasses = { Pending: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]', Accepted: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]', Rejected: 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]' }
const inputClasses = 'w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'
function StatusBadge({ status }) { return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses[status]}`}>{status}</span> }
function Skills({ items }) { return <div className="flex flex-wrap gap-1.5">{items.map((skill) => <span key={skill} className="rounded-full border border-[#233554] bg-[#0a192f]/70 px-2 py-1 font-mono text-[10px] text-[#64ffda]">{skill}</span>)}</div> }

export default function CompanyBids() {
  const { showToast } = useToast()
  const [bids, setBids] = useState(mockCompanyBids)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [project, setProject] = useState('All projects')
  const [selected, setSelected] = useState(null)
  const projects = [...new Set(bids.map((item) => item.projectTitle))].sort()
  const query = search.trim().toLowerCase()
  const filtered = bids.filter((item) => (!query || item.candidateName.toLowerCase().includes(query) || item.projectTitle.toLowerCase().includes(query)) && (status === 'All statuses' || item.status === status) && (project === 'All projects' || item.projectTitle === project))
  const stats = ['Pending', 'Accepted', 'Rejected'].map((label) => ({ label, value: bids.filter((item) => item.status === label).length }))
  stats.unshift({ label: 'Total Bids', value: bids.length })
  const updateStatus = (id, nextStatus) => {
    const bid = bids.find((item) => item.id === id)
    setBids((current) => current.map((item) => item.id === id ? { ...item, status: nextStatus } : item))
    showToast(`${bid?.candidateName ?? 'Bid'} marked as ${nextStatus.toLowerCase()}.`, nextStatus === 'Accepted' ? 'success' : 'error')
  }
  const Actions = ({ bid }) => <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setSelected(bid)}>View Proposal</Button><Button size="sm" disabled={bid.status === 'Accepted'} onClick={() => updateStatus(bid.id, 'Accepted')}>Accept</Button><Button variant="danger" size="sm" disabled={bid.status === 'Rejected'} onClick={() => updateStatus(bid.id, 'Rejected')}>Reject</Button></div>

  return (
    <DashboardLayout title="Project Bids" navItems={navItems} userType="Company">
      <div className="space-y-8">
        <section><p className="font-mono text-sm text-[#64ffda]">Proposal pipeline</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Project Bids</h2><p className="mt-3 text-[#8892b0]">Review offers submitted by candidates or teams.</p></section>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((item, index) => <Card key={item.label} hover><div className="flex justify-between"><div><p className="text-sm text-[#8892b0]">{item.label}</p><p className="mt-3 text-3xl font-bold">{item.value}</p></div><span className="font-mono text-xs text-[#64ffda]">0{index + 1}</span></div></Card>)}</section>
        <Card><div className="grid gap-4 md:grid-cols-3"><div><label htmlFor="company-bid-search" className="mb-2 block text-xs text-[#8892b0]">Search</label><input id="company-bid-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Candidate/team or project..." className={inputClasses} /></div><div><label htmlFor="company-bid-status" className="mb-2 block text-xs text-[#8892b0]">Status</label><select id="company-bid-status" value={status} onChange={(event) => setStatus(event.target.value)} className={inputClasses}>{['All statuses', 'Pending', 'Accepted', 'Rejected'].map((item) => <option key={item}>{item}</option>)}</select></div><div><label htmlFor="company-bid-project" className="mb-2 block text-xs text-[#8892b0]">Project</label><select id="company-bid-project" value={project} onChange={(event) => setProject(event.target.value)} className={inputClasses}><option>All projects</option>{projects.map((item) => <option key={item}>{item}</option>)}</select></div></div></Card>
        <section><p className="mb-4 text-sm text-[#8892b0]">Showing <span className="text-[#e6f1ff]">{filtered.length}</span> bids</p>
          <Card padding="sm" className="hidden overflow-hidden md:block"><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left"><thead><tr className="border-b border-[#233554] text-[11px] uppercase tracking-wider text-[#64748b]"><th className="px-4 py-3">Candidate</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Skills</th><th className="px-4 py-3">Offer</th><th className="px-4 py-3">Delivery</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className="border-b border-[#233554]/70 last:border-0 hover:bg-[#172a45]/60"><td className="px-4 py-4"><p className="text-sm font-medium">{item.candidateName}</p><p className="mt-1 text-xs text-[#8892b0]">{item.location}</p></td><td className="px-4 py-4"><p className="text-sm text-[#8892b0]">{item.projectTitle}</p><p className="mt-1 text-xs text-[#64748b]">{item.dateSubmitted}</p></td><td className="px-4 py-4"><Skills items={item.skills} /></td><td className="px-4 py-4 font-medium">{item.offeredPrice}</td><td className="px-4 py-4 text-xs text-[#8892b0]">{item.deliveryDays} days</td><td className="px-4 py-4"><StatusBadge status={item.status} /></td><td className="px-4 py-4"><Actions bid={item} /></td></tr>)}</tbody></table></div></Card>
          <div className="space-y-4 md:hidden">{filtered.map((item) => <Card key={item.id} hover><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.candidateName}</h3><p className="mt-1 text-sm text-[#64ffda]">{item.projectTitle}</p></div><StatusBadge status={item.status} /></div><div className="mt-4 grid grid-cols-2 gap-3 border-y border-[#233554] py-4 text-xs"><div><p className="text-[#64748b]">Offer</p><p className="mt-1 text-[#e6f1ff]">{item.offeredPrice}</p></div><div><p className="text-[#64748b]">Delivery</p><p className="mt-1 text-[#8892b0]">{item.deliveryDays} days</p></div></div><div className="mt-4"><Skills items={item.skills} /></div><div className="mt-5"><Actions bid={item} /></div></Card>)}</div>
          {filtered.length === 0 && <EmptyState title="No bids found" description="Try changing your search, project, or status filters." />}
        </section>
      </div>
      {selected && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}><Card padding="lg" className="w-full max-w-lg shadow-2xl"><div role="dialog" aria-modal="true" aria-labelledby="proposal-title"><p className="font-mono text-xs uppercase text-[#64ffda]">Project proposal</p><h2 id="proposal-title" className="mt-2 text-2xl font-bold">{selected.candidateName}</h2><p className="mt-1 text-sm text-[#64ffda]">{selected.projectTitle}</p><div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#233554] py-5"><div><p className="text-xs text-[#64748b]">Offered price</p><p className="mt-1 font-semibold">{selected.offeredPrice}</p></div><div><p className="text-xs text-[#64748b]">Delivery</p><p className="mt-1 text-sm">{selected.deliveryDays} days</p></div></div><div className="mt-5"><Skills items={selected.skills} /></div><p className="mt-5 text-sm leading-relaxed text-[#8892b0]">{selected.proposalMessage}</p><div className="mt-6 flex justify-end"><Button variant="outline" onClick={() => setSelected(null)}>Close</Button></div></div></Card></div>}
    </DashboardLayout>
  )
}
