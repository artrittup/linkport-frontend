import { Link } from 'react-router'

const typeClasses = {
  JOB: 'border-[#60a5fa]/30 bg-[#60a5fa]/10 text-[#93c5fd]',
  INTERNSHIP: 'border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[#c4b5fd]',
  'COMPANY PROJECT': 'border-[#64ffda]/30 bg-[#64ffda]/10 text-[#64ffda]',
  CHALLENGE: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#fde047]',
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
    <article className="flex h-full min-w-0 max-w-full flex-col rounded-2xl border border-[#233554] bg-[#112240]/65 p-5 transition-colors hover:border-[#64ffda]/35 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide ${typeClasses[opportunity.type]}`}>
          {opportunity.type}
        </span>
        {deadline && <span className="text-xs text-[#64748b]">Deadline {deadline}</span>}
      </div>

      <h2 className="mt-5 break-words text-xl font-semibold leading-snug text-[#e6f1ff]">{opportunity.title}</h2>
      <p className="mt-1 text-sm font-medium text-[#64ffda]">{opportunity.company}</p>
      <p className="mt-3 break-words text-sm leading-6 text-[#8892b0]">{opportunity.description}</p>

      <div className="mt-5 flex items-center gap-2 border-t border-[#233554] pt-4 text-xs text-[#8892b0]">
        <span>{opportunity.location}</span>
        <span aria-hidden="true">·</span>
        <span>{opportunity.workStyle}</span>
      </div>

      {opportunity.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {opportunity.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="max-w-full break-words rounded-md border border-[#233554] bg-[#0a192f]/45 px-2.5 py-1 text-xs text-[#a8b2d1]">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-6">
        <Link
          to={`/member/opportunities/${opportunity.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] bg-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#071426] transition-colors hover:bg-[#7dffe1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#64ffda]"
        >
          {opportunity.actionLabel}
        </Link>
      </div>
    </article>
  )
}
