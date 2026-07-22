import { useEffect, useState } from 'react'
import { deleteAdminProject, getAdminProjects } from '../api/adminApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Jobs', href: '/admin/jobs' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Logout', href: '/login' },
]
const control =
  'rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm outline-none focus:border-[#64ffda]'

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback

const formatBudget = (value) => {
  const budget = Number(value)
  return Number.isFinite(budget)
    ? new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'EUR',
      }).format(budget)
    : 'Budget unavailable'
}

function Status({ status }) {
  const classes = {
    Open: 'bg-[#22c55e]/10 text-[#22c55e]',
    Draft: 'bg-[#facc15]/10 text-[#facc15]',
    Closed: 'bg-[#ef4444]/10 text-[#ef4444]',
  }[status] ?? 'bg-[#233554] text-[#8892b0]'

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${classes}`}>
      {status}
    </span>
  )
}

export default function AdminProjects() {
  const { showToast } = useToast()
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    )
    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let isActive = true

    async function loadProjects() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getAdminProjects({
          search: debouncedSearch || undefined,
          per_page: 15,
          page,
        })
        if (!isActive) return
        setProjects(response.data)
        setPagination(response)
      } catch (requestError) {
        if (!isActive) return
        setProjects([])
        setError(getErrorMessage(requestError, 'Unable to load projects.'))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadProjects()
    return () => {
      isActive = false
    }
  }, [debouncedSearch, page, refreshKey])

  const filtered = projects.filter(
    (project) => status === 'All' || project.status === status,
  )
  const lastPage = Math.max(
    1,
    Math.ceil(
      Number(pagination.total ?? 0) / Number(pagination.per_page ?? 15),
    ),
  )

  const removeProject = async (project) => {
    if (!window.confirm(`Delete “${project.title}”?`)) return

    setDeletingId(project.id)
    try {
      const response = await deleteAdminProject(project.id)
      showToast(response.message ?? `${project.title} was deleted.`, 'success')
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

  const Actions = ({ project }) => (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          window.alert(
            `${project.title}\n${project.company}\n${formatBudget(project.budget)}\n\n${project.description ?? ''}`,
          )
        }
      >
        View
      </Button>
      <Button
        variant="danger"
        size="sm"
        disabled={deletingId !== null}
        onClick={() => removeProject(project)}
      >
        {deletingId === project.id ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  )

  return (
    <DashboardLayout title="Projects" navItems={navItems} userType="Admin">
      <section className="mb-8">
        <p className="font-mono text-sm text-[#64ffda]">Content moderation</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Projects</h2>
        <p className="mt-3 text-[#8892b0]">
          Review and manage company projects.
        </p>
      </section>

      <Card>
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search project title..."
            aria-label="Search projects"
            className={control}
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Status"
            className={control}
          >
            {['All', 'Draft', 'Open', 'Closed'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </Card>

      <p className="mb-4 mt-8 text-sm text-[#8892b0]">
        Showing {filtered.length} of {pagination.total} projects
      </p>
      {isLoading ? (
        <LoadingSpinner label="Loading projects..." size="lg" />
      ) : error ? (
        <EmptyState title="Unable to load projects" description={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No projects found"
          description={
            projects.length
              ? 'Try changing your status filter.'
              : 'No projects match your search.'
          }
        />
      ) : (
        <>
          <Card padding="sm" className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-[#233554] text-xs text-[#64748b]">
                    <th className="p-4">Title</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Budget</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-[#233554]/70 last:border-0"
                    >
                      <td className="p-4 text-sm font-medium">
                        {project.title}
                      </td>
                      <td className="p-4 text-sm text-[#64ffda]">
                        {project.company}
                      </td>
                      <td className="p-4 text-sm">
                        {formatBudget(project.budget)}
                      </td>
                      <td className="p-4">
                        <Status status={project.status} />
                      </td>
                      <td className="p-4 text-xs text-[#8892b0]">
                        {project.createdDate}
                      </td>
                      <td className="p-4">
                        <Actions project={project} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-4 md:hidden">
            {filtered.map((project) => (
              <Card key={project.id} hover>
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="mt-1 text-sm text-[#64ffda]">
                      {project.company}
                    </p>
                  </div>
                  <Status status={project.status} />
                </div>
                <p className="my-4 text-sm">
                  {formatBudget(project.budget)}
                </p>
                <p className="mb-4 text-xs text-[#8892b0]">
                  Created {project.createdDate}
                </p>
                <Actions project={project} />
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
    </DashboardLayout>
  )
}
