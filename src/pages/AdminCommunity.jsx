import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  deleteCommunityEvent,
  getCommunityEvents,
} from '../api/communityEventsApi'
import { getCommunityMembers } from '../api/communityMembersApi'
import {
  deleteCommunityPost,
  getCommunityPosts,
} from '../api/communityPostsApi'
import {
  deleteCommunityProject,
  getCommunityProjects,
} from '../api/communityProjectsApi'
import {
  deleteTeammateRequest,
  getTeammateRequests,
} from '../api/teammateRequestsApi'
import AdminConfirmDialog from '../components/AdminConfirmDialog'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal, { DetailGrid, DetailSection, SkillList } from '../components/Modal'
import {
  getCommunityEventCategoryLabel,
  getCommunityEventFormatLabel,
  getCommunityEventStatusLabel,
} from '../data/communityEventMapper'
import { getCommunityPostCategoryLabel } from '../data/communityPostMapper'
import { getCommunityProjectStatusLabel } from '../data/communityProjectMapper'
import {
  getTeammateRequestCommitmentLabel,
  getTeammateRequestStatusLabel,
  getTeammateRequestWorkStyleLabel,
} from '../data/teammateRequestMapper'
import useToast from '../hooks/useToast'
import DashboardLayout from '../layouts/DashboardLayout'

const control = 'w-full rounded-md border border-border bg-background/70 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary'

const types = {
  projects: {
    label: 'Projects',
    entityLabel: 'Community Project',
    capability: 'Read and moderate',
    load: getCommunityProjects,
    remove: deleteCommunityProject,
    statuses: [
      ['looking_for_team', 'Looking for team'],
      ['in_progress', 'In progress'],
      ['completed', 'Completed'],
    ],
    title: (item) => item.title,
    owner: (item) => item.creator,
    status: (item) => getCommunityProjectStatusLabel(item.status),
    preview: (item) => item.shortDescription || item.fullDescription,
    createdAt: (item) => item.createdAt,
    details: (item) => [
      { label: 'Owner', value: item.creator },
      { label: 'Status', value: getCommunityProjectStatusLabel(item.status) },
      { label: 'Created', value: formatDate(item.createdAt) },
    ],
    skills: (item) => item.skills,
    description: (item) => item.fullDescription,
    deleteDescription: 'The Community Project will be removed. This does not affect Company Projects.',
  },
  posts: {
    label: 'Posts',
    entityLabel: 'Community Post',
    capability: 'Read and moderate',
    load: getCommunityPosts,
    remove: deleteCommunityPost,
    title: (item) => item.authorName || 'Community post',
    owner: (item) => item.authorName,
    status: (item) => getCommunityPostCategoryLabel(item.category),
    preview: (item) => item.content,
    createdAt: (item) => item.createdAt,
    details: (item) => [
      { label: 'Author', value: item.authorName },
      { label: 'Category', value: getCommunityPostCategoryLabel(item.category) },
      { label: 'Created', value: formatDate(item.createdAt) },
    ],
    tags: (item) => item.tags,
    description: (item) => item.content,
    deleteDescription: 'The Community Post will be removed. No report or approval state will be created.',
  },
  requests: {
    label: 'Teammate Requests',
    entityLabel: 'Teammate Request',
    capability: 'Read and moderate',
    load: getTeammateRequests,
    remove: deleteTeammateRequest,
    statuses: [
      ['open', 'Open'],
      ['closed', 'Closed'],
    ],
    title: (item) => item.title,
    owner: (item) => item.ownerName || 'LinkPort member',
    status: (item) => getTeammateRequestStatusLabel(item.status),
    preview: (item) => item.description,
    createdAt: (item) => item.createdAt,
    details: (item) => [
      { label: 'Owner', value: item.ownerName },
      { label: 'Status', value: getTeammateRequestStatusLabel(item.status) },
      { label: 'Work style', value: getTeammateRequestWorkStyleLabel(item.workStyle) },
      { label: 'Commitment', value: getTeammateRequestCommitmentLabel(item.commitment) },
      { label: 'Created', value: formatDate(item.createdAt) },
    ],
    skills: (item) => item.skills,
    description: (item) => item.description,
    deleteDescription: 'The Teammate Request will be removed. Contact details are not displayed or retained here.',
  },
  events: {
    label: 'Events',
    entityLabel: 'Community Event',
    capability: 'Read and moderate',
    load: (params) => getCommunityEvents({ ...params, upcoming: false }),
    remove: deleteCommunityEvent,
    statuses: [
      ['draft', 'Draft'],
      ['published', 'Published'],
      ['cancelled', 'Cancelled'],
    ],
    defaultStatus: 'published',
    title: (item) => item.title,
    owner: (item) => item.organizer || 'Organizer unavailable',
    status: (item) => getCommunityEventStatusLabel(item.status) || 'Unknown',
    preview: (item) => item.shortDescription || item.fullDescription,
    createdAt: (item) => item.createdAt,
    details: (item) => [
      { label: 'Organizer', value: item.organizer },
      { label: 'Status', value: getCommunityEventStatusLabel(item.status) || 'Unknown' },
      { label: 'Category', value: getCommunityEventCategoryLabel(item.category) },
      { label: 'Format', value: getCommunityEventFormatLabel(item.format) },
      { label: 'Starts', value: formatDateTime(item.startsAt) },
      { label: 'Ends', value: formatDateTime(item.endsAt) },
      { label: 'Capacity', value: item.capacity },
      { label: 'Attendees', value: item.attendeeCount },
    ],
    tags: (item) => item.topics,
    description: (item) => item.fullDescription || item.shortDescription,
    deleteDescription: 'The Community Event will be removed. Full create and edit management remains deferred.',
  },
  members: {
    label: 'Members',
    entityLabel: 'Community Member',
    capability: 'Read only',
    load: getCommunityMembers,
    title: (item) => item.name,
    owner: (item) => item.headline || 'Candidate',
    status: (item) => item.collaborationStatus
      ? item.collaborationStatus.replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
      : 'Not specified',
    preview: (item) => [item.university, item.fieldOfStudy, item.location].filter(Boolean).join(' · '),
    createdAt: (item) => item.updatedAt,
    details: (item) => [
      { label: 'Headline', value: item.headline },
      { label: 'University', value: item.university },
      { label: 'Field of study', value: item.fieldOfStudy },
      { label: 'Location', value: item.location },
      { label: 'Collaboration status', value: item.collaborationStatus
        ? item.collaborationStatus.replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
        : 'Not specified' },
    ],
    skills: (item) => item.skills,
    description: (item) => item.biography,
  },
}

function formatDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function formatDateTime(value) {
  if (!value) return 'Not specified'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not specified'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function previewText(value) {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim()
  return normalized.length > 180 ? `${normalized.slice(0, 177)}...` : normalized
}

function TagList({ label, items }) {
  const values = Array.isArray(items) ? items : []
  if (values.length === 0) return null

  return (
    <DetailSection label={label}>
      <div className="flex flex-wrap gap-2">
        {values.map((item, index) => (
          <span key={`${item}-${index}`} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary">{item}</span>
        ))}
      </div>
    </DetailSection>
  )
}

export default function AdminCommunity() {
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedType = searchParams.get('type')
  const type = Object.hasOwn(types, requestedType) ? requestedType : 'projects'
  const config = types[type]
  const urlSearch = searchParams.get('search') ?? ''
  const requestedStatus = searchParams.get('status')
  const validStatuses = config.statuses?.map(([value]) => value) ?? []
  const status = validStatuses.includes(requestedStatus)
    ? requestedStatus
    : config.defaultStatus ?? 'all'
  const requestedPage = Number(searchParams.get('page'))
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const searchInputRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const [source, setSource] = useState({
    items: [],
    total: 0,
    currentPage: 1,
    lastPage: 1,
    loading: true,
    error: '',
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [selected, setSelected] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
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
  }, [type, urlSearch])

  const handleSearchChange = (event) => {
    const value = event.target.value
    window.clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = window.setTimeout(() => {
      updateParams({ search: value.trim(), page: null }, { replace: true })
    }, 350)
  }

  useEffect(() => {
    let active = true
    async function loadSource() {
      setSource((current) => ({ ...current, loading: true, error: '' }))
      try {
        const response = await config.load({
          search: urlSearch || undefined,
          status: status !== 'all' ? status : undefined,
          per_page: 8,
          page,
        })
        if (!active) return
        setSource({
          items: response.data,
          total: response.meta.total,
          currentPage: response.meta.current_page,
          lastPage: response.meta.last_page,
          loading: false,
          error: '',
        })
      } catch {
        if (!active) return
        setSource({
          items: [],
          total: 0,
          currentPage: 1,
          lastPage: 1,
          loading: false,
          error: `${config.label} could not be loaded with Admin access.`,
        })
      }
    }
    loadSource()
    return () => {
      active = false
    }
  }, [config, page, refreshKey, status, urlSearch])

  const confirmDelete = async () => {
    if (!pendingDelete || deleting || !config.remove) return
    setDeleting(true)
    setConfirmationError('')
    try {
      const response = await config.remove(pendingDelete.id)
      showToast(response.message ?? `${config.entityLabel} was deleted.`, 'success')
      setPendingDelete(null)
      setSelected((current) => current?.id === pendingDelete.id ? null : current)
      if (source.items.length === 1 && page > 1) updateParams({ page: page - 1 })
      else setRefreshKey((current) => current + 1)
    } catch {
      setConfirmationError(`Unable to delete this ${config.entityLabel}. Please try again.`)
    } finally {
      setDeleting(false)
    }
  }

  const selectType = (nextType) => {
    window.clearTimeout(searchTimeoutRef.current)
    setSearchParams({ type: nextType })
  }

  return (
    <DashboardLayout title="Community" userType="Admin">
      <div className="min-w-0 space-y-8">
        <section>
          <p className="font-mono text-sm text-primary">Moderation workspace</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Community</h2>
          <p className="mt-3 max-w-2xl text-text-muted">Inspect community records and use only moderation actions authorized by the current backend.</p>
        </section>

        <nav className="flex max-w-full gap-2 overflow-x-auto border-b border-border pb-2" aria-label="Community content type">
          {Object.entries(types).map(([key, item]) => (
            <button
              key={key}
              type="button"
              aria-current={type === key ? 'page' : undefined}
              onClick={() => selectType(key)}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                type === key ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface hover:text-text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <Card>
          <div className={`grid gap-4 ${config.statuses ? 'sm:grid-cols-[minmax(0,1fr)_13rem]' : ''}`}>
            <div>
              <label htmlFor="admin-community-search" className="sr-only">Search {config.label}</label>
              <input ref={searchInputRef} id="admin-community-search" type="search" defaultValue={urlSearch} onChange={handleSearchChange} maxLength={100} placeholder={`Search ${config.label.toLowerCase()}...`} className={control} />
            </div>
            {config.statuses && (
              <div>
                <label htmlFor="admin-community-status" className="sr-only">Filter {config.label} by status</label>
                <select id="admin-community-status" value={status} onChange={(event) => updateParams({ status: event.target.value, page: null })} className={control}>
                  {!config.defaultStatus && <option value="all">All statuses</option>}
                  {config.statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">{source.total} matching {config.label.toLowerCase()}</p>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${config.remove ? 'bg-primary/10 text-primary' : 'bg-border text-text-secondary'}`}>{config.capability}</span>
        </div>

        {source.loading ? (
          <LoadingSpinner label={`Loading ${config.label}...`} size="lg" />
        ) : source.error ? (
          <EmptyState title={`${config.label} unavailable`} description={source.error} />
        ) : source.items.length === 0 ? (
          <EmptyState title={`No ${config.label} found`} description="No records match the current search and filters." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {source.items.map((item) => (
              <Card key={`${type}-${item.id}`} hover className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold">{config.title(item)}</h3>
                    <p className="mt-1 break-words text-sm text-primary">{config.owner(item)}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-border px-2.5 py-1 text-[10px] font-semibold text-text-secondary">{config.status(item)}</span>
                </div>
                <p className="mt-4 break-words text-sm leading-6 text-text-muted">{previewText(config.preview(item)) || 'No summary provided.'}</p>
                <p className="mt-4 text-xs text-text-subtle">{formatDate(config.createdAt(item))}</p>
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelected(item)}>View</Button>
                  {config.remove && (
                    <Button variant="danger" size="sm" disabled={deleting} onClick={() => {
                      setConfirmationError('')
                      setPendingDelete(item)
                    }}>Delete</Button>
                  )}
                </div>
                {!config.remove && <p className="mt-3 text-right text-xs text-text-subtle">Account actions remain in Admin Users.</p>}
              </Card>
            ))}
          </div>
        )}

        {!source.loading && !source.error && source.lastPage > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateParams({ page: page - 1 })}>Previous</Button>
            <span className="text-sm text-text-muted">Page {source.currentPage} of {source.lastPage}</span>
            <Button variant="outline" size="sm" disabled={page >= source.lastPage} onClick={() => updateParams({ page: page + 1 })}>Next</Button>
          </div>
        )}

        {type === 'events' && (
          <Card>
            <p className="text-sm text-text-muted">Event creation, editing, publishing, and cancellation are supported by backend authorization, but a complete validated Admin Event form is deferred. This phase exposes safe review and deletion only.</p>
          </Card>
        )}

        <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} eyebrow={`${config.entityLabel} review`} title={selected ? config.title(selected) : config.entityLabel}>
          {selected && (
            <>
              <DetailGrid items={config.details(selected)} />
              {config.skills && <SkillList skills={config.skills(selected)} />}
              {config.tags && <TagList label={type === 'posts' ? 'Tags' : 'Topics'} items={config.tags(selected)} />}
              <DetailSection label={type === 'posts' ? 'Content' : 'Description'}>{config.description(selected)}</DetailSection>
            </>
          )}
        </Modal>

        <AdminConfirmDialog
          isOpen={Boolean(pendingDelete)}
          title={`Delete ${config.entityLabel}?`}
          entityName={pendingDelete ? config.title(pendingDelete) : config.entityLabel}
          description={config.deleteDescription ?? 'This record will be removed.'}
          confirmLabel={`Delete ${config.entityLabel}`}
          isSubmitting={deleting}
          error={confirmationError}
          onCancel={() => {
            setPendingDelete(null)
            setConfirmationError('')
          }}
          onConfirm={confirmDelete}
        />
      </div>
    </DashboardLayout>
  )
}
