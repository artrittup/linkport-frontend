import { Link } from 'react-router'
import {
  getTeammateRequestCommitmentLabel,
  getTeammateRequestWorkStyleLabel,
} from '../data/teammateRequestMapper'

function TagList({ label, items }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="max-w-full break-words rounded-md border border-[#233554] px-2.5 py-1 text-xs text-[#a8b2d1]">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function TeammateRequestCard({ request }) {
  return (
    <article className="flex min-w-0 max-w-full flex-col rounded-2xl border border-[#233554] bg-[#112240]/65 p-5">
      <span className="font-mono text-[10px] font-semibold tracking-wide text-[#64ffda]">LOOKING FOR TEAM</span>
      <h4 className="mt-3 break-words text-lg font-semibold text-[#e6f1ff]">{request.title}</h4>
      <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-[#8892b0]">{request.description}</p>
      <p className="mt-3 break-words text-xs font-medium text-[#a8b2d1]">
        {request.ownerName || 'Owner information unavailable'}
      </p>

      <div className="mt-5 space-y-4">
        <TagList label="Roles needed" items={request.rolesNeeded} />
        <TagList label="Skills" items={request.skills} />
      </div>

      <p className="mt-4 break-words text-xs text-[#64748b]">
        {getTeammateRequestCommitmentLabel(request.commitment)} · {getTeammateRequestWorkStyleLabel(request.workStyle)}
      </p>
      <div className="mt-auto pt-5">
        <Link
          to={`/member/community/team-requests/${request.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg border border-[#64ffda] px-4 py-2 text-sm font-semibold text-[#64ffda] transition-colors hover:bg-[#64ffda]/10"
        >
          View request
        </Link>
      </div>
    </article>
  )
}
