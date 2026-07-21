import { useEffect, useState } from 'react'
import {
  deleteUser,
  getAdminUsers,
  updateUserStatus,
} from '../api/adminApi'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Members', href: '/admin/candidates' },
  { label: 'Companies', href: '/admin/companies' },
  { label: 'Jobs', href: '/admin/jobs' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Reports', href: '/admin/reports' },
  { label: 'Logout', href: '/login' },
]
const control =
  'w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda]'
const roleStyle = {
  Admin: 'bg-[#64ffda]/10 text-[#64ffda]',
  Candidate: 'bg-blue-500/10 text-blue-300',
  Company: 'bg-violet-500/10 text-violet-300',
}
const displayRole = (role) => role === 'Candidate' ? 'Member' : role

const getErrorMessage = (error, fallback) => {
  const errors = error.response?.data?.errors
  const messages = errors ? Object.values(errors).flat().filter(Boolean) : []
  return messages.length
    ? messages.join(' ')
    : error.response?.data?.message || fallback
}

function UserBadges({ user }) {
  return (
    <>
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${roleStyle[user.role] ?? 'bg-[#233554] text-[#8892b0]'}`}
      >
        {displayRole(user.role)}
      </span>
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${user.status === 'Active' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}
      >
        {user.status}
      </span>
    </>
  )
}

export default function AdminUsers() {
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState('All')
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
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let isActive = true

    async function loadUsers() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getAdminUsers({
          search: debouncedSearch || undefined,
          per_page: 15,
          page,
        })
        if (!isActive) return
        setUsers(response.data)
        setPagination(response)
      } catch (requestError) {
        if (!isActive) return
        setUsers([])
        setError(getErrorMessage(requestError, 'Unable to load users.'))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadUsers()
    return () => {
      isActive = false
    }
  }, [debouncedSearch, page, refreshKey])

  const filtered = users.filter(
    (item) =>
      (role === 'All' || item.role === role) &&
      (status === 'All' || item.status === status),
  )
  const lastPage = Math.max(
    1,
    Math.ceil(
      Number(pagination.total ?? 0) / Number(pagination.per_page ?? 15),
    ),
  )

  const toggleStatus = async (user) => {
    if (user.role === 'Admin') return
    const nextStatus = user.status === 'Active' ? 'disabled' : 'active'
    setUpdatingId(user.id)
    try {
      const response = await updateUserStatus(user.id, nextStatus)
      showToast(
        response.message ?? `${user.name}'s status was updated.`,
        nextStatus === 'active' ? 'success' : 'warning',
      )
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      showToast(
        getErrorMessage(requestError, 'Unable to update this user.'),
        'error',
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const removeUser = async (user) => {
    if (user.role === 'Admin' || !window.confirm(`Delete ${user.name}?`)) return

    setDeletingId(user.id)
    try {
      const response = await deleteUser(user.id)
      showToast(response.message ?? `${user.name} was deleted.`, 'success')
      if (users.length === 1 && page > 1) {
        setPage((current) => current - 1)
      } else {
        setRefreshKey((current) => current + 1)
      }
    } catch (requestError) {
      showToast(
        getErrorMessage(requestError, 'Unable to delete this user.'),
        'error',
      )
    } finally {
      setDeletingId(null)
    }
  }

  const viewUser = (user) => {
    const profile = user.candidateProfile ?? user.companyProfile
    const profileDetail =
      profile?.headline ?? profile?.company_name ?? 'No profile details available'
    window.alert(
      `${user.name}\n${user.email}\n${displayRole(user.role)} · ${user.status}\n${profileDetail}`,
    )
  }

  const Actions = ({ user }) => {
    const isAdmin = user.role === 'Admin'
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => viewUser(user)}>
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isAdmin || updatingId !== null || deletingId !== null}
          onClick={() => toggleStatus(user)}
        >
          {updatingId === user.id
            ? 'Updating...'
            : user.status === 'Active'
              ? 'Disable'
              : 'Enable'}
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={isAdmin || deletingId !== null || updatingId !== null}
          onClick={() => removeUser(user)}
        >
          {deletingId === user.id ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    )
  }

  return (
    <DashboardLayout title="Users" navItems={navItems} userType="Admin">
      <div className="space-y-8">
        <section>
          <p className="font-mono text-sm text-[#64ffda]">User management</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Users</h2>
          <p className="mt-3 text-[#8892b0]">Manage all platform users.</p>
        </section>

        <Card>
          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search name or email..."
              aria-label="Search users"
              className={control}
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              aria-label="Filter role"
              className={control}
            >
              {['All', 'Candidate', 'Company', 'Admin'].map((item) => (
                <option key={item} value={item}>{displayRole(item)}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter status"
              className={control}
            >
              {['All', 'Active', 'Disabled'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </Card>

        <section>
          <p className="mb-4 text-sm text-[#8892b0]">
            Showing {filtered.length} of {pagination.total} users
          </p>
          {isLoading ? (
            <LoadingSpinner label="Loading users..." size="lg" />
          ) : error ? (
            <EmptyState title="Unable to load users" description={error} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No users found"
              description={
                users.length
                  ? 'Try changing your role or status filters.'
                  : 'No users match your search.'
              }
            />
          ) : (
            <>
              <Card padding="sm" className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead>
                      <tr className="border-b border-[#233554] text-xs text-[#64748b]">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Created</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-[#233554]/70 last:border-0"
                        >
                          <td className="p-4 text-sm font-medium">
                            {user.name}
                          </td>
                          <td className="p-4 text-sm text-[#8892b0]">
                            {user.email}
                          </td>
                          <td className="p-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] ${roleStyle[user.role] ?? 'bg-[#233554] text-[#8892b0]'}`}
                            >
                              {displayRole(user.role)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={
                                user.status === 'Active'
                                  ? 'text-[#22c55e]'
                                  : 'text-[#ef4444]'
                              }
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-[#8892b0]">
                            {user.createdDate}
                          </td>
                          <td className="p-4">
                            <Actions user={user} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="space-y-4 md:hidden">
                {filtered.map((user) => (
                  <Card key={user.id} hover>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="mt-1 text-sm text-[#8892b0]">
                      {user.email}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <UserBadges user={user} />
                    </div>
                    <p className="my-4 text-xs text-[#64748b]">
                      Created {user.createdDate}
                    </p>
                    <Actions user={user} />
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
    </DashboardLayout>
  )
}
