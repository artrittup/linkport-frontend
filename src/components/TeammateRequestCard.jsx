import { Link } from 'react-router'
import {
  getTeammateRequestCommitmentLabel,
  getTeammateRequestWorkStyleLabel,
} from '../data/teammateRequestMapper'

function TagList({ label, items }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-subtle">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="max-w-full break-words rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function TeammateRequestCard({ request }) {
  return (
    <article className="flex min-w-0 max-w-full flex-col rounded-2xl border border-border bg-surface/65 p-5">
      <span className="font-mono text-[10px] font-semibold tracking-wide text-primary">LOOKING FOR TEAM</span>
      <h4 className="mt-3 break-words text-lg font-semibold text-text-primary">{request.title}</h4>
      <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-text-muted">{request.description}</p>
      <p className="mt-3 break-words text-xs font-medium text-text-secondary">
        {request.ownerName || 'Owner information unavailable'}
      </p>

      <div className="mt-5 space-y-4">
        <TagList label="Roles needed" items={request.rolesNeeded} />
        <TagList label="Skills" items={request.skills} />
      </div>

      <p className="mt-4 break-words text-xs text-text-subtle">
        {getTeammateRequestCommitmentLabel(request.commitment)} · {getTeammateRequestWorkStyleLabel(request.workStyle)}
      </p>
      <div className="mt-auto pt-5">
        <Link
          to={`/member/community/team-requests/${request.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          View request
        </Link>
      </div>
    </article>
  )
}
