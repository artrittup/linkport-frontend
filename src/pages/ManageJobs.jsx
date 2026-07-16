import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import SkillsInput from '../components/SkillsInput'
import mockJobs from '../data/mockJobs'
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

const companyJobConfig = [
  {
    title: 'Junior Frontend Developer',
    applications: 7,
    status: 'Open',
    deadline: '2026-08-12',
    requirements: 'Strong JavaScript fundamentals, React experience, and attention to accessible UI.',
  },
  {
    title: 'Backend Developer Intern',
    applications: 4,
    status: 'Open',
    deadline: '2026-09-02',
    requirements: 'Basic Node.js knowledge, SQL fundamentals, and a willingness to learn API design.',
  },
  {
    title: 'UI/UX Design Intern',
    applications: 5,
    status: 'Open',
    deadline: '2026-08-20',
    requirements: 'A small design portfolio, Figma proficiency, and an understanding of user-centered design.',
  },
  {
    title: 'QA Tester Intern',
    applications: 2,
    status: 'Closed',
    deadline: '2026-07-10',
    requirements: 'Careful attention to detail, clear documentation, and basic web testing knowledge.',
  },
  {
    title: 'React Developer Trainee',
    applications: 6,
    status: 'Open',
    deadline: '2026-08-30',
    requirements: 'HTML, CSS, and JavaScript foundations with personal projects demonstrating React basics.',
  },
]

const initialJobs = companyJobConfig.map((config, index) => {
  const source = mockJobs.find((job) => job.title === config.title)

  return {
    id: source?.id ?? index + 1,
    title: config.title,
    location: source?.location ?? 'Prishtina, Kosovo',
    type: source?.type ?? 'Full-time',
    deadline: config.deadline,
    applications: config.applications,
    status: config.status,
    description: source?.description ?? '',
    requirements: config.requirements,
    skills: source?.skills ?? [],
  }
})

const emptyForm = {
  title: '',
  description: '',
  requirements: '',
  location: '',
  type: 'Full-time',
  deadline: '',
}

const inputClasses =
  'mt-2 w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

