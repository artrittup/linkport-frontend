import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  createProject,
  deleteProject as removeProject,
  getCompanyProjects,
  updateProject,
} from '../api/projectsApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal, { DetailGrid, DetailSection, SkillList } from '../components/Modal'
import SkillsInput from '../components/SkillsInput'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const emptyForm = {
  title: '',
  description: '',
  budget: '',
  deadline: '',
  category: 'Web Development',
  status: 'draft',
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
const controlClasses =
  'w-full rounded-md border border-[#233554] bg-[#112240] px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda]'

const getErrorMessage = (error, fallback) => {
  const errors = error.response?.data?.errors
  const messages = errors ? Object.values(errors).flat().filter(Boolean) : []
  return messages.length
    ? messages.join(' ')
    : error.response?.data?.message || fallback
}

function StatusBadge({ status }) {
  const classes = {
    Open: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]',
    Draft: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
    Closed: 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]',
  }[status] ?? 'border-[#233554] text-[#8892b0]'

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${classes}`}
    >
      {status}
    </span>
  )
}

export default function ManageProjects() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
  })
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
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadProjects() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getCompanyProjects({
          status:
            statusFilter === 'All statuses'
              ? undefined
              : statusFilter.toLowerCase(),
          per_page: 15,
          page,
        })
        if (!isActive) return
        setProjects(response.data)
        setPagination(response)
      } catch (requestError) {
        if (!isActive) return
        setProjects([])
        setError(
          getErrorMessage(requestError, 'Unable to load company projects.'),
        )
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadProjects()
    return () => {
      isActive = false
    }
  }, [page, refreshKey, statusFilter])

  const query = search.trim().toLowerCase()
  const filteredProjects = projects.filter(
    (project) =>
      !query ||
      project.title?.toLowerCase().includes(query) ||
      project.category?.toLowerCase().includes(query) ||
      project.skills?.some((skill) => skill.toLowerCase().includes(query)),
  )
  const stats = [
    { label: 'Projects on This Page', value: projects.length },
    {
      label: 'Bids',
      value: projects.reduce((total, project) => total + project.bids, 0),
    },
    {
      label: 'Open Projects',
      value: projects.filter((project) => project.status === 'Open').length,
    },
    {
      label: 'Closed Projects',
      value: projects.filter((project) => project.status === 'Closed').length,
    },
  ]
  const lastPage = Math.max(
    1,
    Math.ceil(
      Number(pagination.total ?? 0) / Number(pagination.per_page ?? 15),
    ),
  )

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const closeForm = () => {
    if (!isSaving) {
      setIsFormOpen(false)
      setEditingId(null)
      setFormError('')
    }
  }

  const openCreateForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSkills([])
    setOriginalDeadline('')
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditForm = (project) => {
    setEditingId(project.id)
    setForm({
      title: project.title ?? '',
      description: project.description ?? '',
      budget: project.budget ?? '',
      deadline: project.deadline ?? '',
      category: project.category ?? '',
      status: project.status?.toLowerCase() ?? 'draft',
    })
    setSkills(project.skills ?? [])
    setOriginalDeadline(project.deadline ?? '')
    setFormError('')
    setIsFormOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setFormError('')
    const intent = event.nativeEvent.submitter?.value
    const payload = {
      title: form.title,
      description: form.description,
      budget: form.budget,
      deadline: form.deadline || null,
      required_skills: skills,
      category: form.category || null,
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
      const response =
        editingId !== null
          ? await updateProject(editingId, payload)
          : await createProject(payload)
      showToast(
        response.message ??
          (editingId !== null
            ? 'Project updated successfully.'
            : 'Project created successfully.'),
        'success',
      )
      setIsFormOpen(false)
      setEditingId(null)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setFormError(
        getErrorMessage(requestError, 'Unable to save this project.'),
      )
    } finally {
      setIsSaving(false)
    }
  }

  const deleteSelectedProject = async (project) => {
    if (
      !window.confirm(
        `Delete \u201c${project.title}\u201d? This action cannot be undone.`,
      )
    ) {
      return
    }

    setDeletingId(project.id)
    try {
      const response = await removeProject(project.id)
      showToast(
        response.message ?? `${project.title} was deleted.`,
        'success',
      )
      if (projects.length === 1 && page > 1) {
        setPage((current) => current - 1)
      } else {
        setRefreshKey((current) => current + 1)
      }
    } catch (requestError) {
      showToast(
        getErrorMessage(requestError, 'Unable to delete this project.'),
        'error',
      )
    } finally {
      setDeletingId(null)
    }
  }

  const viewProject = (project) => {
    setSelectedProject(project)
  }

  const viewBids = () => navigate('/company/bids')

  return (
    <DashboardLayout
      title="Manage Projects"
      userType="Company"
    >
      <div className="space-y-8">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-sm text-[#64ffda]">
              Project workspace
            </p>
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

        <Card>
          <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, category, or skill..."
              aria-label="Search projects"
              className={controlClasses}
            />
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setPage(1)
              }}
              aria-label="Filter project status"
              className={controlClasses}
            >
              {['All statuses', 'Draft', 'Open', 'Closed'].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        </Card>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[#e6f1ff] sm:text-2xl">
              Company Projects
            </h2>
            <p className="mt-1 text-sm text-[#8892b0]">
              {pagination.total ?? 0} projects in your company workspace.
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner label="Loading company projects..." size="lg" />
          ) : error ? (
            <EmptyState title="Unable to load projects" description={error} />
          ) : filteredProjects.length === 0 ? (
            <EmptyState
              title="No projects found"
              description={
                projects.length
                  ? 'Try changing your search.'
                  : 'Create your first company project.'
              }
            />
          ) : (
            <>
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
                        <th className="px-4 py-3 text-right font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project) => (
                        <tr
                          key={project.id}
                          className="border-b border-[#233554]/70 transition-colors last:border-0 hover:bg-[#172a45]/60"
                        >
                          <td className="px-4 py-4 text-sm font-medium text-[#e6f1ff]">
                            {project.title}
                          </td>
                          <td className="px-4 py-4 text-xs text-[#8892b0]">
                            {project.category || 'Not specified'}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#e6f1ff]">
                            {project.budget}
                          </td>
                          <td className="px-4 py-4 text-xs text-[#facc15]">
                            {project.deadline || 'No deadline'}
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
                                disabled={deletingId === project.id}
                                onClick={() => deleteSelectedProject(project)}
                              >
                                {deletingId === project.id
                                  ? 'Deleting...'
                                  : 'Delete'}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => viewBids(project)}
                              >
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
                {filteredProjects.map((project) => (
                  <Card key={project.id} hover>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748b]">
                          {project.category || 'Uncategorized'}
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
                        <p className="mt-1 text-[#e6f1ff]">
                          {project.budget}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#64748b]">Deadline</p>
                        <p className="mt-1 text-[#facc15]">
                          {project.deadline || 'No deadline'}
                        </p>
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
                        disabled={deletingId === project.id}
                        onClick={() => deleteSelectedProject(project)}
                      >
                        {deletingId === project.id ? 'Deleting...' : 'Delete'}
                      </Button>
                      <Button size="sm" onClick={() => viewBids(project)}>
                        View Bids
                      </Button>
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
        </section>
      </div>

      <Modal isOpen={Boolean(selectedProject)} onClose={() => setSelectedProject(null)} eyebrow="Project details" title={selectedProject?.title ?? 'Project details'}>
        {selectedProject && <><DetailGrid items={[
          { label: 'Status', value: selectedProject.status }, { label: 'Category', value: selectedProject.category ?? 'Not specified' },
          { label: 'Budget', value: selectedProject.budget }, { label: 'Deadline', value: selectedProject.deadline || 'No deadline' },
          { label: 'Bids', value: selectedProject.bids },
        ]} /><SkillList skills={selectedProject.skills} /><DetailSection label="Description">{selectedProject.description}</DetailSection></>}
      </Modal>

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
                  disabled={isSaving}
                  onClick={closeForm}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-xl text-[#8892b0] transition-colors hover:bg-[#172a45] hover:text-[#64ffda] disabled:opacity-50"
                  aria-label="Close form"
                >
                  &times;
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
                    <label
                      htmlFor="project-budget"
                      className="text-sm font-medium"
                    >
                      Budget
                    </label>
                    <input
                      id="project-budget"
                      name="budget"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.budget}
                      onChange={updateField}
                      placeholder="1500.00"
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
                    <input
                      id="project-category"
                      name="category"
                      list="project-categories"
                      value={form.category}
                      onChange={updateField}
                      className={inputClasses}
                    />
                    <datalist id="project-categories">
                      {categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>
                </div>
                {editingId !== null && (
                  <div>
                    <label
                      htmlFor="project-status"
                      className="text-sm font-medium"
                    >
                      Status
                    </label>
                    <select
                      id="project-status"
                      name="status"
                      value={form.status}
                      onChange={updateField}
                      className={inputClasses}
                    >
                      <option value="draft">Draft</option>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                )}
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
                {formError && (
                  <p
                    role="alert"
                    className="rounded-md border border-[#ef4444]/40 bg-[#ef4444]/10 p-3 text-sm text-[#fca5a5]"
                  >
                    {formError}
                  </p>
                )}
                <div className="flex flex-col-reverse gap-3 border-t border-[#233554] pt-6 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isSaving}
                    onClick={closeForm}
                  >
                    Cancel
                  </Button>
                  {editingId === null ? (
                    <>
                      <button
                        type="submit"
                        value="draft"
                        disabled={isSaving}
                        className="rounded-md border border-[#64ffda] px-4 py-2 text-sm text-[#64ffda] disabled:opacity-50"
                      >
                        Save Draft
                      </button>
                      <button
                        type="submit"
                        value="open"
                        disabled={isSaving}
                        className="rounded-md border border-[#64ffda] bg-[#64ffda] px-4 py-2 text-sm font-medium text-[#0a192f] disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Publish Project'}
                      </button>
                    </>
                  ) : (
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
