import Button from './Button'
import Card from './Card'

const statusClasses = {
  open: 'border-success/30 bg-success/10 text-success',
  pending: 'border-warning/30 bg-warning/10 text-warning',
  closed: 'border-danger/30 bg-danger/10 text-danger',
}

export default function ProjectCard({
  project,
  onViewDetails,
  onSendOffer,
  compact = false,
}) {
  const statusClass =
    statusClasses[project.status?.toLowerCase()] ??
    'border-border bg-background/70 text-text-muted'
  const budget = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(project.budget ?? 0))
  const deadline = project.deadline
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
        new Date(project.deadline),
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
          {project.category && (
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-subtle">
              {project.category}
            </p>
          )}
          <h3 className={`${project.category ? 'mt-2' : ''} font-semibold leading-snug text-text-primary`}>
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-primary">{project.company}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${statusClass}`}
        >
          {project.status}
        </span>
      </div>

      {!compact && (
        <p className="mt-4 text-sm leading-relaxed text-text-muted">
          {project.description}
        </p>
      )}

      <div
        className={`grid ${project.bids == null ? 'grid-cols-2' : 'grid-cols-3'} gap-3 border-y border-border text-xs ${
          compact ? 'mt-4 py-3' : 'mt-5 py-4'
        }`}
      >
        <div>
          <p className="text-text-subtle">Budget</p>
          <p className="mt-1 font-medium text-text-primary">{budget}</p>
        </div>
        <div>
          <p className="text-text-subtle">Deadline</p>
          <p className="mt-1 text-warning">{deadline}</p>
        </div>
        {project.bids != null && (
          <div>
            <p className="text-text-subtle">Bids</p>
            <p className="mt-1 text-text-muted">{project.bids} offers</p>
          </div>
        )}
      </div>

      <div className={`${compact ? 'mt-3' : 'mt-4'} flex flex-wrap gap-2`}>
        {project.skills?.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-border bg-background/70 px-2.5 py-1 font-mono text-[10px] text-primary"
          >
            {skill}
          </span>
        ))}
      </div>

      {(onViewDetails || onSendOffer) && (
        <div className={`mt-auto grid gap-3 ${onViewDetails && onSendOffer ? 'grid-cols-2' : 'grid-cols-1'} ${compact ? 'pt-4' : 'pt-6'}`}>
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={() => onViewDetails(project)}>
              View Details
            </Button>
          )}
          {onSendOffer && (
            <Button size="sm" onClick={() => onSendOffer(project)}>
              Send Offer
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
