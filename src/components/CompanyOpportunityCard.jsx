import { Link } from 'react-router'
import Card from './Card'

const statusClasses = {
  active: 'border-success/30 bg-success/10 text-success-bright',
  draft: 'border-warning/30 bg-warning/10 text-warning',
  closed: 'border-danger/30 bg-danger/10 text-danger-soft',
  expired: 'border-warning-alt/30 bg-warning-alt/10 text-warning-alt-text',
  unknown: 'border-border bg-background/50 text-text-muted',
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
}

export default function CompanyOpportunityCard({ opportunity }) {
  return (
    <Card hover className="flex min-w-0 flex-col">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {opportunity.typeLabel}
          </p>
          <h3 className="mt-1 break-words text-lg font-semibold">{opportunity.title}</h3>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses[opportunity.statusGroup]}`}>
          {opportunity.statusLabel}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-text-muted">
        {opportunity.description || 'No description provided.'}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-4 text-xs">
        <div>
          <dt className="text-text-subtle">Created</dt>
          <dd className="mt-1 text-text-secondary">{formatDate(opportunity.createdAt) || 'Not available'}</dd>
        </div>
        <div>
          <dt className="text-text-subtle">Deadline</dt>
          <dd className="mt-1 text-text-secondary">{formatDate(opportunity.deadline) || 'No deadline'}</dd>
        </div>
        {(opportunity.location || opportunity.workStyle) && (
          <div className="col-span-2">
            <dt className="text-text-subtle">Location / type</dt>
            <dd className="mt-1 break-words text-text-secondary">
              {[opportunity.location, opportunity.workStyle].filter(Boolean).join(' · ')}
            </dd>
          </div>
        )}
        <div className="col-span-2">
          <dt className="text-text-subtle">Responses</dt>
          <dd className="mt-1 text-text-secondary">
            {opportunity.responseCount === null
              ? 'Responses unavailable'
              : `${opportunity.responseCount} ${opportunity.responseLabel}`}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Link to={opportunity.applicationsRoute} className="text-sm text-text-muted hover:text-primary">
          View responses
        </Link>
        <Link to={opportunity.managementRoute} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast hover:bg-primary-hover">
          Manage
        </Link>
      </div>
    </Card>
  )
}
