import Button from './Button'
import Card from './Card'

const statusClasses = {
  open: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]',
  pending: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
  closed: 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]',
}

export default function JobCard({
  job,
  onViewDetails,
  onApply,
  compact = false,
}) {
  const statusClass =
    statusClasses[job.status?.toLowerCase()] ??
    'border-[#233554] bg-[#0a192f]/70 text-[#8892b0]'
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
          <h3 className="font-semibold leading-snug text-[#e6f1ff]">
            {job.title}
          </h3>
          <p className="mt-1 text-sm text-[#64ffda]">{job.company}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${statusClass}`}
        >
          {job.status}
        </span>
      </div>

      <div
        className={`grid ${job.type ? 'grid-cols-2' : 'grid-cols-1'} gap-3 border-y border-[#233554] text-xs ${
          compact ? 'mt-4 py-3' : 'mt-5 py-4'
        }`}
      >
        <div>
          <p className="text-[#64748b]">Location</p>
          <p className="mt-1 text-[#8892b0]">{job.location}</p>
        </div>
        {job.type && (
          <div>
            <p className="text-[#64748b]">Type</p>
            <p className="mt-1 text-[#8892b0]">{job.type}</p>
          </div>
        )}
      </div>

      {!compact && (
        <p className="mt-4 text-sm leading-relaxed text-[#8892b0]">
          {job.description}
        </p>
      )}

      {job.skills?.length > 0 && (
        <div className={`${compact ? 'mt-3' : 'mt-4'} flex flex-wrap gap-2`}>
          {job.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-[#233554] bg-[#0a192f]/70 px-2.5 py-1 font-mono text-[10px] text-[#64ffda]"
          >
            {skill}
          </span>
          ))}
        </div>
      )}

      <div className={`mt-auto ${compact ? 'pt-4' : 'pt-6'}`}>
        <p className="mb-3 text-xs text-[#64748b]">
          Deadline: <span className="text-[#facc15]">{deadline}</span>
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
