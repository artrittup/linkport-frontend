import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import SkillsInput from '../components/SkillsInput'
import useToast from '../hooks/useToast'
import mockCompanyProjects from '../data/mockCompanyProjects'
import mockProjects from '../data/mockProjects'
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

const projectConfig = [
  {
    title: 'Restaurant Website',
    sourceTitle: 'Restaurant Website',
    deadline: '2026-09-15',
    bids: 8,
    status: 'Open',
  },
  {
    title: 'Booking System UI',
    sourceTitle: 'Booking System UI',
    deadline: '2026-09-08',
    bids: 5,
    status: 'Open',
  },
  {
    title: 'Company Portfolio Website',
    sourceTitle: 'Company Portfolio Website',
    deadline: '2026-10-05',
    bids: 11,
    status: 'Open',
  },
  {
    title: 'Product Landing Page',
    sourceTitle: 'Mobile App Landing Page',
    deadline: '2026-07-08',
    bids: 7,
    status: 'Closed',
  },
  {
    title: 'Event Management Dashboard',
    sourceTitle: 'Event Management Dashboard',
    deadline: '2026-10-12',
    bids: 10,
    status: 'Open',
  },
]

const initialProjects = projectConfig.map((config, index) => {
  const source = mockProjects.find((project) => project.title === config.sourceTitle)
  const companySource = mockCompanyProjects.find(
    (project) => project.title === config.title,
  )

  return {
    id: source?.id ?? companySource?.id ?? index + 1,
    title: config.title,
    category: source?.category ?? 'Web Development',
    description:
      source?.description ??
      'Create a polished digital product that supports the company’s current business goals.',
    budget: companySource?.budget ?? source?.budget ?? '€800–€1,200',
    deadline: config.deadline,
    bids: config.bids,
    status: config.status,
    skills: source?.skills ?? ['React', 'UI Design'],
  }
})

const emptyForm = {
  title: '',
  description: '',
  budget: '',
  deadline: '',
  category: 'Web Development',
}

const categories = [
  'Web Development',
  'UI/UX Design',
  'E-commerce',
  'Branding',
  'Dashboard Design',
  'Mobile Development',
]

const inputClasses =
  'mt-2 w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

