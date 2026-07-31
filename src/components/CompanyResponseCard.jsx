import { Link } from 'react-router'
import Card from './Card'

const statusClasses = {
  pending: 'border-warning/30 bg-warning/10 text-warning',
  under_review: 'border-info/30 bg-info/10 text-info',
  shortlisted: 'border-violet-bright/30 bg-violet-bright/10 text-violet-bright',
  accepted: 'border-success/30 bg-success/10 text-success-bright',
  rejected: 'border-danger/30 bg-danger/10 text-danger-soft',
  withdrawn: 'border-border bg-background/50 text-text-muted',
}

function Skills({ items }) {
  if (!items.length) return null
  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {items.slice(0, 4).map((skill) => (
        <span key={skill} className="rounded-full border border-border bg-background/70 px-2 py-1 font-mono text-[10px] text-primary">
          {skill}
        </span>
      ))}
    </div>
  )
}

export default function CompanyResponseCard({ response, onReview }) {
  return (
    <Card hover className="flex min-w-0 flex-col">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{response.typeLabel}</p>
          <h3 className="mt-1 break-words text-lg font-semibold">{response.candidateName}</h3>
          <p className="mt-1 break-words text-sm text-text-muted">{response.candidateHeadline || 'Headline not provided'}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses[response.statusValue] ?? 'border-border text-text-muted'}`}>
          {response.statusLabel}
        </span>
      </div>

      <div className="mt-4 border-y border-border py-4">
        <p className="text-xs text-text-subtle">{response.type === 'application' ? 'Job' : 'Company project'}</p>
        <p className="mt-1 break-words text-sm font-medium text-text-primary">{response.opportunityTitle}</p>
        <p className="mt-2 text-xs text-text-muted">Submitted {response.submittedAt}</p>
      </div>

      {response.type === 'proposal' && (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div><dt className="text-text-subtle">Proposed budget</dt><dd className="mt-1 break-words text-text-primary">{response.budget}</dd></div>
          <div><dt className="text-text-subtle">Duration</dt><dd className="mt-1 text-text-primary">{response.duration}</dd></div>
        </dl>
      )}

      <p className="mt-4 line-clamp-3 break-words text-sm leading-6 text-text-muted">{response.summary}</p>
      <Skills items={response.skills} />

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
        {response.candidateRoute && <Link to={response.candidateRoute} className="text-xs text-text-muted hover:text-primary">View profile</Link>}
        <Link to={response.opportunityRoute} className="text-xs text-text-muted hover:text-primary">View {response.type === 'application' ? 'job' : 'project'}</Link>
        <button type="button" onClick={() => onReview(response)} className="ml-auto rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast hover:bg-primary-hover">
          Review {response.type}
        </button>
      </div>
    </Card>
  )
}
