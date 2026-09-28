import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ACTIVITY_STATUSES } from '../config/candidateActivity'
import ActivityStatusBadge from './ActivityStatusBadge'
import Button from './Button'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'

const inputClasses = 'w-full min-w-0 max-w-full rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring'

export default function CandidateProposalsActivity({ activity }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const visibleProposals = useMemo(
    () => activity.items.filter((proposal) => !query || [
      proposal.projectTitle,
      proposal.company,
      proposal.category,
    ].some((value) => String(value ?? '').toLowerCase().includes(query))),
    [activity.items, query],
  )
  const lastPage = Math.max(1, Math.ceil(activity.pagination.total / activity.pagination.per_page))

  return (
    <section className="min-w-0" aria-live="polite">
      <div className="grid min-w-0 gap-3 rounded-2xl border border-border bg-surface/55 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
        <div className="min-w-0">
          <label htmlFor="activity-bid-search" className="sr-only">Search bids</label>
          <input
            id="activity-bid-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search project title, company, or category..."
            className={inputClasses}
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="activity-bid-status" className="sr-only">Bid status</label>
          <select id="activity-bid-status" value={activity.status} onChange={(event) => activity.setStatus(event.target.value)} className={inputClasses}>
            {ACTIVITY_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>
      </div>

      <p className="my-4 text-sm text-text-subtle">
        {activity.isLoading ? 'Loading bids...' : `${visibleProposals.length} bids on this page`}
      </p>

      {activity.isLoading ? (
        <LoadingSpinner label="Loading your bids..." size="lg" />
      ) : activity.error ? (
        <EmptyState title="Unable to load bids" description={activity.error} actionLabel="Try again" onAction={activity.retry} />
      ) : visibleProposals.length > 0 ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          {visibleProposals.map((proposal) => {
            const opportunityPath = proposal.project?.id
              ? `/member/opportunities/project-${proposal.project.id}`
              : ''

            return (
              <article key={proposal.id} className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface/60 p-5">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-semibold text-text-primary">{proposal.projectTitle}</h3>
                    <p className="mt-1 break-words text-sm text-primary">{proposal.company}</p>
                  </div>
                  <ActivityStatusBadge status={proposal.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-4 text-sm sm:grid-cols-3">
                  <div className="min-w-0">
                    <dt className="text-xs uppercase tracking-wide text-text-subtle">Offer</dt>
                    <dd className="mt-1 break-words font-medium text-text-primary">{proposal.offeredPrice}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs uppercase tracking-wide text-text-subtle">Duration</dt>
                    <dd className="mt-1 break-words text-text-secondary">{proposal.deliveryDays ? `${proposal.deliveryDays} days` : 'Not specified'}</dd>
                  </div>
                  <div className="col-span-2 min-w-0 sm:col-span-1">
                    <dt className="text-xs uppercase tracking-wide text-text-subtle">Submitted</dt>
                    <dd className="mt-1 break-words text-text-secondary">{proposal.dateSubmitted}</dd>
                  </div>
                </dl>
                <p className="mt-4 line-clamp-3 break-words text-sm leading-6 text-text-muted">{proposal.proposalPreview}</p>
                <div className="mt-auto pt-5">
                  {opportunityPath ? (
                    <Link to={opportunityPath} className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">
                      View opportunity
                    </Link>
                  ) : (
                    <p className="text-sm text-text-subtle">The related project is no longer available.</p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title={query
            ? 'No bids match your search'
            : activity.status === 'All statuses'
              ? "You haven't submitted any bids yet."
              : `No ${activity.status.toLowerCase()} bids`}
          description={query
            ? 'Try another project title, company, or category.'
            : activity.status === 'All statuses'
              ? 'Project bids you submit will appear here with their current status.'
              : 'Try another status or browse available projects.'}
          actionLabel={query ? 'Clear search' : activity.status === 'All statuses' ? 'Browse projects' : 'Show all statuses'}
          onAction={query
            ? () => setSearch('')
            : activity.status === 'All statuses'
              ? () => navigate('/member/opportunities/projects')
              : () => activity.setStatus('All statuses')}
        />
      )}

      {lastPage > 1 && !activity.isLoading && !activity.error && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Button variant="outline" size="sm" disabled={activity.page <= 1} onClick={() => activity.setPage((current) => current - 1)}>Previous</Button>
          <span className="text-sm text-text-muted">Page {activity.pagination.current_page} of {lastPage}</span>
          <Button variant="outline" size="sm" disabled={activity.page >= lastPage} onClick={() => activity.setPage((current) => current + 1)}>Next</Button>
        </div>
      )}
    </section>
  )
}
