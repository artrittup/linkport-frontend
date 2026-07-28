import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  deleteAdminJob,
  deleteAdminProject,
  getAdminJobs,
  getAdminProjects,
} from '../api/adminApi'
import useToast from '../hooks/useToast'
import AdminConfirmDialog from './AdminConfirmDialog'
import Button from './Button'
import Card from './Card'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'
import Modal, { DetailGrid, DetailSection, SkillList } from './Modal'

const control = 'w-full rounded-md border border-[#233554] bg-[#0a192f]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda]'

const jobStatusStyles = {
  draft: 'bg-[#facc15]/10 text-[#facc15]',
  open: 'bg-[#22c55e]/10 text-[#22c55e]',
  closed: 'bg-[#ef4444]/10 text-[#fca5a5]',
}

const projectStatusStyles = {
  draft: 'bg-[#facc15]/10 text-[#facc15]',
  open: 'bg-[#22c55e]/10 text-[#22c55e]',
  closed: 'bg-[#ef4444]/10 text-[#fca5a5]',
}

const configurations = {
  jobs: {
    singular: 'Job',
    plural: 'Jobs',
    getItems: getAdminJobs,
    deleteItem: deleteAdminJob,
    statusStyles: jobStatusStyles,
    searchPlaceholder: 'Search Job titles...',
    empty: 'No Jobs match the current search and status.',
    deleteDescription: 'The Job will be removed. Related applications may be affected.',
  },
  projects: {
    singular: 'Company Project',
    plural: 'Company Projects',
    getItems: getAdminProjects,
    deleteItem: deleteAdminProject,
    statusStyles: projectStatusStyles,
    searchPlaceholder: 'Search Company Project titles...',
    empty: 'No Company Projects match the current search and status.',
    deleteDescription: 'The Company Project will be removed. Related proposals may be affected.',
  },
}

