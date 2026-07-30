import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ACTIVITY_STATUSES } from '../config/candidateActivity'
import ActivityStatusBadge from './ActivityStatusBadge'
import Button from './Button'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'

const inputClasses = 'w-full min-w-0 max-w-full rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-focus-ring'

export default function CandidateApplicationsActivity({ activity }) {
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const visibleApplications = useMemo(
    () => activity.items.filter((application) => !query || [
      application.jobTitle,
      application.company,
      application.location,
    ].some((value) => String(value ?? '').toLowerCase().includes(query))),
    [activity.items, query],
  )
  const lastPage = Math.max(1, Math.ceil(activity.pagination.total / activity.pagination.per_page))

  return (
    <section className="min-w-0" aria-live="polite">
      <div className="grid min-w-0 gap-3 rounded-2xl border border-border bg-surface/55 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
        <div className="min-w-0">
          <label htmlFor="activity-application-search" className="sr-only">Search applications</label>
          <input
            id="activity-application-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search job title, company, or location..."
            className={inputClasses}
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="activity-application-status" className="sr-only">Application status</label>
          <select id="activity-application-status" value={activity.status} onChange={(event) => activity.setStatus(event.target.value)} className={inputClasses}>
            {ACTIVITY_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>
      </div>

      <p className="my-4 text-sm text-text-subtle">
        {activity.isLoading ? 'Loading applications...' : `${visibleApplications.length} applications on this page`}
      </p>

      {activity.isLoading ? (
        <LoadingSpinner label="Loading your applications..." size="lg" />
      ) : activity.error ? (
        <EmptyState title="Unable to load applications" description={activity.error} actionLabel="Try again" onAction={activity.retry} />
      ) : visibleApplications.length > 0 ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          {visibleApplications.map((application) => {
            const opportunityPath = application.job?.id
              ? `/member/opportunities/job-${application.job.id}`
              : ''

            return (
              <article key={application.id} className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface/60 p-5">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-semibold text-text-primary">{application.jobTitle}</h3>
                    <p className="mt-1 break-words text-sm text-primary">{application.company}</p>
                  </div>
                  <ActivityStatusBadge status={application.status} />
                </div>
                <dl className="mt-4 grid gap-3 border-y border-border py-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-text-subtle">Applied</dt>
                    <dd className="mt-1 break-words text-text-secondary">{application.dateApplied}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-text-subtle">Location</dt>
                    <dd className="mt-1 break-words text-text-secondary">{application.location}</dd>
                  </div>
                </dl>
                <p className="mt-4 line-clamp-3 break-words text-sm leading-6 text-text-muted">{application.messagePreview}</p>
                <div className="mt-auto pt-5">
                  {opportunityPath ? (
                    <Link to={opportunityPath} className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">
                      View opportunity
                    </Link>
                  ) : (
                    <p className="text-sm text-text-subtle">The related opportunity is no longer available.</p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title={query ? 'No applications match your search' : 'No applications found'}
          description={query ? 'Try another job title, company, or location.' : 'You have not submitted any applications with this status.'}
          actionLabel={query ? 'Clear search' : undefined}
          onAction={query ? () => setSearch('') : undefined}
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