function StatusBadge({ status }) {
  const classes =
    status === 'Open'
      ? 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]'
      : 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]'

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${classes}`}>
      {status}
    </span>
  )
}

export default function ManageJobs() {
  const [jobs, setJobs] = useState(initialJobs)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [skills, setSkills] = useState([])

  const activeJobs = jobs.filter((job) => job.status === 'Open').length
  const closedJobs = jobs.filter((job) => job.status === 'Closed').length
  const totalApplications = jobs.reduce((total, job) => total + job.applications, 0)
  const stats = [
    { label: 'Active Jobs', value: activeJobs },
    { label: 'Total Applications', value: totalApplications },
    { label: 'Open Positions', value: activeJobs },
    { label: 'Closed Jobs', value: closedJobs },
  ]

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const openCreateForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSkills([])
    setIsFormOpen(true)
  }

  const openEditForm = (job) => {
    setEditingId(job.id)
    setForm({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      type: job.type,
      deadline: job.deadline,
    })
    setSkills(job.skills)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (editingId !== null) {
      setJobs((current) =>
        current.map((job) =>
          job.id === editingId ? { ...job, ...form, skills } : job,
        ),
      )
    } else {
      setJobs((current) => [
        {
          id: Date.now(),
          ...form,
          skills,
          applications: 0,
          status: 'Open',
        },
        ...current,
      ])
    }

    closeForm()
  }

  const deleteJob = (job) => {
    if (window.confirm(`Delete “${job.title}”? This action cannot be undone.`)) {
      setJobs((current) => current.filter((item) => item.id !== job.id))
    }
  }

  const viewJob = (job) => {
    window.alert(`${job.title}\n\n${job.description}\n\nRequirements: ${job.requirements}`)
  }

  return (
    <DashboardLayout title="Manage Jobs" navItems={navItems} userType="Company">
      <div className="space-y-8">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-sm text-[#64ffda]">Hiring workspace</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Manage Jobs
            </h2>
            <p className="mt-3 text-[#8892b0]">
              Create, edit, and manage your company job opportunities.
            </p>
          </div>
          <Button size="lg" onClick={openCreateForm}>
            Post New Job
          </Button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[#e6f1ff] sm:text-2xl">
              Published Jobs
            </h2>
            <p className="mt-1 text-sm text-[#8892b0]">
              {jobs.length} job opportunities in your company workspace.
            </p>
          </div>

          <Card padding="sm" className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="border-b border-[#233554] text-[11px] uppercase tracking-wider text-[#64748b]">
                    <th className="px-4 py-3 font-medium">Job title</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Deadline</th>
                    <th className="px-4 py-3 font-medium">Applications</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-[#233554]/70 transition-colors last:border-0 hover:bg-[#172a45]/60"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-[#e6f1ff]">
                        {job.title}
                      </td>
                      <td className="px-4 py-4 text-xs text-[#8892b0]">{job.location}</td>
                      <td className="px-4 py-4 text-xs text-[#8892b0]">{job.type}</td>
                      <td className="px-4 py-4 text-xs text-[#facc15]">{job.deadline}</td>
                      <td className="px-4 py-4 text-sm text-[#e6f1ff]">{job.applications}</td>
                      <td className="px-4 py-4"><StatusBadge status={job.status} /></td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => viewJob(job)}>View</Button>
                          <Button variant="outline" size="sm" onClick={() => openEditForm(job)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => deleteJob(job)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-4 md:hidden">
            {jobs.map((job) => (
              <Card key={job.id} hover>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[#e6f1ff]">{job.title}</h3>
                    <p className="mt-1 text-sm text-[#64ffda]">{job.type}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[#233554] py-4 text-xs">
                  <div><p className="text-[#64748b]">Location</p><p className="mt-1 text-[#8892b0]">{job.location}</p></div>
                  <div><p className="text-[#64748b]">Deadline</p><p className="mt-1 text-[#facc15]">{job.deadline}</p></div>
                  <div><p className="text-[#64748b]">Applications</p><p className="mt-1 text-[#e6f1ff]">{job.applications}</p></div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <Button variant="ghost" size="sm" onClick={() => viewJob(job)}>View</Button>
                  <Button variant="outline" size="sm" onClick={() => openEditForm(job)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteJob(job)}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <Card padding="lg" className="max-h-full w-full max-w-2xl overflow-y-auto shadow-2xl shadow-black/40">
            <div role="dialog" aria-modal="true" aria-labelledby="job-form-title">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-[#64ffda]">
                    {editingId !== null ? 'Update opportunity' : 'New opportunity'}
                  </p>
                  <h2 id="job-form-title" className="mt-2 text-2xl font-bold text-[#e6f1ff]">
                    {editingId !== null ? 'Edit Job' : 'Post New Job'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-xl text-[#8892b0] transition-colors hover:bg-[#172a45] hover:text-[#64ffda]"
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="job-title" className="text-sm font-medium">Job title</label>
                  <input id="job-title" name="title" value={form.title} onChange={updateField} required className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="job-description" className="text-sm font-medium">Description</label>
                  <textarea id="job-description" name="description" rows="4" value={form.description} onChange={updateField} required className={`${inputClasses} resize-y`} />
                </div>
                <div>
                  <label htmlFor="job-requirements" className="text-sm font-medium">Requirements</label>
                  <textarea id="job-requirements" name="requirements" rows="3" value={form.requirements} onChange={updateField} required className={`${inputClasses} resize-y`} />
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label htmlFor="job-location" className="text-sm font-medium">Location</label>
                    <input id="job-location" name="location" value={form.location} onChange={updateField} required className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="job-type" className="text-sm font-medium">Job type</label>
                    <select id="job-type" name="type" value={form.type} onChange={updateField} className={inputClasses}>
                      {['Full-time', 'Part-time', 'Internship', 'Traineeship', 'Contract'].map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="job-deadline" className="text-sm font-medium">Deadline</label>
                    <input id="job-deadline" name="deadline" type="date" value={form.deadline} onChange={updateField} required className={inputClasses} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Skills required</label>
                  <div className="mt-2">
                    <SkillsInput skills={skills} setSkills={setSkills} placeholder="Add a required skill" />
                  </div>
                </div>
                <div className="flex flex-col-reverse gap-3 border-t border-[#233554] pt-6 sm:flex-row sm:justify-end">
                  <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
                  <Button type="submit">{editingId !== null ? 'Save Job' : 'Publish Job'}</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
