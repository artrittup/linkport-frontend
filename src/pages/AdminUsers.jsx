import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  deleteUser,
  getAdminUsers,
  updateUserStatus,
} from '../api/adminApi'
import Button from '../components/Button'
import AdminConfirmDialog from '../components/AdminConfirmDialog'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal, { DetailGrid, DetailSection, SkillList } from '../components/Modal'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const control =
  'w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda]'
const roleStyle = {
  Admin: 'bg-[#64ffda]/10 text-[#64ffda]',
  Candidate: 'bg-blue-500/10 text-blue-300',
  Company: 'bg-violet-500/10 text-violet-300',
}
const displayRole = (role) => role || 'Unknown'
const statusStyle = {
  Active: 'bg-[#22c55e]/10 text-[#22c55e]',
  Disabled: 'bg-[#ef4444]/10 text-[#fca5a5]',
}

const getErrorMessage = (error, fallback) => {
  const errors = error.response?.data?.errors
  const messages = errors ? Object.values(errors).flat().filter(Boolean) : []
  const status = error.response?.status
  return messages.length
    ? messages.join(' ')
    : status && status < 500
      ? error.response?.data?.message || fallback
      : fallback
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
        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle[user.status] ?? 'bg-[#233554] text-[#a8b2d1]'}`}
      >
        {user.status}
      </span>
    </>
  )
}

export default function AdminUsers() {
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedRole = searchParams.get('role')
  const role = ['candidate', 'company', 'admin'].includes(requestedRole)
    ? requestedRole
    : 'all'
  const requestedStatus = searchParams.get('status')
  const status = ['active', 'disabled'].includes(requestedStatus)
    ? requestedStatus
    : 'all'
  const requestedPage = Number(searchParams.get('page'))
  const page = Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1
  const urlSearch = searchParams.get('search') ?? ''
  const [users, setUsers] = useState([])
  const searchInputRef = useRef(null)
  const searchTimeoutRef = useRef(null)
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
  const [selectedUser, setSelectedUser] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [confirmationError, setConfirmationError] = useState('')

  const updateParams = (updates, options) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all' || (key === 'page' && value === 1)) {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      })
      return next
    }, options)
  }

  useEffect(() => {
    return () => window.clearTimeout(searchTimeoutRef.current)
  }, [])

  useEffect(() => {
    const input = searchInputRef.current
    if (input && input.value.trim() !== urlSearch) input.value = urlSearch
  }, [urlSearch])

  const handleSearchChange = (event) => {
    const value = event.target.value
    window.clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = window.setTimeout(() => {
      updateParams({ search: value.trim(), page: null }, { replace: true })
    }, 350)
  }

  useEffect(() => {
    let isActive = true

    async function loadUsers() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getAdminUsers({
          search: urlSearch || undefined,
          role: role === 'all' ? undefined : role,
          status: status === 'all' ? undefined : status,
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
  }, [page, refreshKey, role, status, urlSearch])

  const lastPage = Math.max(
    1,
    Math.ceil(
      Number(pagination.total ?? 0) / Number(pagination.per_page ?? 15),
    ),
  )

  const updateStatus = async (user, nextStatus, fromConfirmation = false) => {
    if (user.role === 'Admin' || updatingId !== null || deletingId !== null) return
    setUpdatingId(user.id)
    try {
      const response = await updateUserStatus(user.id, nextStatus)
      showToast(
        response.message ?? `${user.name}'s status was updated.`,
        nextStatus === 'active' ? 'success' : 'warning',
      )
      if (page === 1) {
        setRefreshKey((current) => current + 1)
      } else {
        updateParams({ page: null })
      }
      if (fromConfirmation) setPendingAction(null)
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Unable to update this user.')
      if (fromConfirmation) setConfirmationError(message)
      else showToast(message, 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleStatus = (user) => {
    if (user.role === 'Admin' || updatingId !== null || deletingId !== null) return
    if (user.status === 'Active') {
      setConfirmationError('')
      setPendingAction({ type: 'disable', user })
    } else {
      updateStatus(user, 'active')
    }
  }

  const confirmAction = async () => {
    const user = pendingAction?.user
    if (!user || updatingId !== null || deletingId !== null) return
    if (pendingAction.type === 'disable') {
      await updateStatus(user, 'disabled', true)
      return
    }
    setDeletingId(user.id)
    try {
      const response = await deleteUser(user.id)
      showToast(response.message ?? `${user.name} was deleted.`, 'success')
      if (users.length === 1 && page > 1) {
        updateParams({ page: page - 1 })
      } else {
        setRefreshKey((current) => current + 1)
      }
      setPendingAction(null)
    } catch (requestError) {
      setConfirmationError(
        getErrorMessage(requestError, 'Unable to delete this user.'),
      )
    } finally {
      setDeletingId(null)
    }
  }

  const viewUser = (user) => {
    setSelectedUser(user)
  }

  const Actions = ({ user }) => {
    const isAdmin = user.role === 'Admin'
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => viewUser(user)}>
          Review
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
          onClick={() => {
            setConfirmationError('')
            setPendingAction({ type: 'delete', user })
          }}
        >
          {deletingId === user.id ? 'Deleting...' : 'Delete'}
        </Button>
        {isAdmin && <span className="w-full text-right text-[10px] text-[#64748b]">Admin accounts are protected.</span>}
      </div>
    )
  }

  return (
    <DashboardLayout title="Users" userType="Admin">
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
              ref={searchInputRef}
              defaultValue={urlSearch}
              onChange={handleSearchChange}
              maxLength={100}
              placeholder="Search name or email..."
              aria-label="Search users"
              className={control}
            />
            <select
              value={role}
              onChange={(event) => {
                updateParams({ role: event.target.value, page: null })
              }}
              aria-label="Filter role"
              className={control}
            >
              <option value="all">All users</option>
              <option value="candidate">Candidates</option>
              <option value="company">Companies</option>
              <option value="admin">Administrators</option>
            </select>
            <select
              value={status}
              onChange={(event) => {
                updateParams({ status: event.target.value, page: null })
              }}
              aria-label="Filter status"
              className={control}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </Card>

        <section>
          <p className="mb-4 text-sm text-[#8892b0]">
            Showing {users.length} of {pagination.total} users
          </p>
          {isLoading ? (
            <LoadingSpinner label="Loading users..." size="lg" />
          ) : error ? (
            <EmptyState title="Unable to load users" description={error} />
          ) : users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="No users match the current search and filters."
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
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-[#233554]/70 last:border-0"
                        >
                          <td className="p-4 text-sm font-medium">
                            {user.name}
                          </td>
                          <td className="break-all p-4 text-sm text-[#8892b0]">
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
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle[user.status] ?? 'bg-[#233554] text-[#a8b2d1]'}`}
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
                {users.map((user) => (
                  <Card key={user.id} hover>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="mt-1 break-all text-sm text-[#8892b0]">
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
                onClick={() => updateParams({ page: page - 1 })}
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
                onClick={() => updateParams({ page: page + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </div>
      <Modal isOpen={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} eyebrow="Admin user details" title={selectedUser?.name ?? 'User details'}>
        {selectedUser && <><DetailGrid items={[
          { label: 'Email', value: selectedUser.email, fullWidth: true },
          { label: 'Role', value: displayRole(selectedUser.role) },
          { label: 'Status', value: selectedUser.status },
          { label: 'Created', value: selectedUser.createdDate },
          { label: 'Location', value: (selectedUser.candidateProfile ?? selectedUser.companyProfile)?.location },
        ]} /><DetailSection label="Profile summary">{(selectedUser.candidateProfile ?? selectedUser.companyProfile)?.headline ?? (selectedUser.candidateProfile ?? selectedUser.companyProfile)?.company_name ?? (selectedUser.candidateProfile ?? selectedUser.companyProfile)?.bio ?? (selectedUser.candidateProfile ?? selectedUser.companyProfile)?.description}</DetailSection><SkillList skills={(selectedUser.candidateProfile ?? selectedUser.companyProfile)?.skills} /></>}
      </Modal>
      <AdminConfirmDialog
        isOpen={Boolean(pendingAction)}
        title={pendingAction?.type === 'disable' ? 'Disable account?' : 'Delete user?'}
        entityName={pendingAction?.user?.name ?? 'Selected user'}
        description={pendingAction?.type === 'disable'
          ? 'The account will be disabled and its active sessions will end.'
          : 'The user account and associated records may be affected. This action may not be reversible.'}
        confirmLabel={pendingAction?.type === 'disable' ? 'Disable account' : 'Delete user'}
        isSubmitting={updatingId !== null || deletingId !== null}
        error={confirmationError}
        onCancel={() => {
          setPendingAction(null)
          setConfirmationError('')
        }}
        onConfirm={confirmAction}
      />
    </DashboardLayout>
  )
}
