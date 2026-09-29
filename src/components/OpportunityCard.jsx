import { Link } from 'react-router'
import SaveButton from './SaveButton'

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function formatBudget(value) {
  if (value === null || value === undefined || value === '') return null
  const amount = Number(value)
  return Number.isFinite(amount)
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
    : value
}

function readable(value) {
  return String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export default function OpportunityCard({
  opportunity,
  isSaved = false,
  onSavedChange,
  onPrimaryAction,
}) {
  const isJob = opportunity.source === 'job'
  const deadline = formatDate(opportunity.deadline)
  const postedAt = formatDate(opportunity.postedAt)
  const budget = formatBudget(opportunity.budget)
  const status = readable(opportunity.status)
  const detailLabel = isJob ? 'View job' : 'View project'
  const actionLabel = isJob ? 'Apply' : 'Submit bid'

  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-surface/70 p-5 transition-colors hover:border-primary/40 sm:p-6">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            {isJob ? (opportunity.type === 'INTERNSHIP' ? 'Internship' : 'Job') : 'Project opportunity'}
          </p>
          <h3 className="mt-2 break-words text-xl font-bold leading-snug text-text-primary">{opportunity.title}</h3>
          {opportunity.companyId ? (
            <Link
              to={`/companies/${opportunity.companyId}`}
              className="mt-1 inline-flex max-w-full truncate text-sm font-semibold text-primary hover:text-primary-hover"
            >
              {opportunity.company}
            </Link>
          ) : (
            <p className="mt-1 truncate text-sm font-semibold text-primary">{opportunity.company}</p>
          )}
        </div>
        <SaveButton
          type={opportunity.source}
          itemId={opportunity.sourceId}
          initialSaved={isSaved}
          onChange={onSavedChange}
          className="shrink-0"
        />
      </div>

      <p className="mt-4 line-clamp-3 break-words text-sm leading-6 text-text-muted">{opportunity.description}</p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-4 text-xs">
        {isJob ? (
          <>
            <div>
              <dt className="text-text-subtle">Location</dt>
              <dd className="mt-1 font-medium text-text-secondary">{opportunity.location}</dd>
            </div>
            <div>
              <dt className="text-text-subtle">Employment</dt>
              <dd className="mt-1 font-medium text-text-secondary">{opportunity.employmentType || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-text-subtle">Work style</dt>
              <dd className="mt-1 font-medium text-text-secondary">{opportunity.workStyle}</dd>
            </div>
            <div>
              <dt className="text-text-subtle">{postedAt ? 'Posted' : 'Deadline'}</dt>
              <dd className="mt-1 font-medium text-text-secondary">{postedAt || deadline || 'Open'}</dd>
            </div>
          </>
        ) : (
          <>
            <div>
              <dt className="text-text-subtle">Budget</dt>
              <dd className="mt-1 font-medium text-text-primary">{budget || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-text-subtle">Deadline</dt>
              <dd className="mt-1 font-medium text-text-secondary">{deadline || 'Open'}</dd>
            </div>
            <div>
              <dt className="text-text-subtle">Category</dt>
              <dd className="mt-1 font-medium text-text-secondary">{opportunity.category || 'General'}</dd>
            </div>
            <div>
              <dt className="text-text-subtle">Status</dt>
              <dd className="mt-1 font-medium text-text-secondary">{status || 'Open'}</dd>
            </div>
          </>
        )}
      </dl>

      {opportunity.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {opportunity.skills.slice(0, 5).map((skill) => (
            <span key={skill} className="max-w-full break-words rounded-full border border-border bg-background/55 px-2.5 py-1 text-xs text-text-secondary">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        <Link
          to={`/member/opportunities/${opportunity.id}`}
          className="inline-flex items-center justify-center rounded-lg border border-primary px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {detailLabel}
        </Link>
        <button
          type="button"
          onClick={() => onPrimaryAction?.(opportunity)}
          className="rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  )
}
