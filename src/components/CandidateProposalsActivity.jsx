import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ACTIVITY_STATUSES } from '../config/candidateActivity'
import ActivityStatusBadge from './ActivityStatusBadge'
import Button from './Button'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'

const inputClasses = 'w-full min-w-0 max-w-full rounded-xl border border-[#233554] bg-[#112240]/70 px-4 py-3 text-sm text-[#e6f1ff] outline-none placeholder:text-[#64748b] focus:border-[#64ffda] focus:ring-1 focus:ring-[#64ffda]'

export default function CandidateProposalsActivity({ activity }) {
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
      <div className="grid min-w-0 gap-3 rounded-2xl border border-[#233554] bg-[#112240]/55 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
        <div className="min-w-0">
          <label htmlFor="activity-proposal-search" className="sr-only">Search proposals</label>
          <input
            id="activity-proposal-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search project title, company, or category..."
            className={inputClasses}
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="activity-proposal-status" className="sr-only">Proposal status</label>
          <select id="activity-proposal-status" value={activity.status} onChange={(event) => activity.setStatus(event.target.value)} className={inputClasses}>
            {ACTIVITY_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>
      </div>

      <p className="my-4 text-sm text-[#64748b]">
        {activity.isLoading ? 'Loading proposals...' : `${visibleProposals.length} proposals on this page`}
      </p>

      {activity.isLoading ? (
        <LoadingSpinner label="Loading your proposals..." size="lg" />
      ) : activity.error ? (
        <EmptyState title="Unable to load proposals" description={activity.error} actionLabel="Try again" onAction={activity.retry} />
      ) : visibleProposals.length > 0 ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          {visibleProposals.map((proposal) => {
            const opportunityPath = proposal.project?.id
              ? `/member/opportunities/project-${proposal.project.id}`
              : ''

            return (
              <article key={proposal.id} className="flex min-w-0 flex-col rounded-2xl border border-[#233554] bg-[#112240]/60 p-5">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-semibold text-[#e6f1ff]">{proposal.projectTitle}</h3>
                    <p className="mt-1 break-words text-sm text-[#64ffda]">{proposal.company}</p>
                  </div>
                  <ActivityStatusBadge status={proposal.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-[#233554] py-4 text-sm sm:grid-cols-3">
                  <div className="min-w-0">
                    <dt className="text-xs uppercase tracking-wide text-[#64748b]">Offer</dt>
                    <dd className="mt-1 break-words font-medium text-[#e6f1ff]">{proposal.offeredPrice}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs uppercase tracking-wide text-[#64748b]">Duration</dt>
                    <dd className="mt-1 break-words text-[#a8b2d1]">{proposal.deliveryDays ? `${proposal.deliveryDays} days` : 'Not specified'}</dd>
                  </div>
                  <div className="col-span-2 min-w-0 sm:col-span-1">
                    <dt className="text-xs uppercase tracking-wide text-[#64748b]">Submitted</dt>
                    <dd className="mt-1 break-words text-[#a8b2d1]">{proposal.dateSubmitted}</dd>
                  </div>
                </dl>
                <p className="mt-4 line-clamp-3 break-words text-sm leading-6 text-[#8892b0]">{proposal.proposalPreview}</p>
                <div className="mt-auto pt-5">
                  {opportunityPath ? (
                    <Link to={opportunityPath} className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#64ffda] hover:bg-[#64ffda]/10">
                      View opportunity
                    </Link>
                  ) : (
                    <p className="text-sm text-[#64748b]">The related project is no longer available.</p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title={query ? 'No proposals match your search' : 'No proposals found'}
          description={query ? 'Try another project title, company, or category.' : 'You have not submitted any proposals with this status.'}
          actionLabel={query ? 'Clear search' : undefined}
          onAction={query ? () => setSearch('') : undefined}
        />
      )}

      {lastPage > 1 && !activity.isLoading && !activity.error && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Button variant="outline" size="sm" disabled={activity.page <= 1} onClick={() => activity.setPage((current) => current - 1)}>Previous</Button>
          <span className="text-sm text-[#8892b0]">Page {activity.pagination.current_page} of {lastPage}</span>
          <Button variant="outline" size="sm" disabled={activity.page >= lastPage} onClick={() => activity.setPage((current) => current + 1)}>Next</Button>
        </div>
      )}
    </section>
  )
}
