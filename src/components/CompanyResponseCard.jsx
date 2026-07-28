import { Link } from 'react-router'
import Card from './Card'

const statusClasses = {
  pending: 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
  under_review: 'border-[#60a5fa]/30 bg-[#60a5fa]/10 text-[#60a5fa]',
  shortlisted: 'border-[#c084fc]/30 bg-[#c084fc]/10 text-[#c084fc]',
  accepted: 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#4ade80]',
  rejected: 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#f87171]',
  withdrawn: 'border-[#233554] bg-[#0a192f]/50 text-[#8892b0]',
}

function Skills({ items }) {
  if (!items.length) return null
  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {items.slice(0, 4).map((skill) => (
        <span key={skill} className="rounded-full border border-[#233554] bg-[#0a192f]/70 px-2 py-1 font-mono text-[10px] text-[#64ffda]">
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
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64ffda]">{response.typeLabel}</p>
          <h3 className="mt-1 break-words text-lg font-semibold">{response.candidateName}</h3>
          <p className="mt-1 break-words text-sm text-[#8892b0]">{response.candidateHeadline || 'Headline not provided'}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses[response.statusValue] ?? 'border-[#233554] text-[#8892b0]'}`}>
          {response.statusLabel}
        </span>
      </div>

      <div className="mt-4 border-y border-[#233554] py-4">
        <p className="text-xs text-[#64748b]">{response.type === 'application' ? 'Job' : 'Company project'}</p>
        <p className="mt-1 break-words text-sm font-medium text-[#e6f1ff]">{response.opportunityTitle}</p>
        <p className="mt-2 text-xs text-[#8892b0]">Submitted {response.submittedAt}</p>
      </div>

      {response.type === 'proposal' && (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div><dt className="text-[#64748b]">Proposed budget</dt><dd className="mt-1 break-words text-[#e6f1ff]">{response.budget}</dd></div>
          <div><dt className="text-[#64748b]">Duration</dt><dd className="mt-1 text-[#e6f1ff]">{response.duration}</dd></div>
        </dl>
      )}

      <p className="mt-4 line-clamp-3 break-words text-sm leading-6 text-[#8892b0]">{response.summary}</p>
      <Skills items={response.skills} />

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
        {response.candidateRoute && <Link to={response.candidateRoute} className="text-xs text-[#8892b0] hover:text-[#64ffda]">View profile</Link>}
        <Link to={response.opportunityRoute} className="text-xs text-[#8892b0] hover:text-[#64ffda]">View {response.type === 'application' ? 'job' : 'project'}</Link>
        <button type="button" onClick={() => onReview(response)} className="ml-auto rounded-lg bg-[#64ffda] px-4 py-2.5 text-sm font-semibold text-[#071426] hover:bg-[#7dffe1]">
          Review {response.type}
        </button>
      </div>
    </Card>
  )
}
