import Button from './Button'
import Card from './Card'

const statusClasses = {
  open: 'border-success/30 bg-success/10 text-success',
  pending: 'border-warning/30 bg-warning/10 text-warning',
  closed: 'border-danger/30 bg-danger/10 text-danger',
}

export default function JobCard({
  job,
  onViewDetails,
  onApply,
  compact = false,
}) {
  const statusClass =
    statusClasses[job.status?.toLowerCase()] ??
    'border-border bg-background/70 text-text-muted'
  const deadline = job.deadline
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
        new Date(job.deadline),
      )
    : 'No deadline'

  return (
    <Card
      hover
      padding={compact ? 'sm' : 'md'}
      className="flex h-full flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug text-text-primary">
            {job.title}
          </h3>
          <p className="mt-1 text-sm text-primary">{job.company}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${statusClass}`}
        >
          {job.status}
        </span>
      </div>

      <div
        className={`grid ${job.type ? 'grid-cols-2' : 'grid-cols-1'} gap-3 border-y border-border text-xs ${
          compact ? 'mt-4 py-3' : 'mt-5 py-4'
        }`}
      >
        <div>
          <p className="text-text-subtle">Location</p>
          <p className="mt-1 text-text-muted">{job.location}</p>
        </div>
        {job.type && (
          <div>
            <p className="text-text-subtle">Type</p>
            <p className="mt-1 text-text-muted">{job.type}</p>
          </div>
        )}
      </div>

      {!compact && (
        <p className="mt-4 text-sm leading-relaxed text-text-muted">
          {job.description}
        </p>
      )}

      {job.skills?.length > 0 && (
        <div className={`${compact ? 'mt-3' : 'mt-4'} flex flex-wrap gap-2`}>
          {job.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-border bg-background/70 px-2.5 py-1 font-mono text-[10px] text-primary"
          >
            {skill}
          </span>
          ))}
        </div>
      )}

      <div className={`mt-auto ${compact ? 'pt-4' : 'pt-6'}`}>
        <p className="mb-3 text-xs text-text-subtle">
          Deadline: <span className="text-warning">{deadline}</span>
        </p>
        {(onViewDetails || onApply) && (
          <div className={`grid gap-3 ${onViewDetails && onApply ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {onViewDetails && (
              <Button variant="outline" size="sm" onClick={() => onViewDetails(job)}>
                View Details
              </Button>
            )}
            {onApply && (
              <Button size="sm" onClick={() => onApply(job)}>
                Apply
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