function StatusBadge({ status }) {
  const classes =
    status === 'Open'
      ? 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]'
      : 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]'

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${classes}`}
    >
      {status}
    </span>
  )
}

export default function ManageProjects() {
  const { showToast } = useToast()
  const [projects, setProjects] = useState(initialProjects)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [skills, setSkills] = useState([])

  const openProjects = projects.filter((project) => project.status === 'Open').length
  const closedProjects = projects.filter((project) => project.status === 'Closed').length
  const totalBids = projects.reduce((total, project) => total + project.bids, 0)
  const stats = [
    { label: 'Active Projects', value: openProjects },
    { label: 'Total Bids', value: totalBids },
    { label: 'Open Projects', value: openProjects },
    { label: 'Closed Projects', value: closedProjects },
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

  const openEditForm = (project) => {
    setEditingId(project.id)
    setForm({
      title: project.title,
      description: project.description,
      budget: project.budget,
      deadline: project.deadline,
      category: project.category,
    })
    setSkills(project.skills)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const wasEditing = editingId !== null

    if (editingId !== null) {
      setProjects((current) =>
        current.map((project) =>
          project.id === editingId ? { ...project, ...form, skills } : project,
        ),
      )
    } else {
      setProjects((current) => [
        {
          id: Date.now(),
          ...form,
          skills,
          bids: 0,
          status: 'Open',
        },
        ...current,
      ])
    }

    closeForm()
    showToast(wasEditing ? 'Project updated successfully.' : 'New project published successfully.', 'success')
  }

  const deleteProject = (project) => {
    if (
      window.confirm(
        `Delete “${project.title}”? This action cannot be undone.`,
      )
    ) {
      setProjects((current) =>
        current.filter((item) => item.id !== project.id),
      )
      showToast(`${project.title} was deleted.`, 'error')
    }
  }

  const viewProject = (project) => {
    window.alert(
      `${project.title}\n\n${project.description}\n\nRequired skills: ${project.skills.join(', ')}`,
    )
  }

  const viewBids = (project) => {
    window.alert(
      `${project.title} currently has ${project.bids} bids. The detailed bids page will be connected in a future update.`,
    )
  }

  return (
    <DashboardLayout
      title="Manage Projects"
      navItems={navItems}
      userType="Company"
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-sm text-[#64ffda]">Project workspace</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Manage Projects
            </h2>
            <p className="mt-3 text-[#8892b0]">
              Create, edit, and manage projects that candidates can bid on.
            </p>
          </div>
          <Button size="lg" onClick={openCreateForm}>
            Post New Project
          </Button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, index) => (
            <Card key={item.label} hover>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-[#8892b0]">{item.label}</p>
                  <p className="mt-3 text-3xl font-bold text-[#e6f1ff]">
                    {item.value}
                  </p>
                </div>
                <span className="font-mono text-xs text-[#64ffda]">
                  0{index + 1}
                </span>
              </div>
            </Card>
          ))}
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[#e6f1ff] sm:text-2xl">
              Published Projects
            </h2>
            <p className="mt-1 text-sm text-[#8892b0]">
              {projects.length} projects in your company workspace.
            </p>
          </div>

          <Card padding="sm" className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-[#233554] text-[11px] uppercase tracking-wider text-[#64748b]">
                    <th className="px-4 py-3 font-medium">Project title</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Budget</th>
                    <th className="px-4 py-3 font-medium">Deadline</th>
                    <th className="px-4 py-3 font-medium">Bids</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-[#233554]/70 transition-colors last:border-0 hover:bg-[#172a45]/60"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-[#e6f1ff]">
                        {project.title}
                      </td>
                      <td className="px-4 py-4 text-xs text-[#8892b0]">
                        {project.category}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#e6f1ff]">
                        {project.budget}
                      </td>
                      <td className="px-4 py-4 text-xs text-[#facc15]">
                        {project.deadline}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#e6f1ff]">
                        {project.bids}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewProject(project)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditForm(project)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteProject(project)}
                          >
                            Delete
                          </Button>
                          <Button size="sm" onClick={() => viewBids(project)}>
                            View Bids
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-4 md:hidden">
            {projects.map((project) => (
              <Card key={project.id} hover>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748b]">
                      {project.category}
                    </p>
                    <h3 className="mt-2 font-semibold text-[#e6f1ff]">
                      {project.title}
                    </h3>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[#233554] py-4 text-xs">
                  <div>
                    <p className="text-[#64748b]">Budget</p>
                    <p className="mt-1 text-[#e6f1ff]">{project.budget}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b]">Deadline</p>
                    <p className="mt-1 text-[#facc15]">{project.deadline}</p>
                  </div>
                  <div>
                    <p className="text-[#64748b]">Bids</p>
                    <p className="mt-1 text-[#e6f1ff]">{project.bids}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => viewProject(project)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditForm(project)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteProject(project)}
                  >
                    Delete
                  </Button>
                  <Button size="sm" onClick={() => viewBids(project)}>
                    View Bids
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <Card
            padding="lg"
            className="max-h-full w-full max-w-2xl overflow-y-auto shadow-2xl shadow-black/40"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-form-title"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-[#64ffda]">
                    {editingId !== null ? 'Update project' : 'New project'}
                  </p>
                  <h2
                    id="project-form-title"
                    className="mt-2 text-2xl font-bold text-[#e6f1ff]"
                  >
                    {editingId !== null ? 'Edit Project' : 'Post New Project'}
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
                  <label htmlFor="project-title" className="text-sm font-medium">
                    Project title
                  </label>
                  <input
                    id="project-title"
                    name="title"
                    value={form.title}
                    onChange={updateField}
                    required
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="project-description"
                    className="text-sm font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    id="project-description"
                    name="description"
                    rows="4"
                    value={form.description}
                    onChange={updateField}
                    required
                    className={`${inputClasses} resize-y`}
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label htmlFor="project-budget" className="text-sm font-medium">
                      Budget
                    </label>
                    <input
                      id="project-budget"
                      name="budget"
                      value={form.budget}
                      onChange={updateField}
                      placeholder="€1,000–€1,500"
                      required
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="project-deadline"
                      className="text-sm font-medium"
                    >
                      Deadline
                    </label>
                    <input
                      id="project-deadline"
                      name="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={updateField}
                      required
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="project-category"
                      className="text-sm font-medium"
                    >
                      Category
                    </label>
                    <select
                      id="project-category"
                      name="category"
                      value={form.category}
                      onChange={updateField}
                      className={inputClasses}
                    >
                      {categories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Required skills</label>
                  <div className="mt-2">
                    <SkillsInput
                      skills={skills}
                      setSkills={setSkills}
                      placeholder="Add a required skill"
                    />
                  </div>
                </div>
                <div className="flex flex-col-reverse gap-3 border-t border-[#233554] pt-6 sm:flex-row sm:justify-end">
                  <Button type="button" variant="ghost" onClick={closeForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingId !== null ? 'Save Project' : 'Publish Project'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
