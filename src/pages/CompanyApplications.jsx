import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import useToast from '../hooks/useToast'
import mockCompanyApplications from '../data/mockCompanyApplications'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/company/dashboard' }, { label: 'Company Profile', href: '/company/profile' },
  { label: 'Jobs', href: '/company/jobs' }, { label: 'Applications', href: '/company/applications' },
  { label: 'Projects', href: '/company/projects' }, { label: 'Bids', href: '/company/bids' },
  { label: 'Settings', href: '/settings' }, { label: 'Logout', href: '/login' },
]
const statusClasses = { Pending: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]', Accepted: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]', Rejected: 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]' }
const inputClasses = 'w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses[status]}`}>{status}</span>
}

function Skills({ items }) {
  return <div className="flex flex-wrap gap-1.5">{items.map((skill) => <span key={skill} className="rounded-full border border-[#233554] bg-[#0a192f]/70 px-2 py-1 font-mono text-[10px] text-[#64ffda]">{skill}</span>)}</div>
}

export default function CompanyApplications() {
  const { showToast } = useToast()
  const [applications, setApplications] = useState(mockCompanyApplications)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [job, setJob] = useState('All jobs')
  const [selected, setSelected] = useState(null)
  const jobs = [...new Set(applications.map((item) => item.jobTitle))].sort()
  const query = search.trim().toLowerCase()
  const filtered = applications.filter((item) => (!query || item.candidateName.toLowerCase().includes(query) || item.jobTitle.toLowerCase().includes(query)) && (status === 'All statuses' || item.status === status) && (job === 'All jobs' || item.jobTitle === job))
  const stats = ['Pending', 'Accepted', 'Rejected'].map((label) => ({ label, value: applications.filter((item) => item.status === label).length }))
  stats.unshift({ label: 'Total Applications', value: applications.length })
  const updateStatus = (id, nextStatus) => {
    const application = applications.find((item) => item.id === id)
    setApplications((current) => current.map((item) => item.id === id ? { ...item, status: nextStatus } : item))
    showToast(`${application?.candidateName ?? 'Application'} marked as ${nextStatus.toLowerCase()}.`, nextStatus === 'Accepted' ? 'success' : 'error')
  }

  const Actions = ({ application }) => <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setSelected(application)}>View Profile</Button><Button size="sm" disabled={application.status === 'Accepted'} onClick={() => updateStatus(application.id, 'Accepted')}>Accept</Button><Button variant="danger" size="sm" disabled={application.status === 'Rejected'} onClick={() => updateStatus(application.id, 'Rejected')}>Reject</Button></div>

  return (
    <DashboardLayout title="Applications" navItems={navItems} userType="Company">
      <div className="space-y-8">
        <section><p className="font-mono text-sm text-[#64ffda]">Hiring pipeline</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Applications</h2><p className="mt-3 text-[#8892b0]">Review candidates who applied for your job opportunities.</p></section>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((item, index) => <Card key={item.label} hover><div className="flex justify-between"><div><p className="text-sm text-[#8892b0]">{item.label}</p><p className="mt-3 text-3xl font-bold">{item.value}</p></div><span className="font-mono text-xs text-[#64ffda]">0{index + 1}</span></div></Card>)}</section>
        <Card><div className="grid gap-4 md:grid-cols-3"><div><label htmlFor="company-application-search" className="mb-2 block text-xs text-[#8892b0]">Search</label><input id="company-application-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Candidate or job title..." className={inputClasses} /></div><div><label htmlFor="company-application-status" className="mb-2 block text-xs text-[#8892b0]">Status</label><select id="company-application-status" value={status} onChange={(event) => setStatus(event.target.value)} className={inputClasses}>{['All statuses', 'Pending', 'Accepted', 'Rejected'].map((item) => <option key={item}>{item}</option>)}</select></div><div><label htmlFor="company-application-job" className="mb-2 block text-xs text-[#8892b0]">Job</label><select id="company-application-job" value={job} onChange={(event) => setJob(event.target.value)} className={inputClasses}><option>All jobs</option>{jobs.map((item) => <option key={item}>{item}</option>)}</select></div></div></Card>
        <section><p className="mb-4 text-sm text-[#8892b0]">Showing <span className="text-[#e6f1ff]">{filtered.length}</span> applications</p>
          <Card padding="sm" className="hidden overflow-hidden md:block"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead><tr className="border-b border-[#233554] text-[11px] uppercase tracking-wider text-[#64748b]"><th className="px-4 py-3">Candidate</th><th className="px-4 py-3">Job</th><th className="px-4 py-3">Skills</th><th className="px-4 py-3">Applied</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className="border-b border-[#233554]/70 last:border-0 hover:bg-[#172a45]/60"><td className="px-4 py-4"><p className="text-sm font-medium">{item.candidateName}</p><p className="mt-1 text-xs text-[#8892b0]">{item.location}</p></td><td className="px-4 py-4 text-sm text-[#8892b0]">{item.jobTitle}</td><td className="px-4 py-4"><Skills items={item.skills} /></td><td className="px-4 py-4 text-xs text-[#8892b0]">{item.dateApplied}</td><td className="px-4 py-4"><StatusBadge status={item.status} /></td><td className="px-4 py-4"><Actions application={item} /></td></tr>)}</tbody></table></div></Card>
          <div className="space-y-4 md:hidden">{filtered.map((item) => <Card key={item.id} hover><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.candidateName}</h3><p className="mt-1 text-sm text-[#64ffda]">{item.jobTitle}</p></div><StatusBadge status={item.status} /></div><p className="mt-3 text-xs text-[#8892b0]">{item.location} · {item.dateApplied}</p><div className="mt-4"><Skills items={item.skills} /></div><div className="mt-5"><Actions application={item} /></div></Card>)}</div>
          {filtered.length === 0 && <EmptyState title="No applications found" description="Try changing your search, job, or status filters." />}
        </section>
      </div>
      {selected && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}><Card padding="lg" className="w-full max-w-lg shadow-2xl"><div role="dialog" aria-modal="true" aria-labelledby="candidate-profile-title"><p className="font-mono text-xs uppercase text-[#64ffda]">Candidate profile</p><h2 id="candidate-profile-title" className="mt-2 text-2xl font-bold">{selected.candidateName}</h2><p className="mt-1 text-sm text-[#64ffda]">{selected.jobTitle}</p><div className="mt-5 grid gap-4 border-y border-[#233554] py-5 sm:grid-cols-2"><div><p className="text-xs text-[#64748b]">Education</p><p className="mt-1 text-sm text-[#e6f1ff]">{selected.education}</p></div><div><p className="text-xs text-[#64748b]">Location</p><p className="mt-1 text-sm text-[#e6f1ff]">{selected.location}</p></div></div><div className="mt-5"><Skills items={selected.skills} /></div><p className="mt-5 text-sm leading-relaxed text-[#8892b0]">{selected.message}</p><div className="mt-6 flex justify-end"><Button variant="outline" onClick={() => setSelected(null)}>Close</Button></div></div></Card></div>}
    </DashboardLayout>
  )
}
