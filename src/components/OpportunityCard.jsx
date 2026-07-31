import { Link } from 'react-router'

const typeClasses = {
  JOB: 'border-info/30 bg-info/10 text-info-text',
  INTERNSHIP: 'border-violet/30 bg-violet/10 text-violet-text',
  'COMPANY PROJECT': 'border-primary/30 bg-primary/10 text-primary',
  CHALLENGE: 'border-warning/30 bg-warning/10 text-warning-text',
}

function formatDeadline(deadline) {
  if (!deadline) return null

  const date = new Date(deadline)
  return Number.isNaN(date.getTime())
    ? deadline
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

export default function OpportunityCard({ opportunity }) {
  const deadline = formatDeadline(opportunity.deadline)

  return (
    <article className="flex h-full min-w-0 max-w-full flex-col rounded-2xl border border-border bg-surface/65 p-5 transition-colors hover:border-primary/35 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide ${typeClasses[opportunity.type]}`}>
          {opportunity.type}
        </span>
        {deadline && <span className="text-xs text-text-subtle">Deadline {deadline}</span>}
      </div>

      <h2 className="mt-5 break-words text-xl font-semibold leading-snug text-text-primary">{opportunity.title}</h2>
      <p className="mt-1 text-sm font-medium text-primary">{opportunity.company}</p>
      <p className="mt-3 break-words text-sm leading-6 text-text-muted">{opportunity.description}</p>

      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-text-muted">
        <span>{opportunity.location}</span>
        <span aria-hidden="true">·</span>
        <span>{opportunity.workStyle}</span>
      </div>

      {opportunity.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {opportunity.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="max-w-full break-words rounded-md border border-border bg-background/45 px-2.5 py-1 text-xs text-text-secondary">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-6">
        <Link
          to={`/member/opportunities/${opportunity.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {opportunity.actionLabel}
        </Link>
      </div>
    </article>
  )
}
