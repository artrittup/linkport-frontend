import { Link } from 'react-router'
import Card from './Card'

const statusClasses = {
  active: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#4ade80]',
  draft: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
  closed: 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#f87171]',
  expired: 'border-[#f97316]/30 bg-[#f97316]/10 text-[#fb923c]',
  unknown: 'border-[#233554] bg-[#0a192f]/50 text-[#8892b0]',
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
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64ffda]">
            {opportunity.typeLabel}
          </p>
          <h3 className="mt-1 break-words text-lg font-semibold">{opportunity.title}</h3>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses[opportunity.statusGroup]}`}>
          {opportunity.statusLabel}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-[#8892b0]">
        {opportunity.description || 'No description provided.'}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-[#233554] py-4 text-xs">
        <div>
          <dt className="text-[#64748b]">Created</dt>
          <dd className="mt-1 text-[#a8b2d1]">{formatDate(opportunity.createdAt) || 'Not available'}</dd>
        </div>
        <div>
          <dt className="text-[#64748b]">Deadline</dt>
          <dd className="mt-1 text-[#a8b2d1]">{formatDate(opportunity.deadline) || 'No deadline'}</dd>
        </div>
        {(opportunity.location || opportunity.workStyle) && (
          <div className="col-span-2">
            <dt className="text-[#64748b]">Location / type</dt>
            <dd className="mt-1 break-words text-[#a8b2d1]">
              {[opportunity.location, opportunity.workStyle].filter(Boolean).join(' · ')}
            </dd>
          </div>
        )}
        <div className="col-span-2">
          <dt className="text-[#64748b]">Responses</dt>
          <dd className="mt-1 text-[#a8b2d1]">
            {opportunity.responseCount === null
              ? 'Responses unavailable'
              : `${opportunity.responseCount} ${opportunity.responseLabel}`}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Link to={opportunity.applicationsRoute} className="text-sm text-[#8892b0] hover:text-[#64ffda]">
          View responses
        </Link>
        <Link to={opportunity.managementRoute} className="rounded-lg bg-[#64ffda] px-4 py-2 text-sm font-semibold text-[#071426] hover:bg-[#7dffe1]">
          Manage
        </Link>
      </div>
    </Card>
  )
}
