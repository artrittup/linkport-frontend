import { useEffect, useState } from 'react'
import {
  createJob,
  deleteJob as removeJob,
  getCompanyJobs,
  updateJob,
} from '../api/jobsApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import SkillsInput from '../components/SkillsInput'
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

const emptyForm = {
  title: '', description: '', requirements: '', location: '',
  type: 'Full-time', deadline: '', status: 'draft',
}

const inputClasses =
  'mt-2 w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'
const controlClasses =
  'w-full rounded-md border border-[#233554] bg-[#112240] px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda]'

const getErrorMessage = (error, fallback) => {
  const errors = error.response?.data?.errors
  const messages = errors ? Object.values(errors).flat().filter(Boolean) : []
  return messages.length ? messages.join(' ') : error.response?.data?.message || fallback
}

function StatusBadge({ status }) {
  const classes = {
    Open: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]',
    Draft: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
    Closed: 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]',
  }[status] ?? 'border-[#233554] text-[#8892b0]'

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${classes}`}>{status}</span>
}

export default function ManageJobs() {
  const { showToast } = useToast()
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ current_page: 1, total: 0, per_page: 15 })
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [skills, setSkills] = useState([])
  const [originalDeadline, setOriginalDeadline] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadJobs() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getCompanyJobs({
          status: statusFilter === 'All statuses' ? undefined : statusFilter.toLowerCase(),
          per_page: 15,
          page,
        })
        if (!isActive) return
        setJobs(response.data)
        setPagination(response)
      } catch (requestError) {
        if (!isActive) return
        setJobs([])
        setError(getErrorMessage(requestError, 'Unable to load company jobs.'))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadJobs()
    return () => { isActive = false }
  }, [page, refreshKey, statusFilter])

  const query = search.trim().toLowerCase()
  const filteredJobs = jobs.filter((job) =>
    !query || job.title?.toLowerCase().includes(query) ||
    job.location?.toLowerCase().includes(query) ||
    job.type?.toLowerCase().includes(query),
  )
  const stats = [
    { label: 'Jobs on This Page', value: jobs.length },
    { label: 'Applications', value: jobs.reduce((total, job) => total + job.applications, 0) },
    { label: 'Open Jobs', value: jobs.filter((job) => job.status === 'Open').length },
    { label: 'Closed Jobs', value: jobs.filter((job) => job.status === 'Closed').length },
  ]
  const lastPage = Math.max(1, Math.ceil(Number(pagination.total ?? 0) / Number(pagination.per_page ?? 15)))

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const closeForm = () => { if (!isSaving) { setIsFormOpen(false); setEditingId(null); setFormError('') } }
  const openCreateForm = () => { setEditingId(null); setForm(emptyForm); setSkills([]); setOriginalDeadline(''); setFormError(''); setIsFormOpen(true) }
  const openEditForm = (job) => {
    setEditingId(job.id)
    setForm({
      title: job.title ?? '', description: job.description ?? '',
      requirements: job.requirements ?? '', location: job.location ?? '',
      type: job.type ?? '', deadline: job.deadline ?? '',
      status: job.status?.toLowerCase() ?? 'draft',
    })
    setSkills(job.skills ?? [])
    setOriginalDeadline(job.deadline ?? '')
    setFormError('')
    setIsFormOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setFormError('')
    const intent = event.nativeEvent.submitter?.value
    const payload = {
      title: form.title, description: form.description,
      requirements: form.requirements, location: form.location,
      type: form.type || null, skills,
      deadline: form.deadline || null,
      status: editingId !== null ? form.status : intent || 'open',
    }
    const today = new Date().toISOString().slice(0, 10)
    if (
      editingId !== null &&
      form.deadline === originalDeadline &&
      originalDeadline &&
      originalDeadline < today
    ) {
      delete payload.deadline
    }

    try {
      const response = editingId !== null
        ? await updateJob(editingId, payload)
        : await createJob(payload)
      showToast(response.message ?? (editingId !== null ? 'Job updated successfully.' : 'Job created successfully.'), 'success')
      setIsFormOpen(false)
      setEditingId(null)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setFormError(getErrorMessage(requestError, 'Unable to save this job.'))
    } finally {
      setIsSaving(false)
    }
  }

  const deleteSelectedJob = async (job) => {
    if (!window.confirm(`Delete “${job.title}”? This action cannot be undone.`)) return
    setDeletingId(job.id)
    try {
      const response = await removeJob(job.id)
      showToast(response.message ?? `${job.title} was deleted.`, 'success')
      if (jobs.length === 1 && page > 1) setPage((current) => current - 1)
      else setRefreshKey((current) => current + 1)
    } catch (requestError) {
      showToast(getErrorMessage(requestError, 'Unable to delete this job.'), 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DashboardLayout title="Manage Jobs" navItems={navItems} userType="Company">
      <div className="space-y-8">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-mono text-sm text-[#64ffda]">Hiring workspace</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Manage Jobs</h2><p className="mt-3 text-[#8892b0]">Create, edit, and manage your company job opportunities.</p></div>
          <Button size="lg" onClick={openCreateForm}>Post New Job</Button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, index) => <Card key={item.label} hover><div className="flex justify-between"><div><p className="text-sm text-[#8892b0]">{item.label}</p><p className="mt-3 text-3xl font-bold">{item.value}</p></div><span className="font-mono text-xs text-[#64ffda]">0{index + 1}</span></div></Card>)}
        </section>

        <Card><div className="grid gap-4 sm:grid-cols-[1fr_220px]"><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, location, or type..." aria-label="Search jobs" className={controlClasses} /><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }} aria-label="Filter job status" className={controlClasses}>{['All statuses', 'Draft', 'Open', 'Closed'].map((status) => <option key={status}>{status}</option>)}</select></div></Card>

        <section>
          <div className="mb-5"><h2 className="text-xl font-semibold sm:text-2xl">Company Jobs</h2><p className="mt-1 text-sm text-[#8892b0]">{pagination.total ?? 0} jobs in your company workspace.</p></div>
          {isLoading ? <LoadingSpinner label="Loading company jobs..." size="lg" /> : error ? <EmptyState title="Unable to load jobs" description={error} /> : filteredJobs.length === 0 ? <EmptyState title="No jobs found" description={jobs.length ? 'Try changing your search.' : 'Create your first company job.'} /> : (
            <>
              <Card padding="sm" className="hidden overflow-hidden md:block"><div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left"><thead><tr className="border-b border-[#233554] text-[11px] uppercase text-[#64748b]"><th className="p-4">Job title</th><th className="p-4">Location</th><th className="p-4">Type</th><th className="p-4">Deadline</th><th className="p-4">Applications</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{filteredJobs.map((job) => <tr key={job.id} className="border-b border-[#233554]/70 last:border-0"><td className="p-4 text-sm font-medium">{job.title}</td><td className="p-4 text-xs text-[#8892b0]">{job.location}</td><td className="p-4 text-xs text-[#8892b0]">{job.type || 'Not specified'}</td><td className="p-4 text-xs text-[#facc15]">{job.deadline || 'No deadline'}</td><td className="p-4">{job.applications}</td><td className="p-4"><StatusBadge status={job.status} /></td><td className="p-4"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => window.alert(`${job.title}\n\n${job.description}\n\nRequirements: ${job.requirements}`)}>View</Button><Button variant="outline" size="sm" onClick={() => openEditForm(job)}>Edit</Button><Button variant="danger" size="sm" disabled={deletingId === job.id} onClick={() => deleteSelectedJob(job)}>{deletingId === job.id ? 'Deleting...' : 'Delete'}</Button></div></td></tr>)}</tbody></table></div></Card>
              <div className="space-y-4 md:hidden">{filteredJobs.map((job) => <Card key={job.id} hover><div className="flex justify-between"><div><h3 className="font-semibold">{job.title}</h3><p className="mt-1 text-sm text-[#64ffda]">{job.type || 'Type not specified'}</p></div><StatusBadge status={job.status} /></div><div className="my-4 grid grid-cols-2 gap-3 border-y border-[#233554] py-4 text-xs text-[#8892b0]"><p>{job.location}</p><p>{job.deadline || 'No deadline'}</p><p>{job.applications} applications</p></div><div className="grid grid-cols-3 gap-2"><Button variant="ghost" size="sm" onClick={() => window.alert(job.description)}>View</Button><Button variant="outline" size="sm" onClick={() => openEditForm(job)}>Edit</Button><Button variant="danger" size="sm" disabled={deletingId === job.id} onClick={() => deleteSelectedJob(job)}>Delete</Button></div></Card>)}</div>
            </>
          )}
          {!isLoading && !error && lastPage > 1 && <div className="mt-6 flex items-center justify-center gap-4"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><span className="text-sm text-[#8892b0]">Page {pagination.current_page} of {lastPage}</span><Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((current) => current + 1)}>Next</Button></div>}
        </section>
      </div>

      {isFormOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"><Card padding="lg" className="max-h-full w-full max-w-2xl overflow-y-auto"><div role="dialog" aria-modal="true" aria-labelledby="job-form-title"><div className="flex justify-between"><div><p className="font-mono text-xs uppercase text-[#64ffda]">{editingId !== null ? 'Update opportunity' : 'New opportunity'}</p><h2 id="job-form-title" className="mt-2 text-2xl font-bold">{editingId !== null ? 'Edit Job' : 'Post New Job'}</h2></div><button type="button" disabled={isSaving} onClick={closeForm} aria-label="Close form" className="h-9 w-9 text-xl text-[#8892b0]">×</button></div>
        <form onSubmit={handleSubmit} className="mt-7 space-y-5"><div><label htmlFor="job-title">Job title</label><input id="job-title" name="title" value={form.title} onChange={updateField} required className={inputClasses} /></div><div><label htmlFor="job-description">Description</label><textarea id="job-description" name="description" rows="4" value={form.description} onChange={updateField} required className={`${inputClasses} resize-y`} /></div><div><label htmlFor="job-requirements">Requirements</label><textarea id="job-requirements" name="requirements" rows="3" value={form.requirements} onChange={updateField} required className={`${inputClasses} resize-y`} /></div><div className="grid gap-5 sm:grid-cols-3"><div><label htmlFor="job-location">Location</label><input id="job-location" name="location" value={form.location} onChange={updateField} required className={inputClasses} /></div><div><label htmlFor="job-type">Job type</label><select id="job-type" name="type" value={form.type} onChange={updateField} className={inputClasses}>{['Full-time', 'Part-time', 'Internship', 'Traineeship', 'Contract'].map((type) => <option key={type}>{type}</option>)}</select></div><div><label htmlFor="job-deadline">Deadline</label><input id="job-deadline" name="deadline" type="date" value={form.deadline} onChange={updateField} className={inputClasses} /></div></div>{editingId !== null && <div><label htmlFor="job-status">Status</label><select id="job-status" name="status" value={form.status} onChange={updateField} className={inputClasses}><option value="draft">Draft</option><option value="open">Open</option><option value="closed">Closed</option></select></div>}<div><label>Skills required</label><div className="mt-2"><SkillsInput skills={skills} setSkills={setSkills} placeholder="Add a required skill" /></div></div>{formError && <p role="alert" className="rounded-md border border-[#ef4444]/40 bg-[#ef4444]/10 p-3 text-sm text-[#fca5a5]">{formError}</p>}<div className="flex flex-col-reverse gap-3 border-t border-[#233554] pt-6 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" disabled={isSaving} onClick={closeForm}>Cancel</Button>{editingId === null ? <><button type="submit" value="draft" disabled={isSaving} className="rounded-md border border-[#64ffda] px-4 py-2 text-sm text-[#64ffda] disabled:opacity-50">Save Draft</button><button type="submit" value="open" disabled={isSaving} className="rounded-md border border-[#64ffda] bg-[#64ffda] px-4 py-2 text-sm font-medium text-[#0a192f] disabled:opacity-50">{isSaving ? 'Saving...' : 'Publish Job'}</button></> : <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>}</div></form></div></Card></div>}
    </DashboardLayout>
  )
}
