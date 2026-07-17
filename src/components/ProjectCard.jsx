import Button from './Button'
import Card from './Card'

const statusClasses = {
  open: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]',
  pending: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
  closed: 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]',
}

export default function ProjectCard({
  project,
  onViewDetails,
  onSendOffer,
  compact = false,
}) {
  const statusClass =
    statusClasses[project.status?.toLowerCase()] ??
    'border-[#233554] bg-[#0a192f]/70 text-[#8892b0]'

  return (
    <Card
      hover
      padding={compact ? 'sm' : 'md'}
      className="flex h-full flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {project.category && (
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748b]">
              {project.category}
            </p>
          )}
          <h3 className={`${project.category ? 'mt-2' : ''} font-semibold leading-snug text-[#e6f1ff]`}>
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-[#64ffda]">{project.company}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass}`}
        >
          {project.status}
        </span>
      </div>

      {!compact && (
        <p className="mt-4 text-sm leading-relaxed text-[#8892b0]">
          {project.description}
        </p>
      )}

      <div
        className={`grid grid-cols-3 gap-3 border-y border-[#233554] text-xs ${
          compact ? 'mt-4 py-3' : 'mt-5 py-4'
        }`}
      >
        <div>
          <p className="text-[#64748b]">Budget</p>
          <p className="mt-1 font-medium text-[#e6f1ff]">{project.budget}</p>
        </div>
        <div>
          <p className="text-[#64748b]">Deadline</p>
          <p className="mt-1 text-[#facc15]">{project.deadline}</p>
        </div>
        <div>
          <p className="text-[#64748b]">Bids</p>
          <p className="mt-1 text-[#8892b0]">{project.bids} offers</p>
        </div>
      </div>

      <div className={`${compact ? 'mt-3' : 'mt-4'} flex flex-wrap gap-2`}>
        {project.skills?.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-[#233554] bg-[#0a192f]/70 px-2.5 py-1 font-mono text-[10px] text-[#64ffda]"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className={`mt-auto grid grid-cols-2 gap-3 ${compact ? 'pt-4' : 'pt-6'}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails?.(project)}
        >
          View Details
        </Button>
        <Button size="sm" onClick={() => onSendOffer?.(project)}>
          Send Offer
        </Button>
      </div>
    </Card>
  )
}