function StatusBadge({ status, styles }) {
  const value = String(status ?? '').toLowerCase()
  const label = value
    ? value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
    : 'Unknown'

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[value] ?? 'bg-[#233554] text-[#a8b2d1]'}`}>
      {label}
    </span>
  )
}

function displayValue(value, fallback = 'Not specified') {
  return value === null || value === undefined || value === '' ? fallback : String(value)
}

export default function AdminOpportunityList({ type, showHeading = false }) {
  const config = configurations[type] ?? configurations.jobs
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearch = searchParams.get('search') ?? ''
  const requestedStatus = searchParams.get('status')
  const status = ['draft', 'open', 'closed'].includes(requestedStatus)
    ? requestedStatus
    : 'all'
  const requestedPage = Number(searchParams.get('page'))
  const page = Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1
  const searchInputRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ current_page: 1, total: 0, per_page: 15 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [selected, setSelected] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmationError, setConfirmationError] = useState('')

  const updateParams = (updates, options) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all' || (key === 'page' && value === 1)) next.delete(key)
        else next.set(key, String(value))
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
    let active = true
    async function loadItems() {
      setLoading(true)
      setError('')
      try {
        const response = await config.getItems({
          search: urlSearch || undefined,
          per_page: 15,
          page,
        })
        if (!active) return
        setItems(response.data)
        setPagination(response)
      } catch {
        if (!active) return
        setItems([])
        setError(`${config.plural} could not be loaded right now.`)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadItems()

    return () => {
      active = false
    }
  }, [config, page, refreshKey, urlSearch])

  const visibleItems = items.filter((item) =>
    status === 'all' || String(item.status).toLowerCase() === status)
  const lastPage = Math.max(1, Math.ceil(Number(pagination.total ?? 0) / Math.max(1, Number(pagination.per_page ?? 15))))

  const confirmDelete = async () => {
    if (!pendingDelete || deletingId !== null) return
    setDeletingId(pendingDelete.id)
    setConfirmationError('')
    try {
      const response = await config.deleteItem(pendingDelete.id)
      showToast(response.message ?? `${pendingDelete.title} was deleted.`, 'success')
      setPendingDelete(null)
      setSelected((current) => current?.id === pendingDelete.id ? null : current)
      if (visibleItems.length === 1 && page > 1) updateParams({ page: page - 1 })
      else setRefreshKey((current) => current + 1)
    } catch {
      setConfirmationError(`Unable to delete this ${config.singular.toLowerCase()}. Please try again.`)
    } finally {
      setDeletingId(null)
    }
  }

  const openDelete = (item) => {
    if (deletingId !== null) return
    setConfirmationError('')
    setPendingDelete(item)
  }

  const Actions = ({ item }) => (
    <div className="flex flex-wrap justify-end gap-2">
      <Button variant="outline" size="sm" onClick={() => setSelected(item)}>Review</Button>
      <Button variant="danger" size="sm" disabled={deletingId !== null} onClick={() => openDelete(item)}>
        {deletingId === item.id ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  )

  return (
    <div className="min-w-0 space-y-6">
      {showHeading && (
        <section>
          <p className="font-mono text-sm text-[#64ffda]">Content moderation</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{config.plural}</h2>
          <p className="mt-3 text-[#8892b0]">Review and manage existing {config.plural.toLowerCase()}.</p>
        </section>
      )}

      <Card>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_13rem]">
          <div>
            <label htmlFor={`admin-${type}-search`} className="sr-only">Search {config.plural}</label>
            <input ref={searchInputRef} id={`admin-${type}-search`} type="search" defaultValue={urlSearch} onChange={handleSearchChange} maxLength={100} placeholder={config.searchPlaceholder} className={control} />
          </div>
          <div>
            <label htmlFor={`admin-${type}-status`} className="sr-only">Filter {config.plural} by status</label>
            <select id={`admin-${type}-status`} value={status} onChange={(event) => updateParams({ status: event.target.value, page: null })} className={control}>
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </Card>

      <p className="text-sm text-[#8892b0]">Showing {visibleItems.length} on this page · {pagination.total} total {config.plural.toLowerCase()}</p>

      {loading ? (
        <LoadingSpinner label={`Loading ${config.plural}...`} size="lg" />
      ) : error ? (
        <EmptyState title={`Unable to load ${config.plural}`} description={error} />
      ) : visibleItems.length === 0 ? (
        <EmptyState
          title={`No ${config.plural} found`}
          description={status !== 'all'
            ? `No ${config.plural.toLowerCase()} have this status on the current page.`
            : config.empty}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleItems.map((item) => (
            <Card key={`${type}-${item.id}`} hover className="min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words font-semibold">{item.title}</h3>
                  <p className="mt-1 break-words text-sm text-[#64ffda]">{item.company}</p>
                </div>
                <StatusBadge status={item.status} styles={config.statusStyles} />
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-[#233554] py-4 text-xs">
                {type === 'jobs' ? (
                  <>
                    <div><dt className="text-[#64748b]">Location</dt><dd className="mt-1 break-words">{displayValue(item.location, 'Location unavailable')}</dd></div>
                    <div><dt className="text-[#64748b]">Deadline</dt><dd className="mt-1 break-words">{displayValue(item.deadline, 'No deadline')}</dd></div>
                  </>
                ) : (
                  <>
                    <div><dt className="text-[#64748b]">Budget</dt><dd className="mt-1 break-words">{displayValue(item.budget, 'Budget unavailable')}</dd></div>
                    <div><dt className="text-[#64748b]">Deadline</dt><dd className="mt-1 break-words">{displayValue(item.deadline, 'No deadline')}</dd></div>
                  </>
                )}
                <div className="col-span-2"><dt className="text-[#64748b]">Created</dt><dd className="mt-1">{item.createdDate}</dd></div>
              </dl>
              <div className="mt-5"><Actions item={item} /></div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && lastPage > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateParams({ page: page - 1 })}>Previous</Button>
          <span className="text-sm text-[#8892b0]">Page {pagination.current_page} of {lastPage}</span>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => updateParams({ page: page + 1 })}>Next</Button>
        </div>
      )}

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} eyebrow={`Admin ${config.singular} review`} title={selected?.title ?? `${config.singular} details`}>
        {selected && (
          <>
            <DetailGrid items={[
              { label: 'Company', value: selected.company },
              { label: 'Status', value: selected.status },
              ...(type === 'jobs'
                ? [
                    { label: 'Location', value: selected.location },
                    { label: 'Type', value: selected.type },
                  ]
                : [
                    { label: 'Budget', value: displayValue(selected.budget, 'Budget unavailable') },
                    { label: 'Category', value: selected.category },
                  ]),
              { label: 'Deadline', value: selected.deadline ?? 'No deadline' },
              { label: 'Created', value: selected.createdDate },
            ]} />
            <SkillList skills={selected.skills ?? selected.required_skills} />
            <DetailSection label="Description">{selected.description}</DetailSection>
            {type === 'jobs' && <DetailSection label="Requirements">{selected.requirements}</DetailSection>}
          </>
        )}
      </Modal>

      <AdminConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title={`Delete ${config.singular}?`}
        entityName={pendingDelete?.title ?? `Selected ${config.singular}`}
        description={config.deleteDescription}
        confirmLabel={`Delete ${config.singular}`}
        isSubmitting={deletingId !== null}
        error={confirmationError}
        onCancel={() => {
          setPendingDelete(null)
          setConfirmationError('')
        }}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
