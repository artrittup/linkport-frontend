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

export default function OpportunityCard({
  opportunity,
  isSaved = false,
  onSavedChange,
  onPrimaryAction,
}) {
  const isJob = opportunity.source === 'job'
  const deadline = formatDate(opportunity.deadline)
  const budget = formatBudget(opportunity.budget)
  const actionLabel = isJob ? 'Apply' : 'Submit bid'
  const detailsPath = `/member/opportunities/${opportunity.id}`

  return (
    <article className="group relative isolate flex h-full min-w-0 flex-col rounded-2xl border border-border bg-surface/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-sm sm:p-5">
      <Link
        to={detailsPath}
        aria-label={`View ${opportunity.title}`}
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />

      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            {isJob ? (opportunity.type === 'INTERNSHIP' ? 'Internship' : 'Job') : 'Project'}
          </p>
          <h3 className="mt-1.5 break-words text-lg font-bold leading-snug text-text-primary transition-colors group-hover:text-primary">
            {opportunity.title}
          </h3>
          {opportunity.companyId ? (
            <Link
              to={`/companies/${opportunity.companyId}`}
              className="relative z-20 mt-1 inline-flex max-w-full truncate text-sm font-semibold text-primary hover:text-primary-hover"
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
          className="relative z-20 shrink-0"
        />
      </div>

      <p className="mt-3 line-clamp-2 break-words text-sm leading-5 text-text-muted">{opportunity.description}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
        {isJob ? (
          <>
            <div className="min-w-0">
              <dt className="text-text-subtle">Location</dt>
              <dd className="mt-0.5 truncate font-medium text-text-secondary">{opportunity.location}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-text-subtle">Employment</dt>
              <dd className="mt-0.5 truncate font-medium text-text-secondary">{opportunity.employmentType || 'Not specified'}</dd>
            </div>
          </>
        ) : (
          <>
            <div className="min-w-0">
              <dt className="text-text-subtle">Budget</dt>
              <dd className="mt-0.5 truncate font-medium text-text-primary">{budget || 'Not specified'}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-text-subtle">Deadline</dt>
              <dd className="mt-0.5 truncate font-medium text-text-secondary">{deadline || 'Open'}</dd>
            </div>
          </>
        )}
      </dl>

      <div className="mt-3 flex min-h-6 flex-wrap gap-1.5">
        {opportunity.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="max-w-full truncate rounded-full bg-background/70 px-2.5 py-1 text-[11px] text-text-secondary">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-auto flex justify-end pt-4">
        <button
          type="button"
          onClick={() => onPrimaryAction?.(opportunity)}
          className="relative z-20 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  )
}
